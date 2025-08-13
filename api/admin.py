from django.contrib import admin
from django import forms
from .models import Notification, Task, Subtask # Import Subtask model

# Define an Inline for Subtasks
class SubtaskInline(admin.TabularInline): # Or admin.StackedInline for a more vertical layout
    model = Subtask
    extra = 1 # Number of empty forms to display
    fields = ('title', 'completed') # Fields to display for each subtask in the inline

# Define a custom form for the Task model (no change needed here for subtasks, as inline handles it)
class TaskAdminForm(forms.ModelForm):
    class Meta:
        model = Task
        # Explicitly list all fields you want to be editable in the admin form
        # 'subtasks' field is removed from here as it will be handled by the inline
        fields = (
            'user', 'title', 'description', 'due_date', 'status', 'priority',
            'category',
            'duration_minutes',
            'recurrence_pattern', 'recurrence_end_date',
            'app_website', # Ensure app_website and project are included if they are fields in your Task model
            'project',
        )
        # You can optionally add widgets here for more control over input types
        # For example, to ensure duration_minutes is a number input:
        # widgets = {
        #     'duration_minutes': forms.NumberInput(attrs={'min': 0}),
        # }


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    form = TaskAdminForm # Use the custom form
    inlines = [SubtaskInline] # Add the SubtaskInline here

    list_display = (
        'title', 'user', 'status', 'priority', 'due_date',
        'category',
        'duration_minutes',
        'recurrence_pattern', 'created_at', 'updated_at'
    )
    list_filter = ('status', 'priority', 'category', 'recurrence_pattern', 'user')
    search_fields = ('title', 'description')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    fieldsets = (
        (None, {
            'fields': ('user', 'title', 'description')
        }),
        ('Task Details', {
            'fields': (
                'status', 'priority', 'due_date',
                'category',
                'duration_minutes',
                'app_website', # Ensure app_website and project are included if they are fields in your Task model
                'project',
            )
        }),
        ('Recurrence', {
            'fields': ('recurrence_pattern', 'recurrence_end_date'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at', 'user')
    search_fields = ('message',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

# You might also want to register Subtask directly if you want a separate admin page for it
# @admin.register(Subtask)
# class SubtaskAdmin(admin.ModelAdmin):
#     list_display = ('title', 'task', 'completed', 'created_at')
#     list_filter = ('completed', 'task')
#     search_fields = ('title',)
