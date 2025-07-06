from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone
from cloudinary.models import CloudinaryField  # ✅ Add this import

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, role='patient', **extra_fields):
        if not email:
            raise ValueError("Kinahanglan valid emain buang")
        email = self.normalize_email(email)
        user = self.model(email=email, role=role, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('doctor', 'Doctor'),
        ('staff', 'Staff'),
        ('patient', 'Patient'),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    specialization = models.CharField(max_length=100, blank=True, null=True)
    specialization_verified = models.BooleanField(default=False)

    # ✅ Changed to store plain Cloudinary image URL
    profile_photo = models.URLField(blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['role']

    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"

class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    contact_number = models.CharField(max_length=20, blank=True)
    specialization = models.CharField(max_length=100, blank=True)
    specialization_verified = models.BooleanField(default=False)

    # ✅ Changed to store plain Cloudinary image URL
    profile_photo = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.user.email

class StaffProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

class Availability(models.Model):
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'doctor'})
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.doctor.email} | {self.date} | {self.start_time}-{self.end_time}"

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('declined', 'Declined'),
        ('cancelled', 'Cancelled'),
    ]

    TRIAGE_CHOICES = [
        ('waiting', 'Waiting'),
        ('in_consultation', 'In Consultation'),
        ('done', 'Done'),
        ('no_show', 'No-show'),
    ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    triage_status = models.CharField(max_length=20, choices=TRIAGE_CHOICES, default='waiting', blank=True, null=True)
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments', limit_choices_to={'role': 'patient'})
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments_received', limit_choices_to={'role': 'doctor'})
    availability = models.ForeignKey(Availability, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.email} → {self.doctor.email} | {self.status}"

class Notification(models.Model):
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'doctor'})
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"To {self.doctor.email} - {self.message[:30]}"

class RescheduleRecord(models.Model):
    appointment = models.ForeignKey('Appointment', on_delete=models.CASCADE, related_name='reschedules')
    previous_date = models.DateField()
    previous_start_time = models.TimeField()
    previous_end_time = models.TimeField()
    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rescheduled on {self.changed_at.date()}"
