# api/urls.py
from django.urls import path, include
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.reverse import reverse as drf_reverse
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.permissions import AllowAny
from rest_framework.routers import DefaultRouter

# Local imports from views.py
from .views import (
    hello_world,
    RegisterView,
    user_profile,
    ChangePasswordView,
    request_password_reset,
    confirm_password_reset,
    suggest_task,
    DashboardMetricsView,
    TaskViewSet,
    NotificationViewSet,
    CategoryViewSet,
    AppWebsiteViewSet,
    ProjectViewSet,
    MyTokenObtainPairView,
    get_ai_suggestion,   
)

# Optional test token view class
class TestTokenObtainPairView(MyTokenObtainPairView):
    permission_classes = [AllowAny]


# Custom API root providing hyperlinked endpoints
class CustomAPIRoot(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, format=None):
        return Response({
            'hello_world': drf_reverse('hello_world', request=request, format=format),
            'register': drf_reverse('register', request=request, format=format),
            'token_obtain': drf_reverse('token_obtain_pair', request=request, format=format),
            'token_refresh': drf_reverse('token_refresh', request=request, format=format),
            'user_profile': drf_reverse('user_profile', request=request, format=format),
            'change_password': drf_reverse('change_password', request=request, format=format),
            'password_reset_request': drf_reverse('password_reset_request', request=request, format=format),
            'password_reset_confirm': drf_reverse('password_reset_confirm', request=request, format=format),
            'ai_suggest': drf_reverse('ai_suggest', request=request, format=format),
            'dashboard_metrics': drf_reverse('dashboard_metrics', request=request, format=format),
            'tasks': drf_reverse('task-list', request=request, format=format),
            'notifications': drf_reverse('notification-list', request=request, format=format),
            'categories': drf_reverse('category-list', request=request, format=format),
            'app_websites': drf_reverse('appwebsite-list', request=request, format=format),
            'projects': drf_reverse('project-list', request=request, format=format),
        })


# DRF router for viewsets
router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'app-websites', AppWebsiteViewSet, basename='appwebsite')
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [
    # API Root
    path('', CustomAPIRoot.as_view(), name='api-root'),

    # Router URLs
    path('', include(router.urls)),

    # Public endpoints
    path('hello/', hello_world, name='hello_world'),
    path('register/', RegisterView.as_view(), name='register'),

    # JWT auth endpoints
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User-related endpoints
    path('users/me/', user_profile, name='user_profile'),
    path('users/me/change-password/', ChangePasswordView.as_view(), name='change_password'),

    # Password reset endpoints
    path('password-reset/request/', request_password_reset, name='password_reset_request'),
    path('password-reset/confirm/', confirm_password_reset, name='password_reset_confirm'),

    # AI suggestion endpoints
    path('ai/suggest/', suggest_task, name='ai_suggest'),
    path('ai-suggestion/', get_ai_suggestion, name='ai-suggestion'),  

    # Dashboard metrics
    path('dashboard-metrics/', DashboardMetricsView.as_view(), name='dashboard_metrics'),

    # Optional test token endpoint
    # path('test-token/', TestTokenObtainPairView.as_view(), name='test_token_obtain_pair'),
]
