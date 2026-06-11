from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class Message(BaseModel):
    role: str
    content: str

class AnalyzeRequest(BaseModel):
    messages: List[Message]
    question_number: int

QUESTIONS = [
    "Tell me about something you accomplished recently that you're proud of.",
    "How do you usually handle a situation when someone disagrees with you?",
    "Describe how your closest friends or colleagues would describe you in three words — and tell me if you agree.",
    "What's something people often misunderstand about you?",
    "Walk me through how you typically introduce yourself to someone new.",
]

@app.get("/")
def root():
    return {"status": "MirrorMind API is running"}

@app.get("/question/{number}")
def get_question(number: int):
    if number < 0 or number >= len(QUESTIONS):
        raise HTTPException(status_code=404, detail="Question not found")
    return {
        "question": QUESTIONS[number],
        "total": len(QUESTIONS),
        "is_last": number == len(QUESTIONS) - 1
    }

@app.post("/analyze")
async def analyze_perception(request: AnalyzeRequest):
    conversation_text = ""
    for msg in request.messages:
        role = "User" if msg.role == "user" else "Question"
        conversation_text += f"{role}: {msg.content}\n\n"

    prompt = f"""You are MirrorMind, an AI that helps people understand how they come across to others.

Based on this conversation, analyze how this person likely appears to others — not how they feel inside, but how they come across externally.

CONVERSATION:
{conversation_text}

Provide a perception analysis in this EXACT JSON format (no markdown, no backticks, just raw JSON):
{{
  "headline": "One sentence that captures how this person comes across overall",
  "score": 72,
  "patterns": [
    {{
      "type": "Behavioral Pattern",
      "title": "Short title of the pattern",
      "description": "2-3 sentences explaining this pattern and its impact on how others perceive them",
      "frequency": 78,
      "color": "purple"
    }},
    {{
      "type": "Language Signal",
      "title": "Short title",
      "description": "2-3 sentences explaining this pattern",
      "frequency": 65,
      "color": "yellow"
    }},
    {{
      "type": "Energy Pattern",
      "title": "Short title",
      "description": "2-3 sentences explaining this pattern",
      "frequency": 82,
      "color": "green"
    }}
  ],
  "strength": "One thing this person does really well in how they come across",
  "growth": "One specific thing they can change to show up more powerfully"
}}

Be honest, specific, and insightful. Return ONLY the JSON object, nothing else."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1500,
        temperature=0.7,
    )

    import json
    result_text = response.choices[0].message.content.strip()

    if result_text.startswith("```"):
        result_text = result_text.split("```")[1]
        if result_text.startswith("json"):
            result_text = result_text[4:]
    result_text = result_text.strip()

    try:
        result = json.loads(result_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")

    return result