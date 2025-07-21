from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, PatientProfile, DoctorProfile, StaffProfile, Appointment, Notification
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'patient':
            PatientProfile.objects.create(user=instance)
        elif instance.role == 'doctor':
            DoctorProfile.objects.create(user=instance)
        elif instance.role == 'staff':
            StaffProfile.objects.create(user=instance)

@receiver(post_save, sender=Appointment)
def notify_doctor_on_request(sender, instance, created, **kwargs):
    if created and instance.status == 'pending':
        # 1. Create a notification in the database
        Notification.objects.create(
            user=instance.doctor,
            message=f"{instance.patient.first_name} requested an appointment."
        )

        # 2. Broadcast via WebSocket (real-time push)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'doctor_{instance.doctor.id}',  # group name
            {
                "type": "send_notification",
                "message": f"🩺 New appointment request from {instance.patient.first_name}"
            }
        )
