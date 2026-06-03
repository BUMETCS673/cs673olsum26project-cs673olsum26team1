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
    "PATIENT": """You are a compassionate assistant for BariatricPath patients.
Answer based only on the information provided below.
Never give specific medical advice.
If unsure, say: "Please contact your care coordinator for more details."

Patient current status:
{patient_context}

Relevant program information:
{context}

Patient question: {question}

Answer in 2-4 encouraging sentences:""",

    "COORDINATOR": """You are an efficient assistant for BariatricPath care coordinators.
Provide clear, professional, actionable guidance based on the information below.

Coordinator context:
{patient_context}

Relevant program information:
{context}

Coordinator question: {question}

Answer concisely and professionally:""",

    "PROGRAM_DIRECTOR": """You are a strategic assistant for the BariatricPath program director.
Provide high-level, data-focused insights based on the information below.

Program context:
{patient_context}

Relevant program information:
{context}

Director question: {question}

Answer with a focus on program management and metrics:"""
}


async def get_ai_response(question: str, patient_context: dict, role: str = "PATIENT") -> dict:
    """
    This is the main RAG function. Here is what it does step by step:
    1. Connect to OpenAI for the LLM and embeddings
    2. Convert the question into a vector and search ChromaDB for similar content
    3. Take the retrieved content + patient context + question and build a prompt
    4. Send the prompt to GPT and return the answer
    """

    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        raise ValueError("OPENAI_API_KEY not set in .env")

    # Set up the LLM 
    llm = ChatOpenAI(
        model="gpt-4.1-mini",
        temperature=0.3,  
        api_key=openai_key
    )

    #  embeddings (converts text to vectors for searching)
    embeddings = OpenAIEmbeddings(api_key=openai_key)

    # Format patient context as readable text
    context_str = "\n".join([f"- {k}: {v}" for k, v in patient_context.items()])

    # Step 4: Search ChromaDB for relevant content
    
    try:
        vectorstore = Chroma(
            persist_directory=CHROMA_PATH,
            embedding_function=embeddings
        )
        
        role_to_metadata = {
            "PATIENT": "patient",
            "COORDINATOR": "coordinator",
            "PROGRAM_DIRECTOR": "program_director",
        }

        metadata_role = role_to_metadata.get(role, "patient")

        retriever = vectorstore.as_retriever(
            search_kwargs={
                "k": 3,
                "filter": {
                    "role": metadata_role
                }
            }
        )

        relevant_docs = retriever.invoke(question)
        retrieved_context = "\n\n".join([doc.page_content for doc in relevant_docs])
    except Exception:
        # If ChromaDB not loaded yet, fall back to GPT general knowledge
        retrieved_context = "No program-specific information available yet."

    #  Pick the right prompt for this role
    prompt_template = PROMPTS.get(role, PROMPTS["PATIENT"])

    #  Fill in the prompt with real values
    filled_prompt = prompt_template.format(
        context=retrieved_context,
        question=question,
        patient_context=context_str
    )

    response = llm.invoke(filled_prompt)

    return {
        "answer": response.content,
        "sources": ["BariatricPath Program Guide"]
    }