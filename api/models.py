from django.db import models
from django.contrib.auth import get_user_model
# from django.contrib.postgres.fields import ArrayField # No longer needed for subtasks
import json

User = get_user_model()

# NEW: Category Model
class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100, unique=False) # Not unique globally, but per user
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Ensure uniqueness per user for the category name
        unique_together = ('user', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.user.username})"

# NEW: AppWebsite Model
class AppWebsite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='app_websites')
    name = models.CharField(max_length=100, unique=False) # Not unique globally, but per user
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Ensure uniqueness per user for the app/website name
        unique_together = ('user', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.user.username})"

# NEW: Project Model
class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=100, unique=False) # Not unique globally, but per user
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Ensure uniqueness per user for the project name
        unique_together = ('user', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.user.username})"


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:50]}..."


class Task(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('DONE', 'Done'),
    ]

    PRIORITY_CHOICES = [
        (1, 'High'),
        (2, 'Medium'),
        (3, 'Low'),
    ]

    RECURRENCE_CHOICES = [
        ('NONE', 'None'),
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
        ('YEARLY', 'Yearly'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=3)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # subtasks = ArrayField( # REMOVED: Subtasks will now be a separate model
    #     models.JSONField(default=dict),
    #     default=list,
    #     blank=True
    # )

    recurrence_pattern = models.CharField(
        max_length=10,
        choices=RECURRENCE_CHOICES,
        default='NONE'
    )
    recurrence_end_date = models.DateField(blank=True, null=True)

    duration_minutes = models.IntegerField(
        blank=True,
        null=True,
        help_text="Expected duration of the task in minutes."
    )

    # MODIFIED: Foreign Keys to new Category, AppWebsite, and Project models
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL, # Set to NULL if the category is deleted
        related_name='tasks',
        blank=True,
        null=True,
        help_text="Associated category for the task."
    )
    app_website = models.ForeignKey(
        AppWebsite,
        on_delete=models.SET_NULL, # Set to NULL if the app/website is deleted
        related_name='tasks_app_website', # Changed related_name to avoid clashes
        blank=True,
        null=True,
        help_text="Associated app or website for the task."
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL, # Set to NULL if the project is deleted
        related_name='tasks_project', # Changed related_name to avoid clashes
        blank=True,
        null=True,
        help_text="Associated project for the task."
    )

    class Meta:
        ordering = ['due_date', 'priority', '-created_at']

    def __str__(self):
        return self.title

    # REMOVED: These methods are no longer needed as subtasks are separate models
    # def set_subtasks(self, subtasks_list):
    #     cleaned_subtasks = []
    #     for subtask in subtasks_list:
    #         if isinstance(subtask, dict) and 'title' in subtask and 'completed' in subtask:
    #             cleaned_subtasks.append({
    #                 'id': subtask.get('id', None),
    #                 'title': str(subtask['title']),
    #                 'completed': bool(subtask['completed'])
    #             })
    #         elif isinstance(subtask, str):
    #             cleaned_subtasks.append({'id': None, 'title': subtask, 'completed': False})
    #     self.subtasks = cleaned_subtasks

    # def get_subtasks(self):
    #     return self.subtasks


# NEW: Subtask Model
class Subtask(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        verbose_name_plural = "Subtasks" # Correct plural name for admin

    def __str__(self):
        return f"{self.title} ({'Done' if self.completed else 'Pending'})"

