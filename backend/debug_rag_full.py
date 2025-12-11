import os
import sys
import shutil

# Ensure backend directory is in path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from rag_engine_enhanced import EnhancedRAGEngine

def debug_rag_system():
    print("==================================================")
    print("       RAG SYSTEM DIAGNOSTIC TOOL")
    print("==================================================")

    # 1. Initialize Engine
    print("\n[1] Initializing EnhancedRAGEngine...")
    try:
        engine = EnhancedRAGEngine()
        print("    [OK] Engine initialized successfully.")
    except Exception as e:
        print(f"    [ERROR] Engine initialization failed: {e}")
        return

    # 2. Check Collection Stats BEFORE Test
    count_before = engine.collection.count()
    print(f"\n[2] Collection State (Before): {count_before} documents.")

    # 3. Create a Test Document
    filename = "debug_fact_sheet.txt"
    content = """
    project_codename: BlueSky
    secret_key: KB-9920
    launch_date: 2025-10-15
    The project BlueSky is managed by Dr. Emily Carter.
    It involves using quantum sensors to detect underwater anomalies.
    The budget for BlueSky is $50 million.
    """
    metadata = {"filename": filename, "type": "text/plain"}
    
    print("\n[3] Ingesting Test Document...")
    print(f"    Content: {content.strip()}")
    
    try:
        # We process it manually to see exact chunks if possible, 
        # but add_document does chunking internally.
        engine.add_document(content, metadata)
        print("    [OK] Document added to pipeline.")
    except Exception as e:
        print(f"    [ERROR] Ingestion failed: {e}")
        return

    # 4. Check Collection Stats AFTER Test
    count_after = engine.collection.count()
    print(f"\n[4] Collection State (After): {count_after} documents.")
    
    if count_after <= count_before:
        print("    [ERROR] Document count did not increase! Storage failed.")
        return
    else:
        print(f"    [OK] Success: Added {count_after - count_before} chunks.")

    # 5. Verify Embeddings / Vectors (Peek)
    print("\n[5] Inspecting Stored Chunks (Peek)...")
    peek = engine.collection.peek(limit=5)
    if peek['ids']:
        print(f"    IDs: {peek['ids']}")
    else:
        print("    [ERROR] Collection is empty strictly speaking?? (Contradicts count)")

    # 6. Test Retrieval (Exact Keyword)
    query_1 = "BlueSky"
    print(f"\n[6] Testing Retrieval: Query = '{query_1}'")
    results_1 = engine.query(query_1, n_results=3)
    print("    Results:")
    for i, res in enumerate(results_1):
        print(f"      {i+1}. {res}")
    
    if any("BlueSky" in r for r in results_1):
        print("    [OK] Retrieval Passed for keyword.")
    else:
        print("    [FAIL] Retrieval FAILED for keyword 'BlueSky'.")

    # 7. Test Retrieval (Semantic / Question)
    query_2 = "Who manages the underwater project?"
    print(f"\n[7] Testing Retrieval: Query = '{query_2}'")
    results_2 = engine.query(query_2, n_results=3)
    print("    Results:")
    for i, res in enumerate(results_2):
        print(f"      {i+1}. {res}")

    if any("Emily Carter" in r for r in results_2):
        print("    [OK] Retrieval Passed for semantic question.")
    else:
        print("    [FAIL] Retrieval FAILED for semantic question (Expected 'Emily Carter').")

    # 8. Check Knowledge Graph
    print("\n[8] Checking Knowledge Graph...")
    try:
        entities = engine.get_related_entities(filename)
        print(f"    Entities for {filename}: {entities}")
        if entities:
            print("    [OK] Knowledge Graph nodes created.")
        else:
            print("    [WARN] No entities found in KG for this doc.")
    except Exception as e:
        print(f"    [ERROR] Graph check failed: {e}")

    print("\n==================================================")
    print("             DIAGNOSIS COMPLETE")
    print("==================================================")

if __name__ == "__main__":
    debug_rag_system()
