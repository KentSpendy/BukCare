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
        serializer.save(doctor=self.request.user)


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



class DoctorNotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'doctor':
            return Response({'detail': 'Unauthorized'}, status=403)

        notifications = Notification.objects.filter(doctor=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    
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