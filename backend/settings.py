import os
from pathlib import Path
from datetime import timedelta
import dj_database_url  # Make sure this is in requirements.txt!

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY: Do NOT hardcode secrets. Pull from environment on Render!
SECRET_KEY = os.environ.get('SECRET_KEY', 'unsafe-default-key-for-dev')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'  # 'False' in prod, 'True' in dev

# Comma-separated string (e.g. "your-backend.onrender.com,localhost")
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost').split(',')

# URL for password reset emails
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_extensions',  # Only if in requirements.txt!
    'corsheaders',
    'rest_framework',
    'api',
    'rest_framework_simplejwt',
    'django.contrib.postgres',
    # Remove 'sslserver' in production!
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first for CORS headers
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# USE DATABASE_URL FROM ENVIRONMENT (recommended for Render)
DATABASES = {
    'default': dj_database_url.config(default=os.environ.get("DATABASE_URL")),
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# STATIC FILES CONFIG FOR RENDER
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'api.pagination.SafePageNumberPagination',
    'PAGE_SIZE': 3,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS AND CSRF: ALLOW PROD FRONTEND ON RENDER!
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    # Add your Render static site URL here after deployment, e.g.:
    # "https://prodexa-frontend.onrender.com",
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    # Add your Render static site URL here after deployment, e.g.:
    # "https://prodexa-frontend.onrender.com",
]

# SECURITY: Uncomment for HTTPS once SSL is active
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True

# EMAIL setup (adjust for production as needed)
EMAIL_BACKEND = os.environ.get("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "no-reply@yourapp")

# Load environment variables from local .env (for dev only)
from dotenv import load_dotenv
load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
