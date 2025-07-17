from rest_framework import generics, viewsets, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Notification
from .serializers import AppointmentDetailSerializer, NotificationSerializer
from rest_framework.decorators import action

from django.http import HttpResponse
import csv

from .models import User, DoctorProfile, Availability, Appointment
from .serializers import UserSerializer, DoctorProfileSerializer, AvailabilitySerializer, AppointmentSerializer, PublicUserSerializer
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.db.models import Q
from datetime import date, timedelta
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.generics import ListAPIView


# ========== WHOAMI ==========
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def whoami(request):
    user = request.user
    return Response({
        'id': user.id,
        'email': user.email,
        'role': user.role
    })

# Search profile
def public_doctor_search(request):
    query = request.query_params.get('q', '')
    doctors = User.objects.filter(
        role='doctor'
    ).filter(
        Q(first_name__icontains=query) | Q(last_name__icontains=query) | Q(specialization__icontains=query)
    )
    serializer = UserSerializer(doctors, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_doctor_profile(request, id):
    try:
        doctor = User.objects.get(id=id, role='doctor')
    except User.DoesNotExist:
        return Response({'detail': 'Doctor not found'}, status=404)
    
    serializer = UserSerializer(doctor)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_doctor_search(request):
    query = request.GET.get('q', '')
    doctors = User.objects.filter(
        role='doctor'
    ).filter(
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(specialization__icontains=query)
    )
    serializer = UserSerializer(doctors, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_dashboard_overview(request):
    user = request.user
    if user.role != 'doctor':
        return Response({'detail': 'Unauthorized'}, status=403)

    today = date.today()

    # Get today's appointments
    todays_appointments = Appointment.objects.filter(doctor=user, availability__date=today).count()

    # Get next 5 upcoming availability slots
    upcoming_availability = Availability.objects.filter(
        doctor=user,
        date__gte=today
    ).order_by('date', 'start_time')[:5]

    availability_data = [
        {
            'date': slot.date,
            'start_time': slot.start_time,
            'end_time': slot.end_time
        }
        for slot in upcoming_availability
    ]

    # Get pending appointment requests
    pending_requests = Appointment.objects.filter(doctor=user, status='pending').count()

    return Response({
        'todays_appointments': todays_appointments,
        'upcoming_availability': availability_data,
        'pending_requests': pending_requests
    })


# ========== AUTH & USER ==========
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserSerializer

class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "role": user.role
        })

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        role = self.request.query_params.get('role')
        if role:
            return User.objects.filter(role=role)
        return User.objects.all()
    
class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]



# ========== AVAILABILITY ==========
class AvailabilityViewSet(viewsets.ModelViewSet):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        availability = serializer.save(doctor=self.request.user)
        repeat = serializer.validated_data.get('repeat', 'none')
        repeat_until = serializer.validated_data.get('repeat_until')

        if repeat != 'none' and repeat_until:
            interval = timedelta(weeks=1 if repeat == 'weekly' else 2)
            current_date = availability.date + interval

            while current_date <= repeat_until:
                Availability.objects.create(
                    doctor=self.request.user,
                    date=current_date,
                    start_time=availability.start_time,
                    end_time=availability.end_time,
                    repeat='none',  # cloned instances do not repeat again
                )
                current_date += interval


# ========== APPOINTMENTS ==========
class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role == 'patient':
            availability = serializer.validated_data['availability']
            serializer.save(
                patient=self.request.user,
                doctor=availability.doctor
            )
        else:
            serializer.save()

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return Appointment.objects.filter(patient=user)
        elif user.role == 'doctor':
            return Appointment.objects.filter(doctor=user)
        elif user.role == 'staff':
            return Appointment.objects.all()
        return Appointment.objects.none()

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user

        # Allow update if staff OR the doctor who owns the appointment
        if user.role == 'staff' or (user.role == 'doctor' and instance.doctor == user):
            return super().partial_update(request, *args, **kwargs)

        return Response({'detail': 'Forbidden'}, status=403)


    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        new_availability_id = request.data.get('availability')

        # Only track if availability has changed
        if str(instance.availability.id) != str(new_availability_id):
            from .models import RescheduleRecord
            RescheduleRecord.objects.create(
                appointment=instance,
                previous_date=instance.availability.date,
                previous_start_time=instance.availability.start_time,
                previous_end_time=instance.availability.end_time,
            )

        return super().update(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    def detail(self, request, pk=None):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='history', url_name='history')
    def history(self, request):
        if request.user.role != 'doctor':
            return Response({'detail': 'Unauthorized'}, status=403)

        appointments = Appointment.objects.filter(
            doctor=request.user,
            status__in=['approved', 'cancelled', 'declined']
        ).order_by('-availability__date')

        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
    

    @action(detail=False, methods=['get'], url_path='export', permission_classes=[IsAuthenticated])
    def export_appointments(self, request):
        if request.user.role != 'doctor':
            return Response({'detail': 'Forbidden'}, status=403)

        appointments = Appointment.objects.filter(doctor=request.user)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="appointments.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Date', 'Start Time', 'End Time',
            'Patient Email', 'Status', 'Triage Status', 'Reason'
        ])

        for appt in appointments:
            writer.writerow([
                appt.availability.date,
                appt.availability.start_time,
                appt.availability.end_time,
                appt.patient.email,
                appt.status,
                appt.triage_status or '',
                appt.reason or ''
            ])

        return response
    

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user

        # Doctor can update triage_status
        if user.role == 'doctor' and 'triage_status' in request.data:
            instance.triage_status = request.data['triage_status']
            instance.save()
            return Response(self.get_serializer(instance).data)

        # Allow staff or doctor to update normal stuff
        if user.role == 'staff' or (user.role == 'doctor' and instance.doctor == user):
            return super().partial_update(request, *args, **kwargs)

        return Response({'detail': 'Forbidden'}, status=403)
    
    @action(detail=True, methods=['get'])
    def detail(self, request, pk=None):
        appt = self.get_object()
        serializer = AppointmentDetailSerializer(appt)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        user = request.user
        if user.role != 'doctor':
            return Response({'detail': 'Forbidden'}, status=403)

        today = date.today()
        appointments = Appointment.objects.filter(
            doctor=user,
            availability__date=today,
            status__in=['approved', 'pending']
        ).order_by('availability__start_time')

        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)



# ========== DOCTOR PROFILE ==========
class DoctorProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class DoctorProfileDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = DoctorProfile.objects.get_or_create(user=request.user)
        serializer = DoctorProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, _ = DoctorProfile.objects.get_or_create(user=request.user)
        serializer = DoctorProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


# ========== EXPORT APPOINTMENT HISTORY ==========
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_doctor_appointments(request):
    user = request.user
    if user.role != 'doctor':
        return Response({'detail': 'Unauthorized'}, status=403)

    appointments = Appointment.objects.filter(
        doctor=user,
        status__in=['cancelled', 'declined'],
    ) | Appointment.objects.filter(
        doctor=user,
        triage_status__in=['done', 'no_show']
    )

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="appointment_history.csv"'

    writer = csv.writer(response)
    writer.writerow(['Patient Email', 'Date', 'Time', 'Status', 'Triage', 'Reason'])

    for appt in appointments.select_related('patient', 'availability'):
        date = appt.availability.date
        time = f"{appt.availability.start_time} - {appt.availability.end_time}"
        writer.writerow([
            appt.patient.email,
            date,
            time,
            appt.status,
            appt.triage_status or '',
            appt.reason or '',
        ])

    return response


# ========== PATIENT SUMMARIES ==========
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_patient_summaries(request):
    user = request.user
    if user.role != 'doctor':
        return Response({'detail': 'Forbidden'}, status=403)

    patient_ids = Appointment.objects.filter(doctor=user).values_list('patient', flat=True).distinct()
    patients = User.objects.filter(id__in=patient_ids)

    result = []
    for patient in patients:
        appts = Appointment.objects.filter(patient=patient, doctor=user).select_related('availability')
        result.append({
            'id': patient.id,
            'email': patient.email,
            'appointments': [{
                'id': a.id,
                'date': a.availability.date,
                'start_time': a.availability.start_time,
                'end_time': a.availability.end_time,
                'reason': a.reason,
                'status': a.status,
                'triage_status': a.triage_status,
            } for a in appts]
        })

    return Response(result)



class DoctorNotificationListView(ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
class AppointmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            appt = Appointment.objects.select_related('availability', 'patient').prefetch_related('reschedules').get(pk=pk)
            if request.user != appt.doctor:
                return Response({'detail': 'Forbidden'}, status=403)

            serializer = AppointmentDetailSerializer(appt)
            return Response(serializer.data)
        except Appointment.DoesNotExist:
            return Response({'detail': 'Not found'}, status=404)



class DoctorPublicProfileView(RetrieveAPIView):
    queryset = User.objects.filter(role='doctor')
    serializer_class = PublicUserSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]



class ToggleAvailableOnCallView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if user.role != 'doctor':
            return Response({'detail': 'Forbidden'}, status=403)

        is_available = request.data.get('is_available_on_call')
        if is_available is not None:
            user.is_available_on_call = is_available
            user.save()
            return Response({'is_available_on_call': user.is_available_on_call})
        else:
            return Response({'detail': 'Missing is_available_on_call in request'}, status=400)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # Set doctor to available when logged in
        user = self.user
        if user.role == 'doctor':
            user.is_available_on_call = True
            user.save(update_fields=['is_available_on_call'])

        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def doctor_logout(request):
    user = request.user
    if user.role == 'doctor':
        user.is_available_on_call = False
        user.save(update_fields=['is_available_on_call'])
    return Response({'detail': 'Logged out and marked offline.'})
