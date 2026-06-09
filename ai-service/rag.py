# AI-USAGE SUMMARY
# Tools: Claude, ChatGPT
# Overall AI Contribution: ~60%
# AI-Assisted Areas: RAG chain, role-based prompts, ChromaDB retrieval
# Human Contributions: prompt content, role logic, patient context design, verification
# Notes: uses langchain-core modern API (not deprecated langchain.chains)

import os
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

CHROMA_PATH = "./chroma_db"

# --- Role-based system prompts ---
# Each role gets a different instruction set but same RAG pipeline

PROMPTS = {
    "PATIENT": """You are a helpful assistant for BariatricPath patients.
Answer based only on the information provided below.
Never give specific medical advice.
If unsure, say: "Please contact your care coordinator."
Use the patient's name at most once per conversation unless specifically needed.

Patient status:
{patient_context}

Program information:
{context}

Patient question: {question}

Answer in 2-3 sentences maximum. Be warm but concise:""",

    "COORDINATOR": """You are an assistant for BariatricPath coordinators.
Give clear, actionable guidance. Be direct and professional.
Keep answers under 3 sentences unless listing steps.

Context:
{patient_context}

Program information:
{context}

Question: {question}

Answer concisely:""",

    "PROGRAM_DIRECTOR": """You are an assistant for the BariatricPath program director.
Be strategic and data-focused. Limit to 4-5 key points maximum.
Use plain text only — no markdown bold or asterisks.

Context:
{patient_context}

Program information:
{context}

Question: {question}

Answer with bullet points using plain dashes, max 5 points:"""
}

# Store conversation history per session
# Key is patient_id, value is list of past messages
conversation_memory = {}

async def get_ai_response(question: str, patient_context: dict, role: str = "PATIENT", patient_id: int = 0) -> dict:
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        raise ValueError("OPENAI_API_KEY not set in .env")

    llm = ChatOpenAI(
        model="gpt-4.1-mini",
        temperature=0.3,
        api_key=openai_key
    )

    embeddings = OpenAIEmbeddings(api_key=openai_key)
    context_str = "\n".join([f"- {k}: {v}" for k, v in patient_context.items() if k != 'name'])

    # Retrieve from ChromaDB
    try:
        role_to_metadata = {
            "PATIENT": "patient",
            "COORDINATOR": "coordinator",
            "PROGRAM_DIRECTOR": "program_director",
        }
        metadata_role = role_to_metadata.get(role, "patient")

        vectorstore = Chroma(
            persist_directory=CHROMA_PATH,
            embedding_function=embeddings
        )
        retriever = vectorstore.as_retriever(
            search_kwargs={"k": 3, "filter": {"role": metadata_role}}
        )
        relevant_docs = retriever.invoke(question)
        retrieved_context = "\n\n".join([doc.page_content for doc in relevant_docs])
    except Exception:
        retrieved_context = "No program-specific information available yet."

    # Build memory string from past messages
    session_key = f"{role}_{patient_id}"
    if session_key not in conversation_memory:
        conversation_memory[session_key] = []

    history = conversation_memory[session_key]
    history_str = ""
    if history:
        history_str = "\n\nPrevious conversation:\n"
        for msg in history[-7:]:  # only last 7
            history_str += f"User: {msg['question']}\nAssistant: {msg['answer']}\n"

    # Build prompt with memory included
    prompt_template = PROMPTS.get(role, PROMPTS["PATIENT"])
    filled_prompt = prompt_template.format(
        context=retrieved_context,
        question=question,
        patient_context=context_str
    ) + history_str

    response = llm.invoke(filled_prompt)
    answer = response.content

    # Save this exchange to memory
    conversation_memory[session_key].append({
        "question": question,
        "answer": answer
    })

    # Keep memory from growing too large
    if len(conversation_memory[session_key]) > 10:
        conversation_memory[session_key] = conversation_memory[session_key][-10:]

    return {
        "answer": answer,
        "sources": ["BariatricPath Program Guide"]
    }
   

