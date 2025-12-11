import chromadb
from chromadb.utils import embedding_functions
import os

# Get the absolute path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(BASE_DIR, "chroma_db")

print(f"Chroma DB path: {CHROMA_PATH}")

# Initialize client
client = chromadb.PersistentClient(path=CHROMA_PATH)

# List collections
print("\nExisting collections:")
collections = client.list_collections()
for col in collections:
    print(f"  - {col.name}")

# Try to get the study_assistant_rag collection
try:
    collection = client.get_collection(name="study_assistant_rag")
    print(f"\n✓ Found 'study_assistant_rag' collection")
    print(f"  - Document count: {collection.count()}")
    print(f"  - Metadata: {collection.metadata}")
except Exception as e:
    print(f"\n✗ Error getting collection: {e}")
