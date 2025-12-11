import chromadb
from chromadb.utils import embedding_functions
import os
import shutil

# Get the absolute path of the directory containing this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(BASE_DIR, "chroma_db")
GRAPH_PATH = os.path.join(BASE_DIR, "knowledge_graph.json")

print(f"Resetting RAG system...")
print(f"Chroma DB path: {CHROMA_PATH}")
print(f"Knowledge graph path: {GRAPH_PATH}")

# Delete the entire chroma_db directory
if os.path.exists(CHROMA_PATH):
    try:
        shutil.rmtree(CHROMA_PATH)
        print(f"✓ Deleted chroma_db directory")
    except Exception as e:
        print(f"✗ Error deleting chroma_db: {e}")

# Delete knowledge graph
if os.path.exists(GRAPH_PATH):
    try:
        os.remove(GRAPH_PATH)
        print(f"✓ Deleted knowledge graph")
    except Exception as e:
        print(f"✗ Error deleting knowledge graph: {e}")

# Recreate with BGE-M3 model
print("\nInitializing new RAG system with BGE-M3...")
client = chromadb.PersistentClient(path=CHROMA_PATH)

embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="BAAI/bge-m3"
)

collection = client.get_or_create_collection(
    name="study_assistant_rag",
    embedding_function=embedding_function,
    metadata={"hnsw:space": "cosine"}
)

print(f"✓ Created new collection with BGE-M3 embedding model")
print(f"✓ Collection count: {collection.count()}")
print("\nRAG system reset complete! You can now restart the backend server.")
