# api/tests.py

import json
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from datetime import timedelta
from django.utils import timezone
from unittest.mock import patch

# Import for password reset token and encoding
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

# Import models and serializers
from .models import Task, Category, AppWebsite, Project
from .serializers import UserRegisterSerializer, ChangePasswordSerializer

User = get_user_model()


class AuthenticationTests(TestCase):
    """
    Tests for user authentication and management endpoints.
    """

    def setUp(self):
        self.client = Client()
        self.username = "testuser"
        self.email = "test@example.com"
        self.password = "StrongPass123!"
        self.user = User.objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password
        )
        # Obtain JWT token for the test user
        response = self.client.post(
            reverse('token_obtain_pair'),
            {'username': self.username, 'password': self.password},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.access_token = response.json()['access']
        self.refresh_token = response.json()['refresh']
        self.client.defaults['HTTP_AUTHORIZATION'] = f'Bearer {self.access_token}'

    def test_hello_world_endpoint(self):
        original_auth = self.client.defaults.get('HTTP_AUTHORIZATION', '')
        self.client.defaults['HTTP_AUTHORIZATION'] = ''
        response = self.client.get(reverse('hello_world'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {'message': 'Hello, world!'})
        self.client.defaults['HTTP_AUTHORIZATION'] = original_auth

    def test_user_registration(self):
        original_auth = self.client.defaults.get('HTTP_AUTHORIZATION', '')
        self.client.defaults['HTTP_AUTHORIZATION'] = ''
        new_user_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'AnotherStrongPass456!',
            'password2': 'AnotherStrongPass456!'
        }
        response = self.client.post(reverse('register'), json.dumps(new_user_data), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())
        self.client.defaults['HTTP_AUTHORIZATION'] = original_auth

    def test_user_registration_invalid_data(self):
        original_auth = self.client.defaults.get('HTTP_AUTHORIZATION', '')
        self.client.defaults['HTTP_AUTHORIZATION'] = ''
        invalid_user_data = {
            'username': 'invaliduser',
            'email': 'invalid@example.com',
            'password': 'short',
            'password2': 'short'
        }
        response = self.client.post(reverse('register'), json.dumps(invalid_user_data), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.json())
        self.client.defaults['HTTP_AUTHORIZATION'] = original_auth

    def test_user_profile_get_authenticated(self):
        response = self.client.get(reverse('user_profile'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['username'], self.username)
        self.assertEqual(response.json()['email'], self.email)

    def test_user_profile_get_unauthenticated(self):
        original_auth = self.client.defaults.get('HTTP_AUTHORIZATION', '')
        self.client.defaults['HTTP_AUTHORIZATION'] = ''
        response = self.client.get(reverse('user_profile'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.client.defaults['HTTP_AUTHORIZATION'] = original_auth

    def test_user_profile_update_authenticated(self):
        updated_data = {'email': 'updated@example.com'}
        response = self.client.put(reverse('user_profile'), json.dumps(updated_data), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'updated@example.com')

    def test_change_password_success(self):
        change_password_data = {
            'old_password': self.password,
            'new_password': 'NewStrongPassword123!',
            'confirm_password': 'NewStrongPassword123!'  # Required by serializer
        }
        response = self.client.put(reverse('change_password'), json.dumps(change_password_data), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewStrongPassword123!'))

    def test_change_password_wrong_old_password(self):
        change_password_data = {
            'old_password': 'WrongPassword!',
            'new_password': 'NewStrongPassword123!',
            'confirm_password': 'NewStrongPassword123!'  # Required by serializer
        }
        response = self.client.put(reverse('change_password'), json.dumps(change_password_data), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('old_password', response.json())

    @patch('api.views.send_mail')
    @patch('api.views.render_to_string')
    def test_request_password_reset(self, mock_render_to_string, mock_send_mail):
        original_auth = self.client.defaults.get('HTTP_AUTHORIZATION', '')
        self.client.defaults['HTTP_AUTHORIZATION'] = ''

        mock_render_to_string.return_value = "Mock email content"

        response = self.client.post(reverse('request_password_reset'), json.dumps({'email': self.email}), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.json())
        mock_send_mail.assert_called_once()
        mock_render_to_string.assert_called_once()

        self.client.defaults['HTTP_AUTHORIZATION'] = original_auth

    def test_confirm_password_reset_success(self):
        original_auth = self.client.defaults.get('HTTP_AUTHORIZATION', '')
        self.client.defaults['HTTP_AUTHORIZATION'] = ''

        token = default_token_generator.make_token(self.user)
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))

        reset_data = {
            'uid': uidb64 if isinstance(uidb64, str) else uidb64.decode('utf-8'),
            'token': token,
            'new_password': 'NewResetPassword123!'
        }
        response = self.client.post(reverse('confirm_password_reset'), json.dumps(reset_data), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewResetPassword123!'))

        self.client.defaults['HTTP_AUTHORIZATION'] = original_auth

    def test_confirm_password_reset_invalid_token(self):
        original_auth = self.client.defaults.get('HTTP_AUTHORIZATION', '')
        self.client.defaults['HTTP_AUTHORIZATION'] = ''

        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        reset_data = {
            'uid': uidb64 if isinstance(uidb64, str) else uidb64.decode('utf-8'),
            'token': 'invalidtoken',
            'new_password': 'NewResetPassword123!'
        }
        response = self.client.post(reverse('confirm_password_reset'), json.dumps(reset_data), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', response.json())

        self.client.defaults['HTTP_AUTHORIZATION'] = original_auth


class TaskViewSetTests(TestCase):
    """
    Tests for the TaskViewSet.
    """

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='taskuser', email='task@example.com', password='password123')
        response = self.client.post(
            reverse('token_obtain_pair'),
            {'username': 'taskuser', 'password': 'password123'},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.access_token = response.json()['access']
        self.client.defaults['HTTP_AUTHORIZATION'] = f'Bearer {self.access_token}'

        self.category = Category.objects.create(user=self.user, name='Work')
        self.app_website = AppWebsite.objects.create(user=self.user, name='Browser')

    def test_create_task(self):
        task_data = {
            'title': 'New Test Task',
            'description': 'Description for new task',
            'status': 'PENDING',
            'priority': 1,
            'due_date': timezone.now().date().isoformat(),
            'category': self.category.id,
            'app_website': self.app_website.id,
            'duration_minutes': 60
        }
        response = self.client.post(reverse('task-list'), json.dumps(task_data), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)
        self.assertEqual(Task.objects.get().title, 'New Test Task')

    def test_list_tasks(self):
        Task.objects.create(user=self.user, title='Task 1', status='PENDING', priority=1, due_date=timezone.now().date())
        Task.objects.create(user=self.user, title='Task 2', status='DONE', priority=2, due_date=timezone.now().date())

        other_user = User.objects.create_user(username='otheruser', email='other@example.com', password='password123')
        Task.objects.create(user=other_user, title='Other User Task', status='PENDING', priority=1, due_date=timezone.now().date())

        response = self.client.get(reverse('task-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 2)  # Should only see tasks for 'taskuser'

    def test_retrieve_task(self):
        task = Task.objects.create(user=self.user, title='Single Task', status='PENDING', priority=1, due_date=timezone.now().date())
        response = self.client.get(reverse('task-detail', args=[task.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['title'], 'Single Task')

    def test_update_task(self):
        task = Task.objects.create(user=self.user, title='Task to Update', status='PENDING', priority=1, due_date=timezone.now().date())
        updated_data = {'title': 'Updated Task Title', 'status': 'DONE'}
        response = self.client.patch(reverse('task-detail', args=[task.id]), json.dumps(updated_data), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.title, 'Updated Task Title')
        self.assertEqual(task.status, 'DONE')

    def test_delete_task(self):
        task = Task.objects.create(user=self.user, title='Task to Delete', status='PENDING', priority=1, due_date=timezone.now().date())
        response = self.client.delete(reverse('task-detail', args=[task.id]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Task.objects.count(), 0)

    def test_list_tasks_search_filter(self):
        Task.objects.create(user=self.user, title='Meeting Notes', description='Discuss project details', status='PENDING', priority=1, due_date=timezone.now().date())
        Task.objects.create(user=self.user, title='Code Review', description='Review new feature', status='PENDING', priority=1, due_date=timezone.now().date())
        Task.objects.create(user=self.user, title='Buy Groceries', description='Milk, eggs, bread', status='PENDING', priority=1, due_date=timezone.now().date())

        response = self.client.get(reverse('task-list'), {'search': 'project'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]['title'], 'Meeting Notes')

    def test_list_tasks_status_filter(self):
        Task.objects.create(user=self.user, title='Task Pending', status='PENDING', priority=1, due_date=timezone.now().date())
        Task.objects.create(user=self.user, title='Task Done', status='DONE', priority=1, due_date=timezone.now().date())

        response = self.client.get(reverse('task-list'), {'status': 'pending'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]['title'], 'Task Pending')

    def test_list_tasks_priority_filter(self):
        Task.objects.create(user=self.user, title='High Priority', status='PENDING', priority=3, due_date=timezone.now().date())
        Task.objects.create(user=self.user, title='Low Priority', status='PENDING', priority=1, due_date=timezone.now().date())

        response = self.client.get(reverse('task-list'), {'priority': 3})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]['title'], 'High Priority')

    def test_list_tasks_due_date_today_filter(self):
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        Task.objects.create(user=self.user, title='Due Today 1', status='PENDING', due_date=today)
        Task.objects.create(user=self.user, title='Due Today 2', status='PENDING', due_date=today)
        Task.objects.create(user=self.user, title='Due Tomorrow', status='PENDING', due_date=tomorrow)

        response = self.client.get(reverse('task-list'), {'due_date_today': 'true'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 2)
        self.assertTrue(all(t['due_date'] == today.isoformat() for t in response.json()))


class DashboardMetricsViewTests(TestCase):
    """
    Tests for the DashboardMetricsView.
    """

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='dashuser', email='dash@example.com', password='password123')
        response = self.client.post(
            reverse('token_obtain_pair'),
            {'username': 'dashuser', 'password': 'password123'},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.access_token = response.json()['access']
        self.client.defaults['HTTP_AUTHORIZATION'] = f'Bearer {self.access_token}'

        self.work_category = Category.objects.create(user=self.user, name='Work')
        self.focus_category = Category.objects.create(user=self.user, name='Focus')
        self.personal_category = Category.objects.create(user=self.user, name='Personal')
        self.app_website = AppWebsite.objects.create(user=self.user, name='IDE')

    def create_task(self, title, status, duration, category, date=None):
        if date is None:
            date = timezone.now().date()
        return Task.objects.create(
            user=self.user,
            title=title,
            status=status,
            duration_minutes=duration,
            category=category,
            app_website=self.app_website,
            due_date=date,
            updated_at=timezone.datetime.combine(date, timezone.now().time())
        )

    @patch('api.views.suggest_task_for_user')
    def test_dashboard_metrics_initial_state(self, mock_suggest_task_for_user):
        mock_suggest_task_for_user.return_value = "Review documentation"

        response = self.client.get(reverse('dashboard-metrics'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(data['workHours']['hours'], 0)
        self.assertEqual(data['workHours']['minutes'], 0)
        self.assertEqual(data['workHoursTrend'], 'neutral')
        self.assertEqual(data['percentOfTarget'], 0)
        self.assertEqual(data['focusPercent'], 0)
        self.assertEqual(data['dailySummary']['labels'], [])
        self.assertEqual(data['dailySummary']['data'], [])
        self.assertEqual(data['productiveApps'], [])
        self.assertEqual(len(data['aiInsights']), 2)
        self.assertIn("AI suggests: Review documentation", data['aiInsights'][0]['text'])
        self.assertIn("Complete a task to get your first insight!", data['aiInsights'][1]['text'])
        self.assertEqual(data['tasksDueToday'], 0)

    # Additional dashboard tests can be added here similarly

