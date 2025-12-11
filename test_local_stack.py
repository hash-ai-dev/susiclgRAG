import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    print("Testing imports...")
    from backend.ingestion import process_file
    from backend.rag_engine_enhanced import EnhancedRAGEngine
    print("Imports successful.")

    # Test Ingestion (Mock)
    print("Testing Ingestion logic...")
    # Create a dummy text file
    with open("test_doc.txt", "w") as f:
        f.write("Artificial Intelligence is transforming education. The University of Tomorrow uses AI for personalized learning.")
    
    content = process_file("test_doc.txt", "text/plain")
    print(f"Ingestion result length: {len(content)}")
    assert len(content) > 0

    # Test RAG Engine (Loading models)
    print("Initializing RAG Engine (this loads Spacy and SentenceTransformers)...")
    rag = EnhancedRAGEngine()
    
    print("Adding document to RAG...")
    rag.add_document(content, {"filename": "test_doc.txt"})
    
    print("Querying RAG...")
    results = rag.query("What is transforming education?")
    print(f"Query results: {results}")
    
    print("Verifying Knowledge Graph...")
    entities = rag.get_related_entities("test_doc.txt")
    print(f"Extracted entities: {entities}")
    
    print("Verification PASSED!")

except Exception as e:
    print(f"Verification FAILED: {e}")
    import traceback
    traceback.print_exc()
