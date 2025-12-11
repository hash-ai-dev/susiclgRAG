from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from the backend directory
# Get the directory where this file (main.py) is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, '.env')
print(f"[DEBUG] Loading .env from: {ENV_PATH}")
print(f"[DEBUG] .env file exists: {os.path.exists(ENV_PATH)}")
load_dotenv(dotenv_path=ENV_PATH)

# Load API keys (supports multiple keys for rotation)
def load_api_keys():
    """Load and parse API keys from environment variables."""
    keys = []
    
    # Load primary key
    primary_key = os.getenv("GEMINI_API_KEY")
    if primary_key:
        keys.append(primary_key.strip())
    
    # Load additional keys
    additional_keys = os.getenv("GEMINI_API_KEYS", "")
    if additional_keys:
        for key in additional_keys.split(","):
            key = key.strip()
            if key and key not in keys:
                keys.append(key)
    
    return keys

# Load all available API keys
API_KEYS = load_api_keys()
if API_KEYS:
    print(f"[DEBUG] Loaded {len(API_KEYS)} API key(s)")
    for i, key in enumerate(API_KEYS, 1):
        print(f"[DEBUG]   Key {i}: {key[:20]}...")
    # Configure with first key by default
    genai.configure(api_key=API_KEYS[0])
    print("[DEBUG] Gemini API configured with primary key")
else:
    print("[WARN] No GEMINI_API_KEY found in environment variables")

from backend.rag_engine_enhanced import EnhancedRAGEngine
from backend.ingestion import process_file
from backend.analysis_engine import analyze_performance, predict_questions
from backend.models import ChatRequest

app = FastAPI()

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

@app.get("/")
def read_root():
    return {"message": "Personal Study Assistant Backend is running"}

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

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        # Query RAG
        context_doc = rag_engine.query(request.message)
        
        # Convert list to string
        context_text = "\n".join(context_doc) if context_doc else "No relevant documents found in your library."
        
        answer = None
        
        if API_KEYS:
            print(f"Attempting to use Gemini models with {len(API_KEYS)} API key(s)...")
            # Try different model names in order of preference
            model_names = [
                'gemini-2.5-flash-live',
                'gemini-2.0-flash',
                'gemma-3-12b',
                'gemma-3-27b',
            ]
            
            system_prompt = """You are a Strategic Academic Tutor AI. Your role is to help students excel in their studies.
        
Rules:
1. Synthesize the answer from the retrieved text - do not just return exact matches.
2. Integrate chunks that are partially relevant to provide a comprehensive answer.
3. NEVER hallucinate or make up information not found in the context.
4. If the context doesn't contain the answer, say "I don't have that information in your uploaded materials."
5. Be precise, clear, and educational.
6. Provide examples and explanations when helpful."""
            
            prompt = f"{system_prompt}\n\nContext from study materials:\n{context_text}\n\nStudent Question: {request.message}\n\nAnswer:"
            
            last_error = None
            
            # Try each model with each API key until one succeeds
            for model_name in model_names:
                for key_index, api_key in enumerate(API_KEYS, 1):
                    try:
                        key_label = f"Key {key_index}/{len(API_KEYS)}"
                        print(f"Trying model: {model_name} with {key_label}")
                        
                        # Configure with this API key
                        genai.configure(api_key=api_key)
                        model = genai.GenerativeModel(model_name)
                        
                        # Generate response with the actual user query
                        print(f"Generating content with {model_name} using {key_label}...")
                        response = model.generate_content(prompt)
                        
                        # If we get here, the model worked!
                        answer = response.text
                        print(f"✓ Successfully got response from {model_name} using {key_label}")
                        break  # Exit the API key loop
                        
                    except Exception as e:
                        error_msg = str(e)
                        print(f"✗ Model {model_name} with {key_label} failed: {error_msg[:100]}")
                        last_error = e
                        
                        # Check if it's a quota error
                        if "429" in error_msg or "quota" in error_msg.lower() or "resource" in error_msg.lower():
                            print(f"  → Quota/resource issue, trying next API key...")
                        elif "404" in error_msg or "not found" in error_msg.lower():
                            print(f"  → Model not found, skipping to next model...")
                            break  # Skip to next model, no point trying other keys
                        else:
                            print(f"  → Error occurred, trying next API key...")
                        
                        continue  # Try the next API key
                
                # If we got an answer, break out of the model loop too
                if answer is not None:
                    break
            
            # If no model worked, use fallback
            if answer is None:
                print(f"⚠ All models and API keys exhausted. Using fallback. Last error: {last_error}")
                if context_doc:
                    answer = f"📚 Here's what I found in your study materials:\n\n{context_text}\n\n💡 Note: All AI models are currently unavailable (quota exceeded on all API keys), but I've retrieved the relevant content from your uploaded documents."
                else:
                    answer = "I don't have any relevant information in your uploaded materials. Please upload some study documents first!\n\n💡 Note: AI models are also currently unavailable."
        else:
            # No API key, use fallback
            if context_doc:
                answer = f"📚 Here's what I found in your study materials:\n\n{context_text}\n\n💡 Note: Set GEMINI_API_KEY to enable AI-powered responses."
            else:
                answer = "Please upload some study documents first, then I can help you find information in them!"
    
        return {"response": answer, "context": context_text}
    except Exception as e:
        print(f"Chat error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

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
            }
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
