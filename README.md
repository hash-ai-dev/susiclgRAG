# 🎓 Personal Study Assistant (Local RAG + LLaMA)

A privacy-focused, intelligent study assistant that uses **Retrieval-Augmented Generation (RAG)** and **Local LLMs (LLaMA 3.2)** to help students analyze documents, perform crystal ball readings (performance analysis), and predict future exam questions—all running locally on your machine.

---

## 🌟 Key Features
- **Local RAG Engine**: Uses `ChromaDB` and `BGE-M3` embeddings for semantic search.
- **Local LLM**: Powered by `LLaMA 3.2` via **Ollama** (No API keys required!).
- **Knowledge Graph**: Integrated graph to map relationships between concepts.
- **Privacy-First**: Your data never leaves your computer.
- **Magical UI**: A Harry Potter-themed React frontend for an immersive experience.

---

## 🛠️ Prerequisites

1.  **Python 3.10+**
2.  **Node.js & npm** (for frontend)
3.  **Ollama** (for running the local AI model)

---

## 🚀 Setup Instructions

### 1. Install & Run Ollama (The AI Brain)
1.  Download and install Ollama from [ollama.com](https://ollama.com).
2.  Open a terminal and run the following command to download the model:
    ```bash
    ollama run llama3.2
    ```
    *(Keep this terminal open or ensure Ollama is running in the background).*

### 2. Backend Setup
1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # Mac/Linux:
    source venv/bin/activate
    ```
3.  Install Python dependencies (includes **ChromaDB**):
    ```bash
    pip install -r requirements.txt
    ```
4.  Download the Spacy NLP model:
    ```bash
    python -m spacy download en_core_web_sm
    ```
5.  (Optional) Configure Environment:
    Copy `.env.example` to `.env` if you wish to change the default Ollama URL or model name.
    
6.  Run the Backend Server:
    ```bash
    python -m uvicorn main:app --reload --port 8000
    ```
    > **Note:** The first time you run this, it will automatically download the **BGE-M3 embedding model** (approx 500MB). This happens only once.

### 3. Frontend Setup
1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the Frontend:
    ```bash
    npm run dev
    ```
4.  Open the link shown (usually `http://localhost:5173`) in your browser.

---

## 🧙‍♂️ How to Use
1.  **Add Scrolls**: Upload your study PDFs/Images in the "Magical Library".
2.  **Cast Spells (Chat)**: Ask questions about your materials. The AI will answer based ONLY on your documents.
3.  **Crystal Ball**: Click "Crystal Ball Reading" to analyze your exam performance (requires uploading score sheets).
4.  **Divination**: Click "Divination" (requires 2+ question papers) to predict future questions.

---

## 🏗️ Architecture
- **Backend**: FastAPI, ChromaDB, Sentence-Transformers, PyMuPDF, EasyOCR.
- **Frontend**: React, Vite, TailwindCSS, Framer Motion.
- **AI**: Ollama (LLaMA 3.2), BAAI/bge-m3 (Embeddings).
