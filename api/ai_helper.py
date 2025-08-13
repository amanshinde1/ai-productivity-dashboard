# api/ai_helper.py

import random

# NOTE: AI integration is architected, but disabled for demo/resume—plug in an API key for real suggestions.
def suggest_task_for_user(user):
    """
    ALWAYS return a mock AI suggestion and a friendly message.
    This disables actual OpenAI calls for demo/recruitment mode.
    """
    mock_suggestions = [
        "Review and organize your top 3 tasks for the day.",
        "Take a 15-minute break to recharge before your next task.",
        "Catch up on emails from yesterday.",
        "Reflect on your progress from this week and set a goal for tomorrow.",
        "Plan your next big project's first step.",
        "Declutter your digital workspace for 10 minutes.",
        "Prioritize tasks using the Eisenhower Matrix.",
        "Block out time for deep work on your critical task.",
        "Identify one small habit to improve your daily routine."
    ]
    # Always return a mock suggestion and indicate status
    return {
        "suggestion": random.choice(mock_suggestions),
        "message": "AI suggestions are not live in the demo, but here’s a useful productivity tip!"
    }
