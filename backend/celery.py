# backend/celery.py
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

# Load settings from Django's settings.py, CELERY_ namespace only
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all installed apps
app.autodiscover_tasks()

# Periodic task schedule
app.conf.beat_schedule = {
    'send-daily-productivity-summary': {
        'task': 'api.tasks.send_ai_productivity_summary_email',
        'schedule': crontab(hour=8, minute=0),  # Every day at 8:00 AM
    },
    'send-daily-overdue-task-reminders': {
        'task': 'api.tasks.send_overdue_task_reminders',
        'schedule': crontab(hour=9, minute=0),  # Every day at 9:00 AM
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
