# backend/urls.py
from django.urls import path, include
from django.contrib import admin
from django.views.generic import RedirectView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),

    # JWT authentication endpoints (safe to uncomment)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Redirect root to API hello endpoint
    path('', RedirectView.as_view(url='/api/hello/', permanent=False)),
]
