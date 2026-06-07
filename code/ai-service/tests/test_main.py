 # AI-USAGE SUMMARY
# Tools: Claude, ChatGPT
# Overall AI Contribution: ~50%
# AI-Assisted Areas: test structure, mock patterns, async test setup
# Human Contributions: test case design, understanding of what to verify
# Notes: uses pytest + httpx TestClient to test FastAPI endpoints without
#        starting a real server. Mocks OpenAI and ChromaDB so tests are
#        fast, free, and deterministic.

import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from httpx import AsyncClient, ASGITransport

from main import app

@pytest.fixture
def anyio_backend():
    return "asyncio"

@pytest.mark.asyncio
async def test_health_endpoint():
    """
    The /health endpoint requires no auth and no AI.
    It should always return status ok.
    Just to check whetehr the endpoint works.
    """
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        response = await client.get("/health")
        
     # Assert the status code is 200 (success)
    assert response.status_code == 200
    
    # Assert the response body contains what we expect
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "bariatricpath-ai"
    
@pytest.mark.asyncio
async def test_chat_returns_answer_for_patient():
    """
    Tests the happy path: a valid patient question returns an answer.

    We mock get_ai_response so it never calls OpenAI.
    The mock returns a predictable fake answer.
    We then verify the API endpoint correctly returns that answer.
    """
    fake_response = {
        "answer": "Your insurance is being reviewed by your coordinator.",
        "sources": ["BariatricPath Program Guide"]
    }
    
    with patch("main.get_ai_response", new_callable=AsyncMock) as mock_ai:
        mock_ai.return_value = fake_response

        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.post("/chat", json={
                "question": "What does my insurance status mean?",
                "patient_id": 1,
                "patient_context": {"insuranceStatus": "not clear"},
                "role": "PATIENT"
            })

    assert response.status_code == 200
    data = response.json()
    
    # Verify the answer came through correctly
    assert data["answer"] == fake_response["answer"]
    assert "sources" in data

    mock_ai.assert_called_once()
    
@pytest.mark.asyncio
async def test_chat_returns_answer_for_coordinator():
    """
    Same test but for the COORDINATOR role.
    Verifies role-based routing works — the role is passed through correctly.
    """
    fake_response = {
        "answer": "Navigate to the patient record and update the status field.",
        "sources": ["BariatricPath Program Guide"]
    }

    with patch("main.get_ai_response", new_callable=AsyncMock) as mock_ai:
        mock_ai.return_value = fake_response

        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.post("/chat", json={
                "question": "How do I update insurance status?",
                "patient_id": 2,
                "patient_context": {"role": "coordinator"},
                "role": "COORDINATOR"
            })

    assert response.status_code == 200

    # Verify get_ai_response was called with the correct role
    # call_args gives us the arguments that were passed to the mock
    call_kwargs = mock_ai.call_args.kwargs
    assert call_kwargs["role"] == "COORDINATOR"
    
@pytest.mark.asyncio
async def test_chat_returns_answer_for_director():
    """
    Same test for PROGRAM_DIRECTOR role.
    """
    fake_response = {
        "answer": "Track insurance approval rate and average pre-auth timeline.",
        "sources": ["BariatricPath Program Guide"]
    }

    with patch("main.get_ai_response", new_callable=AsyncMock) as mock_ai:
        mock_ai.return_value = fake_response

        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.post("/chat", json={
                "question": "What metrics should I track?",
                "patient_id": 3,
                "patient_context": {"role": "program_director"},
                "role": "PROGRAM_DIRECTOR"
            })

    assert response.status_code == 200
    call_kwargs = mock_ai.call_args.kwargs
    assert call_kwargs["role"] == "PROGRAM_DIRECTOR"
@pytest.mark.asyncio
async def test_chat_rejects_empty_question():
    """
    TEACHING POINT: testing validation / sad paths.

    We test what happens when the user sends an empty question.
    The endpoint should reject it with a 400 status code.
    We do NOT need to mock get_ai_response here because the
    validation check happens BEFORE the AI is called.
    If validation is working, the AI is never reached.
    """
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        response = await client.post("/chat", json={
            "question": "",
            "patient_id": 1,
            "patient_context": {},
            "role": "PATIENT"
        })

    assert response.status_code == 400
    data = response.json()
    assert "detail" in data

@pytest.mark.asyncio
async def test_chat_rejects_whitespace_only_question():
    """
    A question that is only spaces should also be rejected.
    This tests the .strip() check in our validation logic.
    """
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        response = await client.post("/chat", json={
            "question": "     ",
            "patient_id": 1,
            "patient_context": {},
            "role": "PATIENT"
        })

    assert response.status_code == 400
    
@pytest.mark.asyncio
async def test_chat_rejects_invalid_role():
    """
    Only PATIENT, COORDINATOR, and PROGRAM_DIRECTOR are valid roles.
    Anything else should return 400.
    This tests that our role validation is working.
    """
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        response = await client.post("/chat", json={
            "question": "What is my status?",
            "patient_id": 1,
            "patient_context": {},
            "role": "HACKER"
        })

    assert response.status_code == 400
    
@pytest.mark.asyncio
async def test_chat_returns_500_when_ai_fails():
    """
    TEACHING POINT: testing error handling.

    What happens when OpenAI is down or throws an error?
    We mock get_ai_response to raise an Exception,
    then verify our endpoint handles it gracefully with a 500 response.
    This proves our try/except block is working.
    """
    with patch("main.get_ai_response", new_callable=AsyncMock) as mock_ai:
        # side_effect makes the mock raise an exception instead of returning
        mock_ai.side_effect = Exception("OpenAI is down")

        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.post("/chat", json={
                "question": "What is my status?",
                "patient_id": 1,
                "patient_context": {},
                "role": "PATIENT"
            })

    assert response.status_code == 500
    
@pytest.mark.asyncio
async def test_chat_default_role_is_patient():
    """
    If no role is provided, it should default to PATIENT.
    This tests the default value in our Pydantic model:
        role: str = "PATIENT"
    """
    fake_response = {
        "answer": "Your care team is here to help.",
        "sources": ["BariatricPath Program Guide"]
    }

    with patch("main.get_ai_response", new_callable=AsyncMock) as mock_ai:
        mock_ai.return_value = fake_response

        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            # Note: no "role" field in this request
            response = await client.post("/chat", json={
                "question": "What is my status?",
                "patient_id": 1,
                "patient_context": {}
            })

    assert response.status_code == 200
    call_kwargs = mock_ai.call_args.kwargs
    assert call_kwargs["role"] == "PATIENT"

    
