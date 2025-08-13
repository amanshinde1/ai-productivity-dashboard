from celery import shared_task
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from .models import Task, Notification
from django.conf import settings


@shared_task
def send_ai_productivity_summary_email():
    users = User.objects.all()
    now = timezone.now().date()
    for user in users:
        tasks = Task.objects.filter(owner=user)
        total = tasks.count()
        done = tasks.filter(status='DONE').count()
        pending = tasks.filter(status='PENDING').count()
        overdue = tasks.filter(status='PENDING', due_date__lt=now).count()

        subject = f"Your Daily Productivity Summary"
        message = (
            f"Hi {user.username},\n\n"
            f"Here's your task summary for today:\n"
            f"- Total tasks: {total}\n"
            f"- Completed: {done}\n"
            f"- Pending: {pending}\n"
            f"- Overdue: {overdue}\n\n"
            "Keep up the great work!\n\n"
            "— Your AI Productivity Dashboard"
        )

        if user.email:
            send_mail(subject, message, 'noreply@yourapp.com', [user.email], fail_silently=True)

        print(f"[AI Summary] Sent productivity summary to {user.username} ({user.email})")


@shared_task
def send_overdue_task_reminders():
    today = timezone.now().date()
    overdue_tasks = Task.objects.filter(status='PENDING', due_date__lt=today)
    print(f"Found {overdue_tasks.count()} overdue tasks")

    for task in overdue_tasks:
        user = task.owner
        print(f"Processing task '{task.title}' for user {user.username}")

        if user.email:
            subject = f"Overdue Task Reminder: {task.title}"
            message = (
                f"Hi {user.username},\n\n"
                f"Your task '{task.title}' was due on {task.due_date} and is now overdue. "
                "Please take action to complete it.\n\n"
                "Keep up the good work!\n"
                "— Your Productivity App"
            )
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)
            print(f"Sent email to {user.email}")
        else:
            print(f"User {user.username} has no email, skipping email sending")

        due_date_str = task.due_date.strftime('%Y-%m-%d') if task.due_date else "Unknown date"

        notif = Notification.objects.create(
            user=user,
            notif_type='overdue_task',
            message=f"Your task '{task.title}' is overdue since {due_date_str}. Please take action.",
            related_task=task,
            is_read=False,
        )


        print(f"Notification created: {notif} for user {user.username}")
