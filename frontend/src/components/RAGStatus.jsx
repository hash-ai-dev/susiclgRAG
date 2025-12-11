import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './RAGStatus.css';

const RAGStatus = () => {
    const [status, setStatus] = useState(null);
    const [knowledgeGraph, setKnowledgeGraph] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRAGStatus = async () => {
        try {
            const response = await fetch('http://localhost:8000/rag/status');
            if (!response.ok) throw new Error('Failed to fetch RAG status');
            const data = await response.json();
            setStatus(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchKnowledgeGraph = async () => {
        try {
            const response = await fetch('http://localhost:8000/rag/knowledge-graph');
            if (!response.ok) throw new Error('Failed to fetch knowledge graph');
            const data = await response.json();
            setKnowledgeGraph(data);
        } catch (err) {
            console.error('Error fetching knowledge graph:', err);
        }
    };

    const clearRAGSystem = async () => {
        if (!window.confirm('Are you sure you want to clear all RAG data? This cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/rag/clear', {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to clear RAG system');
            await fetchRAGStatus();
            await fetchKnowledgeGraph();
            alert('RAG system cleared successfully!');
        } catch (err) {
            alert('Error clearing RAG system: ' + err.message);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchRAGStatus();
            await fetchKnowledgeGraph();
            setLoading(false);
        };

        loadData();

        // Refresh every 10 seconds
        const interval = setInterval(() => {
            fetchRAGStatus();
            fetchKnowledgeGraph();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="rag-status-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading RAG System Status...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rag-status-container">
                <div className="error-message">
                    <h3>⚠️ Error Loading RAG Status</h3>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="rag-status-container">
            <motion.div
                className="rag-status-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2>🧠 RAG System Status</h2>
                <div className="status-badge">
                    <span className={`status-indicator ${status?.status === 'operational' ? 'operational' : 'error'}`}></span>
                    {status?.status || 'Unknown'}
                </div>
            </motion.div>

            <div className="rag-stats-grid">
                {/* Vector Database Stats */}
                <motion.div
                    className="stat-card vector-db-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="stat-icon">🔮</div>
                    <h3>Vector Database</h3>
                    <div className="stat-details">
                        <div className="stat-row">
                            <span className="stat-label">Total Chunks:</span>
                            <span className="stat-value">{status?.vector_database?.total_chunks || 0}</span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-label">Embedding Model:</span>
                            <span className="stat-value model-name">{status?.vector_database?.embedding_model || 'N/A'}</span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-label">Collection:</span>
                            <span className="stat-value">{status?.vector_database?.collection_name || 'N/A'}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Knowledge Graph Stats */}
                <motion.div
                    className="stat-card knowledge-graph-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="stat-icon">🕸️</div>
                    <h3>Knowledge Graph</h3>
                    <div className="stat-details">
                        <div className="stat-row">
                            <span className="stat-label">Total Nodes:</span>
                            <span className="stat-value">{status?.knowledge_graph?.total_nodes || 0}</span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-label">Total Edges:</span>
                            <span className="stat-value">{status?.knowledge_graph?.total_edges || 0}</span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-label">Documents:</span>
                            <span className="stat-value">{status?.knowledge_graph?.documents || 0}</span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-label">Entities:</span>
                            <span className="stat-value">{status?.knowledge_graph?.entities || 0}</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Knowledge Graph Visualization */}
            {knowledgeGraph && (knowledgeGraph.nodes.length > 0 || knowledgeGraph.edges.length > 0) && (
                <motion.div
                    className="knowledge-graph-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h3>📊 Knowledge Graph Overview</h3>
                    <div className="graph-details">
                        <div className="graph-nodes">
                            <h4>Nodes ({knowledgeGraph.nodes.length})</h4>
                            <div className="node-list">
                                {knowledgeGraph.nodes.slice(0, 10).map((node, idx) => (
                                    <div key={idx} className={`node-item ${node.type}`}>
                                        <span className="node-type-badge">{node.type}</span>
                                        <span className="node-label">{node.label}</span>
                                    </div>
                                ))}
                                {knowledgeGraph.nodes.length > 10 && (
                                    <div className="more-items">
                                        +{knowledgeGraph.nodes.length - 10} more nodes...
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="graph-edges">
                            <h4>Relationships ({knowledgeGraph.edges.length})</h4>
                            <div className="edge-list">
                                {knowledgeGraph.edges.slice(0, 10).map((edge, idx) => (
                                    <div key={idx} className="edge-item">
                                        <span className="edge-source">{edge.source.replace('doc_', '').replace('entity_', '')}</span>
                                        <span className="edge-relation">{edge.relation}</span>
                                        <span className="edge-target">{edge.target.replace('doc_', '').replace('entity_', '')}</span>
                                    </div>
                                ))}
                                {knowledgeGraph.edges.length > 10 && (
                                    <div className="more-items">
                                        +{knowledgeGraph.edges.length - 10} more relationships...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Actions */}
            <motion.div
                className="rag-actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <button className="refresh-btn" onClick={() => {
                    fetchRAGStatus();
                    fetchKnowledgeGraph();
                }}>
                    🔄 Refresh
                </button>
                <button className="clear-btn" onClick={clearRAGSystem}>
                    🗑️ Clear All Data
                </button>
            </motion.div>

            {/* Info Message */}
            {status?.vector_database?.total_chunks === 0 && (
                <motion.div
                    className="info-message"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <p>📚 No documents uploaded yet. Upload some study materials to see the RAG system in action!</p>
                </motion.div>
            )}
        </div>
    );
};

export default RAGStatus;
