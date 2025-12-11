from rag_engine import RAGEngine
import traceback

try:
    print("Initializing RAG Engine...")
    rag = RAGEngine()
    print("RAG Engine initialized successfully!")
    
    print("\nTesting query...")
    result = rag.query("test query")
    print(f"Query result: {result}")
    
except Exception as e:
    print(f"Error: {e}")
    traceback.print_exc()
