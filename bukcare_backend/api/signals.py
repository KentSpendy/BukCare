from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, PatientProfile, DoctorProfile, StaffProfile

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'patient':
            PatientProfile.objects.create(user=instance)
        elif instance.role == 'doctor':
            DoctorProfile.objects.create(user=instance)
        elif instance.role == 'staff':
            StaffProfile.objects.create(user=instance)
