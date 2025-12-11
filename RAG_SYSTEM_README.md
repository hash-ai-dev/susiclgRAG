# Personal Study Assistant - RAG System Documentation

## Overview

This application now features a **fully functional RAG (Retrieval-Augmented Generation) system** with:
- ✅ **Vector Embeddings** using Gemini API or sentence-transformers
- ✅ **Knowledge Graph** for entity relationships
- ✅ **Semantic Search** with ChromaDB
- ✅ **Real-time Monitoring** dashboard

## Architecture

### 1. Vector Embeddings

The system converts uploaded documents into vector embeddings for semantic search:

- **Primary**: Gemini `embedding-001` model (768 dimensions)
- **Fallback**: sentence-transformers (when Gemini quota exceeded)
- **Storage**: ChromaDB persistent vector database

### 2. Knowledge Graph

Automatically extracts and stores relationships between:
- **Documents**: Uploaded files
- **Entities**: Key concepts, terms, and topics
- **Relationships**: Connections between documents and entities

### 3. Document Processing Pipeline

```
Upload File → Extract Text (Gemini Vision/OCR) → 
Chunk Text (semantic chunking) → Generate Embeddings → 
Store in Vector DB → Extract Entities → Build Knowledge Graph
```

## Features

### Document Upload & Processing
- Supports: PDF, images (PNG, JPG), text files
- Automatic text extraction using Gemini 1.5 Flash
- Intelligent chunking with overlap for context preservation
- Entity extraction for knowledge graph building

### Semantic Search
- Query your documents using natural language
- Finds relevant chunks based on semantic similarity
- Returns top-k most relevant passages
- Cosine similarity for matching

### Knowledge Graph
- Automatically identifies key entities in documents
- Builds relationships between documents and concepts
- Visualizable through the RAG Status dashboard
- Helps understand document connections

### RAG Status Dashboard
Access via the "RAG System" button in the header to view:
- **Vector Database Stats**:
  - Total chunks stored
  - Embedding model in use
  - Collection information
  
- **Knowledge Graph Stats**:
  - Total nodes and edges
  - Document count
  - Entity count
  
- **Live Visualization**:
  - View all nodes and relationships
  - See document-entity connections
  - Monitor system health

## API Endpoints

### Core Endpoints

#### Upload Document
```http
POST /upload
Content-Type: multipart/form-data

file: <file>
```
Uploads and processes a document, adding it to the RAG system.

#### Chat with RAG
```http
POST /chat
Content-Type: application/json

{
  "message": "Your question here"
}
```
Queries the RAG system and generates a response using retrieved context.

### RAG Management Endpoints

#### Get RAG Status
```http
GET /rag/status
```
Returns current system statistics including vector DB and knowledge graph info.

#### Get Knowledge Graph
```http
GET /rag/knowledge-graph
```
Returns all nodes and edges for visualization.

#### Clear RAG System
```http
DELETE /rag/clear
```
Clears all data from the vector database and knowledge graph.

## How It Works

### 1. Document Upload Flow

```python
# User uploads a file
file = upload_file("study_notes.pdf")

# System extracts text using Gemini Vision
text = process_file(file_path, mime_type)

# Text is chunked semantically
chunks = chunk_text(text, chunk_size=800, overlap=150)

# Each chunk gets embedded
for chunk in chunks:
    embedding = generate_embedding(chunk)
    vector_db.add(chunk, embedding, metadata)

# Entities are extracted
entities = extract_entities(text)

# Knowledge graph is updated
knowledge_graph.add_document(filename, entities)
```

### 2. Query Flow

```python
# User asks a question
query = "What are the types of machine learning?"

# Query is embedded
query_embedding = generate_embedding(query)

# Similar chunks are retrieved
results = vector_db.query(query_embedding, n_results=5)

# Context is sent to LLM
context = "\n".join(results)
response = llm.generate(query, context)
```

### 3. Embedding Generation

**With Gemini API:**
```python
result = genai.embed_content(
    model="models/embedding-001",
    content=text,
    task_type="retrieval_document"
)
embedding = result['embedding']  # 768-dimensional vector
```

**Fallback (sentence-transformers):**
```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
embedding = model.encode(text)
```

## Configuration

### Environment Variables

```env
GEMINI_API_KEY=your_api_key_here
```

### Embedding Settings

Located in `rag_engine_enhanced.py`:
- `chunk_size`: 800 characters (adjustable)
- `overlap`: 150 characters (adjustable)
- `n_results`: 5 (default query results)
- `similarity_metric`: cosine

## Testing

Run the comprehensive test suite:

```bash
cd backend
python test_embeddings.py
```

This will test:
- ✅ Embedding generation
- ✅ RAG engine initialization
- ✅ Document addition
- ✅ Semantic search
- ✅ Knowledge graph construction

## Troubleshooting

### Gemini API Quota Exceeded

**Symptom**: Error message about quota limits

**Solution**: The system automatically falls back to sentence-transformers. No action needed.

### No Results from Query

**Possible Causes**:
1. No documents uploaded
2. Query too specific
3. Documents don't contain relevant information

**Solution**: Upload more documents or rephrase your query.

### ChromaDB Errors

**Solution**: Clear and reinitialize:
```bash
cd backend
python reset_chroma.py
```

## Performance Optimization

### Chunking Strategy
- Semantic chunking at sentence boundaries
- Overlap prevents context loss
- Adjustable chunk size for different document types

### Embedding Caching
- Embeddings are persisted in ChromaDB
- No re-computation on restart
- Fast query times after initial processing

### Knowledge Graph
- Lightweight graph storage (JSON)
- Fast entity lookup
- Minimal memory footprint

## Future Enhancements

Potential improvements:
- [ ] Graph visualization in frontend
- [ ] Advanced entity recognition (NER)
- [ ] Multi-modal embeddings (text + images)
- [ ] Hybrid search (keyword + semantic)
- [ ] Document clustering
- [ ] Automatic summarization

## Technical Stack

- **Vector DB**: ChromaDB
- **Embeddings**: Gemini API / sentence-transformers
- **Knowledge Graph**: NetworkX
- **Text Extraction**: Gemini 1.5 Flash
- **Backend**: FastAPI
- **Frontend**: React + Framer Motion

## Conclusion

Your Personal Study Assistant now has a **production-ready RAG system** that:
- ✅ Converts documents to searchable vector embeddings
- ✅ Builds knowledge graphs automatically
- ✅ Provides semantic search capabilities
- ✅ Handles API quota limits gracefully
- ✅ Offers real-time monitoring

The LLM can now **access and retrieve data** from your uploaded files effectively!
