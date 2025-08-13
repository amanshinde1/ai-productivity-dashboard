# ai.py
import openai
import os
from dotenv import load_dotenv

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")  # Make sure your env var is set

def suggest_task_for_user(user):
    prompt = [
        {"role": "system", "content": "You are a helpful productivity assistant."},
        {
            "role": "user",
            "content": f"Suggest a short, meaningful productivity task for a user named {user.username}."
        }
    ]

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # or "gpt-4" if you have access
            messages=prompt,
            max_tokens=60,
            temperature=0.7,
        )
        suggestion = response.choices[0].message.content.strip()
        return suggestion

    except Exception as e:
        # You can log the error here if you want
        return "Plan your day wisely."
