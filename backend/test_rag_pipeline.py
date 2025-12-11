import os
import sys

# Ensure backend directory is in path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from rag_engine_enhanced import EnhancedRAGEngine

def test_rag_pipeline():
    print("--- Testing RAG Pipeline ---")
    
    # 1. Initialize
    print("\n1. Initializing RAG Engine...")
    engine = EnhancedRAGEngine()
    
    # 2. Add Document
    print("\n2. Adding test document...")
    test_text = "The quick brown fox jumps over the lazy dog. Machine Learning is fascinating."
    metadata = {"filename": "test_fox.txt", "type": "text/plain"}
    
    # Clear first to ensure clean state? No, let's just add.
    # Actually, if we add duplicate, it just adds more chunks.
    engine.add_document(test_text, metadata)
    
    # 3. Query Immediate
    print("\n3. Querying immediately...")
    results = engine.query("What does the fox do?")
    print(f"Results: {results}")
    
    if results and "fox" in results[0]:
        print("✅ Immediate Query Success")
    else:
        print("❌ Immediate Query Failed")

    results_ml = engine.query("learning")
    print(f"ML Results: {results_ml}")

if __name__ == "__main__":
    test_rag_pipeline()
