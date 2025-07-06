from rest_framework import serializers
from .models import DoctorProfile, RescheduleRecord, User
from .models import Availability, Appointment
from .models import Notification

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'password',  # 👈 add this
            'first_name', 'last_name', 'role',
            'contact_number', 'specialization', 'specialization_verified',
            'profile_photo'
        ]
        read_only_fields = ['specialization_verified']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    
class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ['id', 'doctor', 'date', 'start_time', 'end_time']
        read_only_fields = ['doctor']

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'doctor', 'availability',
            'status', 'triage_status', 'reason', 'created_at',
            'patient_name', 'doctor_name'
        ]
        read_only_fields = ['patient', 'doctor', 'created_at']

    def get_patient_name(self, obj):
        user = getattr(obj, 'patient', None)
        if user and hasattr(user, 'email'):
            return user.email
        return "Unknown"

    def get_doctor_name(self, obj):
        user = getattr(obj, 'doctor', None)
        if user and hasattr(user, 'email'):
            return f"Dr. {user.email}"
        return "Unknown"


class DoctorProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        fields = [
            'email', 'name',
            'contact_number', 'specialization',
            'specialization_verified', 'profile_photo'
        ]
        read_only_fields = ['specialization_verified']

    def get_name(self, obj):
        return f"{obj.user.first_name or ''} {obj.user.last_name or ''}".strip()
        

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class RescheduleRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = RescheduleRecord
        fields = ['previous_date', 'previous_start_time', 'previous_end_time', 'changed_at']


class AppointmentDetailSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    reschedules = RescheduleRecordSerializer(many=True, read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient_name', 'status', 'triage_status', 'reason',
            'availability', 'reschedules'
        ]

    def get_patient_name(self, obj):
        return obj.patient.email  # Or use a full name if available
    

class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'specialization',
            'specialization_verified',
            'profile_photo',
        ]
