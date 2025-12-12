from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
import requests
import json
from dotenv import load_dotenv

# Load environment variables
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, '.env')
load_dotenv(dotenv_path=ENV_PATH)

from backend.rag_engine_enhanced import EnhancedRAGEngine
from backend.ingestion import process_file
from backend.analysis_engine import analyze_performance, predict_questions
from backend.models import ChatRequest

app = FastAPI()

# Configuration for Local LLM
OLLAMA_BASE_URL = "http://localhost:11434/api/generate"
# Using the specific model requested: LLaMA 3.2 3B
# In Ollama, this is usually just 'llama3.2' or 'llama3.2:3b'
LOCAL_MODEL_NAME = "llama3.2" 

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Enhanced RAG Engine
rag_engine = EnhancedRAGEngine()

from fastapi.responses import StreamingResponse
import json


@app.get("/")
def read_root():
    return {"message": "Personal Study Assistant Backend is running (Local LLM Mode)"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Save file temporarily
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Process file
        text_content = process_file(file_path, file.content_type)
        
        if not text_content:
            raise HTTPException(status_code=400, detail="Could not extract text from file")
            
        # Add to RAG
        rag_engine.add_document(text_content, {"filename": file.filename, "type": file.content_type})
        
        return {"message": f"File {file.filename} processed and added to RAG system."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def stream_local_llm(prompt: str, model: str = LOCAL_MODEL_NAME):
    """
    Generator that streams the response from local Ollama instance.
    """
    try:
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": True # Enable streaming
        }
        with requests.post(OLLAMA_BASE_URL, json=payload, stream=True) as response:
            response.raise_for_status()
            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    try:
                        json_response = json.loads(decoded_line)
                        if 'response' in json_response:
                            yield json_response['response']
                        if json_response.get('done', False):
                            break
                    except json.JSONDecodeError:
                        continue
    except Exception as e:
        yield f" [Error: {str(e)}]"

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        # Query RAG (First getting context)
        context_doc = rag_engine.query(request.message)
        context_text = "\n".join(context_doc) if context_doc else "No relevant documents found."
        
        print(f"[INFO] Using Local LLM: {LOCAL_MODEL_NAME} with Streaming")
        
        system_prompt = """You are a Strategic Academic Tutor AI. Your role is to help students excel in their studies.
    
Rules:
1. Synthesize the answer from the retrieved text.
2. Integrate chunks that are partially relevant.
3. NEVER hallucinate.
4. If the context doesn't contain the answer, say "I don't have that information."
5. Be precise, clear, and educational.
"""
        prompt = f"{system_prompt}\n\nContext:\n{context_text}\n\nQuestion: {request.message}\n\nAnswer:"
        
        # Generator for streaming response
        def response_generator():
            # First, yield the context as a special event/header if needed, 
            # but for now let's just stream the answer. 
            # Ideally we send context first, but simpler to just stream answer text.
            yield from stream_local_llm(prompt)
            
        return StreamingResponse(response_generator(), media_type="text/plain")

    except Exception as e:
        print(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/performance")
async def analyze_exam_performance(file: UploadFile = File(...)):
    try:
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        text_content = process_file(file_path, file.content_type)
        
        if not text_content:
            raise HTTPException(status_code=400, detail="Could not extract text from file")
        
        analysis = analyze_performance(text_content)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/prediction")
async def predict_exam_questions(files: List[UploadFile] = File(...)):
    try:
        question_papers = []
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        for file in files:
            file_path = os.path.join(upload_dir, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            text_content = process_file(file_path, file.content_type)
            if text_content:
                question_papers.append(text_content)
        
        if not question_papers:
            raise HTTPException(status_code=400, detail="Could not extract text from any files")
        
        predictions = predict_questions(question_papers)
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/rag/status")
async def get_rag_status():
    """Get the current status of the RAG system including embeddings and knowledge graph."""
    try:
        stats = rag_engine.get_stats()
        return {
            "status": "operational",
            "vector_database": {
                "total_chunks": stats["total_chunks"],
                "embedding_model": "BGE-M3 (BAAI/bge-m3)",
                "collection_name": "study_assistant_rag"
            },
            "knowledge_graph": {
                "total_nodes": stats["graph_nodes"],
                "total_edges": stats["graph_edges"],
                "documents": stats["documents"],
                "entities": stats["entities"]
            },
            "llm_model": LOCAL_MODEL_NAME + " (Local via Ollama)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/rag/knowledge-graph")
async def get_knowledge_graph():
    """Get the knowledge graph data for visualization."""
    try:
        nodes = []
        edges = []
        
        for node, data in rag_engine.graph.nodes(data=True):
            nodes.append({
                "id": node,
                "type": data.get("type", "unknown"),
                "label": data.get("name", data.get("filename", node))
            })
        
        for source, target, data in rag_engine.graph.edges(data=True):
            edges.append({
                "source": source,
                "target": target,
                "relation": data.get("relation", "related")
            })
        
        return {"nodes": nodes, "edges": edges}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
async def get_documents():
    """Get list of uploaded documents."""
    try:
        return rag_engine.get_documents()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/rag/clear")
async def clear_rag_system():
    """Clear all data from the RAG system."""
    try:
        rag_engine.clear_all()
        return {"message": "RAG system cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
