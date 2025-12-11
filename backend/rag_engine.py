import chromadb
from chromadb.utils import embedding_functions
import networkx as nx
import json
import os
from typing import List, Dict
import hashlib

CHROMA_PATH = "chroma_db"
GRAPH_PATH = "knowledge_graph.json"

class RAGEngine:
    def __init__(self):
        self.chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
        
        # Use default embedding function (sentence transformers)
        self.embedding_function = embedding_functions.DefaultEmbeddingFunction()
        
        # Get or create collection with embedding function
        self.collection = self.chroma_client.get_or_create_collection(
            name="college_rag",
            embedding_function=self.embedding_function
        )
        
        self.graph = nx.Graph()
        self.load_graph()
        
        print(f"RAG Engine initialized. Collection has {self.collection.count()} documents.")

    def load_graph(self):
        if os.path.exists(GRAPH_PATH):
            with open(GRAPH_PATH, 'r') as f:
                data = json.load(f)
                self.graph = nx.node_link_graph(data)

    def save_graph(self):
        data = nx.node_link_data(self.graph)
        with open(GRAPH_PATH, 'w') as f:
            json.dump(data, f)

    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into overlapping chunks for better retrieval."""
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start += chunk_size - overlap
            
        return chunks

    def add_document(self, text: str, metadata: Dict):
        """Add document to vector DB with chunking."""
        print(f"Adding document: {metadata.get('filename', 'unknown')}")
        
        # Chunk the text for better retrieval
        chunks = self.chunk_text(text)
        print(f"Split into {len(chunks)} chunks")
        
        # Add each chunk to the collection
        for i, chunk in enumerate(chunks):
            # Create unique ID using hash of content
            chunk_id = hashlib.md5(f"{metadata.get('filename', 'unknown')}_{i}_{chunk[:50]}".encode()).hexdigest()
            
            chunk_metadata = metadata.copy()
            chunk_metadata['chunk_index'] = i
            chunk_metadata['total_chunks'] = len(chunks)
            
            try:
                self.collection.add(
                    documents=[chunk],
                    metadatas=[chunk_metadata],
                    ids=[chunk_id]
                )
            except Exception as e:
                print(f"Error adding chunk {i}: {e}")
        
        # Add to Graph
        doc_node = metadata.get("filename", "unknown")
        self.graph.add_node(doc_node, type="document")
        self.graph.add_edge(doc_node, "College_Data")
        self.save_graph()
        
        print(f"Document added successfully. Total documents in collection: {self.collection.count()}")

    def query(self, query_text: str, n_results: int = 5):
        """Query the RAG system."""
        print(f"Querying RAG with: {query_text}")
        print(f"Collection size: {self.collection.count()}")
        
        try:
            if self.collection.count() == 0:
                print("Collection is empty!")
                return []
                
            results = self.collection.query(
                query_texts=[query_text],
                n_results=min(n_results, self.collection.count())
            )
            
            print(f"RAG Results found: {len(results['documents'][0]) if results['documents'] else 0}")
            
            if results['documents'] and results['documents'][0]:
                print(f"First result preview: {results['documents'][0][0][:200]}...")
            
            return results['documents'][0] if results['documents'] else []
        except Exception as e:
            print(f"RAG Query Error: {e}")
            import traceback
            traceback.print_exc()
            return []
