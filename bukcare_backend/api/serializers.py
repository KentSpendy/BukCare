from rest_framework import serializers
from .models import DoctorProfile, RescheduleRecord, User
from .models import Availability, Appointment, Notification


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'password',
            'first_name', 'last_name', 'role',
            'contact_number', 'specialization', 'specialization_verified',
            'profile_photo', 'is_available_on_call',
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
        fields = ['id', 'doctor', 'date', 'start_time', 'end_time', 'repeat', 'repeat_until']
        read_only_fields = ['doctor']


class AppointmentSerializer(serializers.ModelSerializer):
    # Used during creation
    availability_id = serializers.PrimaryKeyRelatedField(
        source='availability',
        queryset=Availability.objects.all(),
        write_only=True
    )

    # Used during read
    availability_date = serializers.SerializerMethodField()
    availability_start_time = serializers.SerializerMethodField()
    availability_end_time = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'status', 'triage_status', 'reason', 'created_at',
            'availability_id',  # for POST
            'availability_date', 'availability_start_time', 'availability_end_time',
            'patient', 'doctor',
            'patient_name', 'doctor_name',
        ]
        read_only_fields = ['created_at', 'patient', 'doctor']

    def get_availability_date(self, obj):
        return obj.availability.date if obj.availability else None

    def get_availability_start_time(self, obj):
        return obj.availability.start_time if obj.availability else None

    def get_availability_end_time(self, obj):
        return obj.availability.end_time if obj.availability else None

    def get_patient_name(self, obj):
        if obj.patient:
            full_name = f"{obj.patient.first_name} {obj.patient.last_name}".strip()
            return full_name if full_name else obj.patient.email
        return "Unknown"

    def get_doctor_name(self, obj):
        if obj.doctor:
            full_name = f"{obj.doctor.first_name} {obj.doctor.last_name}".strip()
            return f"Dr. {full_name}" if full_name else f"Dr. {obj.doctor.email}"
        return "Unknown"


class RescheduleRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = RescheduleRecord
        fields = ['previous_date', 'previous_start_time', 'previous_end_time', 'changed_at']

class AppointmentDetailSerializer(serializers.ModelSerializer):
    availability = AvailabilitySerializer()
    patient_name = serializers.SerializerMethodField()
    reschedules = RescheduleRecordSerializer(many=True, read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient_name', 'status', 'triage_status', 'reason',
            'availability', 'reschedules'
        ]

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}" if obj.patient else "Unknown"


class DoctorProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        fields = [
            'email', 'name',
            'contact_number', 'specialization',
            'specialization_verified', 'profile_photo',
            'is_available_on_call',
        ]
        read_only_fields = ['specialization_verified']

    def get_name(self, obj):
        return f"{obj.user.first_name or ''} {obj.user.last_name or ''}".strip()


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


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
            'is_available_on_call',
        ]
