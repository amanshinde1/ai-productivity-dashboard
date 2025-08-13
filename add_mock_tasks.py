import datetime
from django.contrib.auth import get_user_model
from api.models import Task # Assuming your Task model is in api/models.py
import random

User = get_user_model()

def add_mock_tasks():
    # Get the first user available. This will likely be your superuser or 'Peace'.
    # IMPORTANT: Ensure you have at least one user in your database.
    # If you just ran `createsuperuser`, that user will be available.
    try:
        user = User.objects.first()
        if not user:
            print("No users found in the database. Please create a user (e.g., a superuser) first.")
            return
    except Exception as e:
        print(f"Error fetching user: {e}. Make sure your database is migrated and has users.")
        return

    print(f"Adding tasks for user: {user.username} (ID: {user.id})")

    mock_tasks_data = []
    today = datetime.date.today()

    # Define a broader set of task title fragments for more variety
    task_title_fragments = [
        "Review Project Proposal", "Prepare Presentation", "Client Follow-up",
        "Code Refactoring", "Write Blog Post", "Research New Tool",
        "Team Sync Meeting", "Update Documentation", "Plan Marketing Campaign",
        "Data Analysis Report", "User Feedback Collection", "Bug Fixing",
        "Onboard New Team Member", "Develop New Feature X", "Sprint Planning",
        "Create User Manual", "Test Beta Version", "Conduct Market Research",
        "Design UI/UX Mockups", "Optimize Database Queries", "Write Unit Tests",
        "Perform Security Audit", "Prepare Financial Report", "Customer Support Triage",
        "Review Legal Contracts", "Setup Development Environment", "Content Calendar Planning",
        "Social Media Engagement", "Email Newsletter Draft", "Competitor Analysis"
    ]

    # Generate 45 diverse mock tasks
    for i in range(1, 46): # Changed range to 46 for 45 tasks
        title_prefix = f"Mock Task {i}: "
        description = f"This is a detailed description for mock task {i}. It covers various aspects of the task, ensuring a good mix of content for testing."
        status = random.choice(['PENDING', 'DONE'])
        priority = random.choice([1, 2, 3]) # 1: High, 2: Medium, 3: Low

        # Generate due dates: more variety with past, present, and future
        due_date_type = random.randint(1, 5) # 1: Overdue, 2-3: Today, 4-5: Future
        if due_date_type == 1: # Overdue
            due_date = today - datetime.timedelta(days=random.randint(1, 20))
            if status == 'DONE': # Ensure consistency: Overdue tasks should generally be PENDING unless specifically marked done later
                status = 'PENDING'
        elif due_date_type in [2, 3]: # Due today
            due_date = today
        else: # Due in future (up to 60 days from now)
            due_date = today + datetime.timedelta(days=random.randint(1, 60))

        # Generate recurrence patterns and end dates
        recurrence_pattern = random.choice(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']) # Removed 'YEARLY' for more common patterns
        recurrence_end_date = None
        if recurrence_pattern != 'NONE':
            # End within 3 months to a year
            recurrence_end_date = today + datetime.timedelta(days=random.randint(90, 365))

        # Generate some subtasks
        num_subtasks = random.randint(0, 4) # Up to 4 subtasks for more depth
        subtasks = []
        for j in range(num_subtasks):
            subtasks.append({
                'id': j + 1,
                'title': f"Subtask {j+1} for Mock Task {i} - {random.choice(['Research', 'Draft', 'Finalize', 'Review'])}",
                'completed': random.choice([True, False])
            })

        mock_tasks_data.append({
            'title': title_prefix + random.choice(task_title_fragments),
            'description': description,
            'due_date': due_date,
            'status': status,
            'priority': priority,
            'recurrence_pattern': recurrence_pattern,
            'recurrence_end_date': recurrence_end_date,
            'subtasks': subtasks
        })

    created_count = 0
    for task_data in mock_tasks_data:
        try:
            Task.objects.create(user=user, **task_data)
            created_count += 1
        except Exception as e:
            print(f"Error creating task '{task_data['title']}': {e}")

    print(f"\nSuccessfully created {created_count} mock tasks for user '{user.username}'.")
    if created_count < 45:
        print("Note: Fewer than 45 tasks were created, likely due to an error during creation of some tasks.")

# Call the function when the script is run
if __name__ == '__main__':
    # This block is for running the script directly (e.g., `python add_mock_tasks.py`)
    # In that case, you'd need to set up Django environment first.
    # For simplicity, I recommend running it via `python manage.py shell`
    add_mock_tasks()