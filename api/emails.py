from django.core.mail import send_mail
from django.conf import settings

def send_task_created_email(user_email, task_title):
    subject = f"Task Created: {task_title}"
    message = f"Your task '{task_title}' has been successfully created."
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user_email]
    send_mail(subject, message, from_email, recipient_list)
