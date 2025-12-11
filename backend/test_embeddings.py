# -*- coding: utf-8 -*-
"""
Test script to verify vector embeddings and knowledge graph functionality.
"""
import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai
from rag_engine_enhanced import EnhancedRAGEngine

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

def test_embeddings():
    """Test that embeddings are being generated correctly."""
    print("=" * 60)
    print("TESTING VECTOR EMBEDDINGS")
    print("=" * 60)
    
    # Check API key
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[FAIL] GEMINI_API_KEY not found!")
        return False
    
    print(f"[OK] API Key found: {api_key[:10]}...")
    genai.configure(api_key=api_key)
    
    # Test embedding generation
    print("\nTesting embedding generation...")
    try:
        test_text = "This is a test document about machine learning and artificial intelligence."
        result = genai.embed_content(
            model="models/embedding-001",
            content=test_text,
            task_type="retrieval_document"
        )
        embedding = result['embedding']
        print(f"[OK] Successfully generated embedding!")
        print(f"   - Embedding dimension: {len(embedding)}")
        print(f"   - First 5 values: {embedding[:5]}")
        return True
    except Exception as e:
        print(f"[FAIL] Failed to generate embedding: {e}")
        return False

def test_rag_engine():
    """Test the RAG engine with sample documents."""
    print("\n" + "=" * 60)
    print("TESTING RAG ENGINE")
    print("=" * 60)
    
    try:
        # Initialize RAG engine
        print("\nInitializing RAG engine...")
        rag = EnhancedRAGEngine()
        
        # Get initial stats
        stats = rag.get_stats()
        print(f"\nInitial Stats:")
        print(f"   - Total chunks: {stats['total_chunks']}")
        print(f"   - Graph nodes: {stats['graph_nodes']}")
        print(f"   - Graph edges: {stats['graph_edges']}")
        
        # Add a test document
        print("\nAdding test document...")
        test_doc = """
        Machine Learning Fundamentals
        
        Machine learning is a subset of artificial intelligence that focuses on 
        building systems that can learn from data. There are three main types:
        
        1. Supervised Learning: Uses labeled data to train models
        2. Unsupervised Learning: Finds patterns in unlabeled data
        3. Reinforcement Learning: Learns through trial and error
        
        Key concepts include neural networks, deep learning, and gradient descent.
        Popular frameworks include TensorFlow, PyTorch, and scikit-learn.
        """
        
        rag.add_document(test_doc, {"filename": "ml_fundamentals.txt", "type": "text/plain"})
        
        # Get updated stats
        stats = rag.get_stats()
        print(f"\nUpdated Stats:")
        print(f"   - Total chunks: {stats['total_chunks']}")
        print(f"   - Graph nodes: {stats['graph_nodes']}")
        print(f"   - Graph edges: {stats['graph_edges']}")
        print(f"   - Documents: {stats['documents']}")
        print(f"   - Entities: {stats['entities']}")
        
        # Test querying
        print("\nTesting query...")
        query = "What are the types of machine learning?"
        results = rag.query(query, n_results=3)
        
        if results:
            print(f"[OK] Query successful! Found {len(results)} results")
            print(f"\nTop result preview:")
            print(f"   {results[0][:200]}...")
        else:
            print("[WARN] No results found")
        
        # Test knowledge graph
        print("\nKnowledge Graph:")
        for node, data in list(rag.graph.nodes(data=True))[:10]:
            print(f"   - {node}: {data}")
        
        return True
        
    except Exception as e:
        print(f"[FAIL] RAG engine test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("\n=== Starting Vector Embedding & Knowledge Graph Tests ===\n")
    
    # Test embeddings
    embedding_ok = test_embeddings()
    
    # Test RAG engine
    rag_ok = test_rag_engine()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Embeddings: {'PASS' if embedding_ok else 'FAIL'}")
    print(f"RAG Engine: {'PASS' if rag_ok else 'FAIL'}")
    print("=" * 60)
    
    if embedding_ok and rag_ok:
        print("\n[SUCCESS] All tests passed! Your RAG system is fully functional!")
    else:
        print("\n[WARNING] Some tests failed. Please check the errors above.")
