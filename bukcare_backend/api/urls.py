from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    AppointmentDetailView,
    DoctorNotificationListView,
    RegisterView,
    UserDetailView,
    public_doctor_profile,
    public_doctor_search,
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
    doctor_dashboard_overview,
    ToggleAvailableOnCallView,
    CustomTokenObtainPairView,
    doctor_logout,
)

router = DefaultRouter()
router.register(r'availabilities', AvailabilityViewSet, basename='availability')
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User info
    path('whoami/', whoami, name='whoami'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('user-info/', UserInfoView.as_view(), name='user-info'),

    # Doctor Profile
    path('doctor/profile/', DoctorProfileView.as_view(), name='doctor-profile'),
    path('doctor/profile/detail/', DoctorProfileDetail.as_view(), name='doctor-profile-detail'),# urls.py
    path('doctor/notifications/', DoctorNotificationListView.as_view(), name='doctor-notifications'),
    path('appointments/<int:pk>/detail/', AppointmentDetailView.as_view(), name='appointment-detail'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('doctor/profile/<int:pk>/', DoctorPublicProfileView.as_view(), name='doctor-public-profile'),
    path('public/doctors/', public_doctor_search, name='public-doctor-search'),
    path('public/doctors/<int:id>/', public_doctor_profile, name='public-doctor-profile'),
    path('public/doctors/', public_doctor_search, name='public-doctor-search'),
    path('doctor/dashboard/overview/', doctor_dashboard_overview, name='doctor-dashboard-overview'),
    path('doctor/toggle-available/', ToggleAvailableOnCallView.as_view(), name='toggle-available-on-call'),
    path('doctor/logout/', doctor_logout, name='doctor-logout'),


    # Doctor tools
    path('doctor/patient-summaries/', doctor_patient_summaries, name='doctor-patient-summaries'),
    path('doctor/export-appointments/', export_doctor_appointments, name='export-doctor-appointments'),

    # Routers
    path('', include(router.urls)),
]
