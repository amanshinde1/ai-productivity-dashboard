from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from django.contrib.auth import get_user_model
from django.db.models import Q, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from datetime import timedelta
from .ai_helper import suggest_task_for_user
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Import serializers and models
from .serializers import (
    UserSerializer,
    UserRegisterSerializer,
    ChangePasswordSerializer,
    NotificationSerializer,
    TaskSerializer,
    CategorySerializer,
    AppWebsiteSerializer,
    ProjectSerializer,
)
from .models import Notification, Task, Category, AppWebsite, Project

User = get_user_model()
logger = logging.getLogger(__name__)

# --- Authentication and User Management Views ---

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def hello_world(request):
    return Response({'message': 'Hello, world!'})

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data.get('old_password')):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data.get('new_password'))
            user.save()
            return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@csrf_exempt
@permission_classes([permissions.AllowAny])
def request_password_reset(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Return success message regardless to avoid user enumeration
        return JsonResponse({'message': 'If an account with that email exists, a password reset link has been sent.'}, status=200)

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

    subject = 'Password Reset Request'
    # Plain text message without template
    message = (
        f"Hello {user.username},\n\n"
        "You have requested to reset your password. Use the link below to reset it:\n\n"
        f"{reset_link}\n\n"
        "If you did not request this, please ignore this email.\n\n"
        "Thank you!"
    )

    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
    except Exception as e:
        logger.error(f"Error sending password reset email to {user.email}: {e}")
        return JsonResponse({'message': 'Error sending password reset email. Please try again later.'}, status=500)

    return JsonResponse({'message': 'If an account with that email exists, a password reset link has been sent.'}, status=200)

@api_view(['POST'])
@csrf_exempt
@permission_classes([permissions.AllowAny])
def confirm_password_reset(request):
    uidb64 = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')

    try:
        uid_bytes = urlsafe_base64_decode(uidb64)
        uid = uid_bytes.decode() if isinstance(uid_bytes, bytes) else uid_bytes
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError

        try:
            validate_password(new_password, user=user)
        except ValidationError as e:
            return JsonResponse({"new_password": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return JsonResponse({'message': 'Password has been reset successfully.'}, status=200)
    else:
        return JsonResponse({'message': 'The reset link is invalid or has expired.'}, status=400)

# --- Task Management Views ---

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_tasks = self.queryset.filter(user=self.request.user)
        search_query = self.request.query_params.get('search', None)
        if search_query:
            user_tasks = user_tasks.filter(Q(title__icontains=search_query) | Q(description__icontains=search_query))

        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            user_tasks = user_tasks.filter(status=status_filter.upper())

        priority_filter = self.request.query_params.get('priority', None)
        if priority_filter:
            try:
                priority_filter = int(priority_filter)
                user_tasks = user_tasks.filter(priority=priority_filter)
            except ValueError:
                pass

        due_date_today_param = self.request.query_params.get('due_date_today', None)
        if due_date_today_param and due_date_today_param.lower() == 'true':
            today = timezone.now().date()
            user_tasks = user_tasks.filter(due_date=today)

        return user_tasks.order_by('due_date', 'priority', '-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

# --- Notification Views ---

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def read(self, request, pk=None):
        notification = self.get_object()
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=['is_read', 'read_at'])
        serializer = self.get_serializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)

# --- Category Views ---

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# --- AppWebsite Views ---

class AppWebsiteViewSet(viewsets.ModelViewSet):
    queryset = AppWebsite.objects.all()
    serializer_class = AppWebsiteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# --- Project Views ---

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# --- AI Suggestion Views ---

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def suggest_task(request):
    try:
        suggestion = suggest_task_for_user(request.user)
        return Response({
            "title": suggestion,
            "description": "AI-generated productivity suggestion",
            "priority": 2,
            "category": "GENERAL"  # Adjust as per your model - if foreign key, send appropriate ID
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error generating AI task suggestion for user {request.user.username}: {e}", exc_info=True)
        return Response({
            "detail": "Failed to generate AI task suggestion due to an internal server error. Check backend logs for details."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticatedOrReadOnly])
def get_ai_suggestion(request):
    user = request.user if request.user.is_authenticated else None
    suggestion = suggest_task_for_user(user)
    return Response(suggestion)

# --- Dashboard Metrics View ---

class DashboardMetricsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)

        try:
            work_category = Category.objects.get(user=user, name='Work')
            focus_category = Category.objects.get(user=user, name='Focus')
            work_category_id = work_category.id
            focus_category_id = focus_category.id
        except Category.DoesNotExist:
            work_category_id = None
            focus_category_id = None

        completed_tasks_today = Task.objects.filter(
            user=user,
            status='DONE',
            updated_at__date=today,
            duration_minutes__isnull=False
        )
        completed_tasks_yesterday = Task.objects.filter(
            user=user,
            status='DONE',
            updated_at__date=yesterday,
            duration_minutes__isnull=False
        )

        total_work_minutes_today = 0
        if work_category_id:
            total_work_minutes_today += completed_tasks_today.filter(
                category=work_category_id
            ).aggregate(Sum('duration_minutes'))['duration_minutes__sum'] or 0
        if focus_category_id:
            total_work_minutes_today += completed_tasks_today.filter(
                category=focus_category_id
            ).aggregate(Sum('duration_minutes'))['duration_minutes__sum'] or 0

        work_hours_display = {
            "hours": total_work_minutes_today // 60,
            "minutes": total_work_minutes_today % 60
        }

        total_work_minutes_yesterday = 0
        if work_category_id:
            total_work_minutes_yesterday += completed_tasks_yesterday.filter(
                category=work_category_id
            ).aggregate(Sum('duration_minutes'))['duration_minutes__sum'] or 0
        if focus_category_id:
            total_work_minutes_yesterday += completed_tasks_yesterday.filter(
                category=focus_category_id
            ).aggregate(Sum('duration_minutes'))['duration_minutes__sum'] or 0

        work_hours_trend = "neutral"
        if total_work_minutes_today > total_work_minutes_yesterday:
            work_hours_trend = "increase"
        elif total_work_minutes_today < total_work_minutes_yesterday:
            work_hours_trend = "decrease"

        daily_target_minutes = 480
        percent_of_target = (total_work_minutes_today / daily_target_minutes) * 100 if daily_target_minutes > 0 else 0
        percent_of_target = round(min(percent_of_target, 100))

        focus_minutes_today = 0
        if focus_category_id:
            focus_minutes_today = completed_tasks_today.filter(
                category=focus_category_id
            ).aggregate(Sum('duration_minutes'))['duration_minutes__sum'] or 0

        focus_percent = (focus_minutes_today / total_work_minutes_today * 100) if total_work_minutes_today > 0 else 0
        focus_percent = round(focus_percent)

        daily_summary_minutes_by_category = completed_tasks_today.values('category__name').annotate(
            minutes=Coalesce(Sum('duration_minutes'), 0)
        ).order_by('category__name')

        daily_summary_data = {
            'labels': [item['category__name'] for item in daily_summary_minutes_by_category if item['category__name']],
            'data': [item['minutes'] for item in daily_summary_minutes_by_category],
        }

        productive_apps_today = completed_tasks_today.values('app_website__name').annotate(
            minutes=Coalesce(Sum('duration_minutes'), 0)
        ).order_by('-minutes')[:5]

        productive_apps = [{
            "name": item['app_website__name'],
            "minutes": item['minutes']
        } for item in productive_apps_today if item['app_website__name']]

        ai_insights = []

        try:
            suggested_task = suggest_task_for_user(user)
            if suggested_task:
                ai_insights.append({
                    "icon": "Lightbulb",
                    "text": f"AI suggests: {suggested_task}"
                })
        except Exception as e:
            ai_insights.append({
                "icon": "Lightbulb",
                "text": "AI is unable to generate a suggestion at this time."
            })
            logger.error(f"Error calling AI helper: {e}", exc_info=True)

        if total_work_minutes_today > 0:
            if work_hours_trend == "increase":
                ai_insights.append({
                    "icon": "TrendingUp",
                    "text": "You're building momentum! Keep up the great work."
                })
            elif work_hours_trend == "decrease":
                ai_insights.append({
                    "icon": "TrendingDown",
                    "text": "A slightly slower day, consider a short break to recharge."
                })
            else:
                ai_insights.append({
                    "icon": "CheckCircle",
                    "text": "Your productivity is consistent today. Great job!"
                })
        else:
            ai_insights.append({
                "icon": "Info",
                "text": "Complete a task to get your first insight!"
            })

        tasks_due_today_count = Task.objects.filter(
            user=user,
            due_date=today,
            status='PENDING'
        ).count()

        if tasks_due_today_count > 0:
            ai_insights.append({
                "icon": "Clock",
                "text": f"You have {tasks_due_today_count} tasks due today. Prioritize wisely!"
            })

        response_data = {
            "workHours": work_hours_display,
            "workHoursTrend": work_hours_trend,
            "percentOfTarget": percent_of_target,
            "focusPercent": focus_percent,
            "dailySummary": daily_summary_data,
            "productiveApps": productive_apps,
            "aiInsights": ai_insights,
            "tasksDueToday": tasks_due_today_count
        }

        return Response(response_data, status=status.HTTP_200_OK)


# --- Cookie-based Authentication Views (Optional) ---

class CookieTokenObtainView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = TokenObtainPairView.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        tokens = serializer.validated_data
        response = Response()
        response.set_cookie(
            key='access_token',
            value=tokens['access'],
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()
        )
        response.set_cookie(
            key='refresh_token',
            value=tokens['refresh'],
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()
        )
        response.data = {'message': 'Login successful'}
        return response

class CookieTokenRefreshView(APIView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({'error': 'No refresh token provided'}, status=401)
        serializer = TokenRefreshView.serializer_class(data={'refresh': refresh_token})
        serializer.is_valid(raise_exception=True)
        response = Response()
        response.set_cookie(
            key='access_token',
            value=serializer.validated_data['access'],
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()
        )
        response.data = {'message': 'Token refreshed'}
        return response

class CookieLogoutView(APIView):
    def post(self, request, *args, **kwargs):
        response = Response()
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        response.data = {'message': 'Logged out'}
        return response

class MyTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        print('MyTokenObtainPairView POST called with:', request.data)
        return super().post(request, *args, **kwargs)
