import chromadb
from chromadb.utils import embedding_functions
import os

CHROMA_PATH = "chroma_db"

# Initialize client
client = chromadb.PersistentClient(path=CHROMA_PATH)

print("Current collections:")
collections = client.list_collections()
for col in collections:
    print(f"  - {col.name}: {col.count()} documents")

# Delete old collection if it exists
try:
    client.delete_collection("college_rag")
    print("\nDeleted old 'college_rag' collection")
except:
    print("\nNo existing 'college_rag' collection to delete")

# Create new collection with embedding function
embedding_function = embedding_functions.DefaultEmbeddingFunction()
collection = client.get_or_create_collection(
    name="college_rag",
    embedding_function=embedding_function
)

print(f"\nCreated new 'college_rag' collection with embedding function")
print(f"Collection count: {collection.count()}")
