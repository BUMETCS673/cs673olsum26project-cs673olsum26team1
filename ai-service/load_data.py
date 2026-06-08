

import csv
import os

from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from dotenv import load_dotenv

load_dotenv()

CHROMA_PATH = "./chroma_db"

def load_csv(filepath: str, role_tag: str) -> list:
    """
    Reads a CSV file and converts each row into a LangChain Document.
    A Document is just text content + metadata (extra info like category and role).
    We store both so ChromaDB can filter by role later if needed.
    """
    docs = []
    with open(filepath, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Combine question and answer into one searchable block of text
            content = f"Q: {row['question']}\nA: {row['answer']}"
            docs.append(Document(
                page_content=content,
                metadata={
                    "category": row.get("category", "general"),
                    "role": role_tag,
                    "source": filepath
                }
            ))
    return docs

def main():
    print("Connecting to OpenAI for embeddings...")
    embeddings = OpenAIEmbeddings(api_key=os.getenv("OPENAI_API_KEY"))

    all_docs = []
    all_docs.extend(load_csv("data/bariatric_program_faq.csv", "patient"))
    all_docs.extend(load_csv("data/coordinator_guide.csv", "coordinator"))
    all_docs.extend(load_csv("data/director_guide.csv", "program_director"))

    print(f"Loaded {len(all_docs)} documents. Storing in ChromaDB...")

    # Cconverts each document to a vector and saves it to disk, 
    # so that it runs fron disk next time, no more embeddings
    Chroma.from_documents(
        documents=all_docs,
        embedding=embeddings,
        persist_directory=CHROMA_PATH
    )

    print(f"Done. ChromaDB saved to {CHROMA_PATH}/")
    print("Your AI will now answer from BariatricPath-specific content.")
    
if __name__ == "__main__":
    main()
    