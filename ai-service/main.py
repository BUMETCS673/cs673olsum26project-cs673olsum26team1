# AI-USAGE SUMMARY
# Tools: Claude, ChatGPT
# Overall AI Contribution: ~45%
# AI-Assisted Areas: FastAPI structure, request/response models
# Human Contributions: integration design, role logic, testing
# Notes: BARI-AI microservice entry point. Role determines prompt style.

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from rag import get_ai_response

load_dotenv()

app = FastAPI(title="BariatricPath AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5001", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models define the shape of request and response
# This is FastAPI's way of validating incoming JSON automatically
class ChatRequest(BaseModel):
    question: str
    patient_id: int
    patient_context: dict
    role: str = "PATIENT"  # default 

class ChatResponse(BaseModel):
    answer: str
    sources: list[str] = []

@app.get("/health")
def health():
    return {"status": "ok", "service": "bariatricpath-ai"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    # Validate role
    allowed_roles = ["PATIENT", "COORDINATOR", "PROGRAM_DIRECTOR"]
    if request.role not in allowed_roles:
        raise HTTPException(status_code=400, detail=f"Role must be one of {allowed_roles}")

    try:
        result = await get_ai_response(
            question=request.question,
            patient_context=request.patient_context,
            role=request.role
        )
        return ChatResponse(answer=result["answer"], sources=result["sources"])
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="AI service error: " + str(e))