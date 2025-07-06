from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    AppointmentDetailView,
    DoctorNotificationListView,
    RegisterView,
    UserDetailView,
    whoami,
    UserInfoView,
    UserListView,
    AvailabilityViewSet,
    AppointmentViewSet,
    DoctorProfileView,
    DoctorProfileDetail,
    doctor_patient_summaries,
    export_doctor_appointments,
    DoctorPublicProfileView,
)

router = DefaultRouter()
router.register(r'availabilities', AvailabilityViewSet, basename='availability')
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User info
    path('whoami/', whoami, name='whoami'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('user-info/', UserInfoView.as_view(), name='user-info'),

    # Doctor Profile
    path('doctor/profile/', DoctorProfileView.as_view(), name='doctor-profile'),
    path('doctor/profile/detail/', DoctorProfileDetail.as_view(), name='doctor-profile-detail'),
    path('doctor/notifications/', DoctorNotificationListView.as_view(), name='doctor-notifications'),
    path('appointments/<int:pk>/detail/', AppointmentDetailView.as_view(), name='appointment-detail'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('doctor/profile/<int:pk>/', DoctorPublicProfileView.as_view(), name='doctor-public-profile'),



    # Doctor tools
    path('doctor/patient-summaries/', doctor_patient_summaries, name='doctor-patient-summaries'),
    path('doctor/export-appointments/', export_doctor_appointments, name='export-doctor-appointments'),

    # Routers
    path('', include(router.urls)),
]
