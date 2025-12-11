import chromadb
from chromadb.utils import embedding_functions
import networkx as nx
import json
import os
from typing import List, Dict, Optional
import hashlib
import spacy
from dotenv import load_dotenv
import re

load_dotenv()

import os
# ... imports ...

load_dotenv()

# Get the absolute path of the directory containing this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(BASE_DIR, "chroma_db")
GRAPH_PATH = os.path.join(BASE_DIR, "knowledge_graph.json")

class EnhancedRAGEngine:
    def __init__(self):
        """Initialize the enhanced RAG engine with Local embeddings and Spacy."""
        self.chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
        
        print("[INFO] Initializing RAG Engine with Local Models...")
        
        # 1. Embeddings: Use BGE-M3 model (local)
        print("[INFO] Loading BGE-M3 embedding model...")
        self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="BAAI/bge-m3"
        )
        
        # 2. NLP: Load Spacy model for Entity Extraction & Chunking
        print("[INFO] Loading Spacy NLP model (en_core_web_sm)...")
        try:
            self.nlp = spacy.load("en_core_web_sm")
            print("[OK] Spacy model loaded successfully")
        except Exception as e:
            print(f"[WARN] Failed to load Spacy model: {e}")
            print("Try running: python -m spacy download en_core_web_sm")
            # Fallback to simple blank model if possible or re-raise? 
            # We'll re-raise because we need it for the logic we promised.
            # Actually, let's try to download it if missing? No, that might hang.
            raise e

        # Get or create collection
        # If there's an embedding function mismatch, delete and recreate
        collection_name = "study_assistant_rag"
        try:
            # Try to get existing collection
            existing_collections = [c.name for c in self.chroma_client.list_collections()]
            if collection_name in existing_collections:
                # Collection exists, try to get it
                try:
                    self.collection = self.chroma_client.get_collection(
                        name=collection_name,
                        embedding_function=self.embedding_function
                    )
                    print(f"[OK] Loaded existing collection with {self.collection.count()} documents")
                except ValueError as e:
                    # Embedding function mismatch
                    print("[WARN] Embedding function mismatch detected. Recreating collection...")
                    self.chroma_client.delete_collection(name=collection_name)
                    self.collection = self.chroma_client.create_collection(
                        name=collection_name,
                        embedding_function=self.embedding_function,
                        metadata={"hnsw:space": "cosine"}
                    )
                    print("[OK] Created new collection with BGE-M3")
            else:
                # Collection doesn't exist, create it
                self.collection = self.chroma_client.create_collection(
                    name=collection_name,
                    embedding_function=self.embedding_function,
                    metadata={"hnsw:space": "cosine"}
                )
                print(f"[OK] Created new collection '{collection_name}'")
        except Exception as e:
            print(f"[ERROR] Failed to initialize collection: {e}")
            raise e
        
        # Initialize knowledge graph
        self.graph = nx.DiGraph()
        self.load_graph()
        
        print(f"[OK] Enhanced RAG Engine initialized. Collection has {self.collection.count()} documents.")

    def load_graph(self):
        """Load knowledge graph from disk."""
        if os.path.exists(GRAPH_PATH):
            try:
                with open(GRAPH_PATH, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.graph = nx.node_link_graph(data, directed=True)
                print(f"[INFO] Loaded knowledge graph with {self.graph.number_of_nodes()} nodes")
            except Exception as e:
                print(f"[ERROR] Error loading graph: {e}")
                self.graph = nx.DiGraph()

    def save_graph(self):
        """Save knowledge graph to disk."""
        try:
            data = nx.node_link_data(self.graph)
            with open(GRAPH_PATH, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving graph: {e}")

    def extract_entities(self, text: str) -> List[str]:
        """Extract key entities from text using Spacy NER."""
        if not text:
            return []
            
        doc = self.nlp(text[:100000]) # Limit length to avoid memory issues
        
        # Extract specific entity types suitable for a study assistant/KG
        target_labels = ["PERSON", "ORG", "GPE", "WORK_OF_ART", "EVENT", "FAC", "PRODUCT", "LAW"]
        
        entities = []
        for ent in doc.ents:
            if ent.label_ in target_labels:
                clean_ent = ent.text.strip()
                if len(clean_ent) > 2 and clean_ent.lower() not in ["the", "this", "that"]:
                    entities.append(clean_ent)
        
        # Deduplicate while preserving order
        seen = set()
        unique_entities = []
        for e in entities:
            if e not in seen:
                unique_entities.append(e)
                seen.add(e)
                
        return unique_entities[:30]  # Limit to top 30 entities

    def chunk_text(self, text: str, chunk_size: int = 800, overlap: int = 150) -> List[str]:
        """
        Split text into overlapping chunks using Spacy sentence segmentation.
        """
        doc = self.nlp(text)
        sentences = [sent.text.strip() for sent in doc.sents]
        
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            if len(current_chunk) + len(sentence) > chunk_size and current_chunk:
                chunks.append(current_chunk.strip())
                # Start new chunk with overlap
                # Simple overlap: just keep the last sentence of previous chunk if it fits?
                # Or better: keep tail of current_chunk. 
                # Let's simple overlap: keep nothing or minimal? 
                # Better strategy matches original: keep last 'overlap' characters approx.
                overlap_text = current_chunk[-overlap:] if len(current_chunk) > overlap else current_chunk
                current_chunk = overlap_text + " " + sentence
            else:
                current_chunk += " " + sentence
        
        if current_chunk.strip():
            chunks.append(current_chunk.strip())
            
        return chunks

    def add_document(self, text: str, metadata: Dict):
        """
        Add document to vector DB and Knowledge Graph using local models.
        """
        filename = metadata.get('filename', 'unknown')
        print(f"[INFO] Adding document: {filename}")
        
        if not text or len(text.strip()) < 10:
            print("[WARN] Document text is too short or empty")
            return
        
        # Chunk the text
        chunks = self.chunk_text(text)
        print(f"[INFO] Split into {len(chunks)} semantic chunks")
        
        # Extract entities for KG (using first chunk or summary amount)
        # Use first few chunks to get a good spread of entities
        sample_text = " ".join(chunks[:3]) 
        entities = self.extract_entities(sample_text)
        print(f"[INFO] Extracted {len(entities)} entities via Spacy: {entities[:5]}...")
        
        # Update Knowledge Graph
        doc_node = f"doc_{filename}"
        self.graph.add_node(doc_node, type="document", filename=filename, chunk_count=len(chunks))
        
        for entity in entities:
            entity_node = f"entity_{entity}"
            self.graph.add_node(entity_node, type="entity", name=entity)
            self.graph.add_edge(doc_node, entity_node, relation="contains")
        
        # Add chunks to Vector DB
        added_chunks = 0
        for i, chunk in enumerate(chunks):
            if len(chunk.strip()) < 20:
                continue
                
            chunk_id = hashlib.md5(f"{filename}_{i}_{chunk[:100]}".encode()).hexdigest()
            
            chunk_metadata = metadata.copy()
            chunk_metadata['chunk_index'] = i
            chunk_metadata['total_chunks'] = len(chunks)
            chunk_metadata['chunk_size'] = len(chunk)
            
            try:
                self.collection.add(
                    documents=[chunk],
                    metadatas=[chunk_metadata],
                    ids=[chunk_id]
                )
                added_chunks += 1
            except Exception as e:
                print(f"[ERROR] Error adding chunk {i}: {e}")
        
        self.save_graph()
        
        print(f"[OK] Document added successfully!")
        print(f"   - Added {added_chunks}/{len(chunks)} chunks")
        print(f"   - Total documents in collection: {self.collection.count()}")
        print(f"   - Knowledge graph: {self.graph.number_of_nodes()} nodes")

    def query(self, query_text: str, n_results: int = 5) -> List[str]:
        """
        Query the RAG system using local embeddings.
        """
        print(f"[INFO] Querying RAG with: '{query_text[:100]}...'")
        
        try:
            if self.collection.count() == 0:
                print("[WARN] Collection is empty!")
                return []
            
            results = self.collection.query(
                query_texts=[query_text],
                n_results=min(n_results, self.collection.count())
            )
            
            documents = results['documents'][0] if results['documents'] else []
            
            print(f"[OK] Found {len(documents)} relevant chunks")
            return documents
            
        except Exception as e:
            print(f"[ERROR] RAG Query Error: {e}")
            import traceback
            traceback.print_exc()
            return []

    def get_related_entities(self, filename: str) -> List[str]:
        doc_node = f"doc_{filename}"
        if doc_node in self.graph:
            neighbors = list(self.graph.neighbors(doc_node))
            entities = [self.graph.nodes[n].get('name', n) for n in neighbors 
                       if self.graph.nodes[n].get('type') == 'entity']
            return entities
        return []

    def get_stats(self) -> Dict:
        return {
            "total_chunks": self.collection.count(),
            "graph_nodes": self.graph.number_of_nodes(),
            "graph_edges": self.graph.number_of_edges(),
            "documents": len([n for n, d in self.graph.nodes(data=True) if d.get('type') == 'document']),
            "entities": len([n for n, d in self.graph.nodes(data=True) if d.get('type') == 'entity'])
        }

    def get_documents(self) -> List[Dict]:
        """Get list of all documents in the knowledge graph."""
        docs = []
        for node, data in self.graph.nodes(data=True):
            if data.get("type") == "document":
                docs.append({
                    "name": data.get("filename", node), # Use filename if available, else node ID
                    "size": data.get("size", 0),  # We might not have stored size, default to 0
                    "type": data.get("mime_type", "application/pdf")
                })
        return docs

    def clear_all(self):
        try:
            self.chroma_client.delete_collection(name="study_assistant_rag")
            self.collection = self.chroma_client.get_or_create_collection(
                name="study_assistant_rag",
                embedding_function=self.embedding_function,
                metadata={"hnsw:space": "cosine"}
            )
            self.graph.clear()
            self.save_graph()
            print("[INFO] All RAG data cleared")
        except Exception as e:
            print(f"Error clearing data: {e}")
