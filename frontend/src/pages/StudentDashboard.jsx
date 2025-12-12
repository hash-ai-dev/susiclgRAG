import React, { useState, useRef, useEffect } from 'react';
import MagicalSpellbook from '../components/MagicalSpellbook';
import GoldenSnitch from '../components/GoldenSnitch';
import MagicalCursor from '../components/MagicalCursor';
import RAGStatus from '../components/RAGStatus';
import { AnalysisWidget, PredictionWidget } from '../components/ChatWidgets';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Upload, Send, Sparkles, BookOpen, TrendingUp, Lightbulb, FileText, X, Menu, Wand2, Database } from 'lucide-react';

const StudentDashboard = () => {
    const [files, setFiles] = useState([]);
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [spellbookExpression, setSpellbookExpression] = useState('idle');
    const [isTyping, setIsTyping] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showRAGStatus, setShowRAGStatus] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch documents on mount
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const res = await axios.get('http://localhost:8000/documents');
                // Backend returns list of { name, size, type }
                setFiles(res.data);
            } catch (err) {
                console.error("Failed to fetch documents:", err);
            }
        };
        fetchDocuments();
    }, []);

    const hasStartedChat = chatHistory.length > 0;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isTyping]);

    // Handle File Upload
    const handleFileUpload = async (e) => {
        const uploadedFiles = Array.from(e.target.files);
        if (uploadedFiles.length === 0) return;

        setFiles(prev => [...prev, ...uploadedFiles]);

        for (const file of uploadedFiles) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                setSpellbookExpression('thinking');
                await new Promise(resolve => setTimeout(resolve, 800));
                await axios.post('http://localhost:8000/upload', formData);

                setChatHistory(prev => [...prev, {
                    role: 'system',
                    content: `📜 Successfully added **${file.name}** to the library`,
                    type: 'text'
                }]);
                setSpellbookExpression('happy');
            } catch (error) {
                console.error(error);
                setChatHistory(prev => [...prev, {
                    role: 'system',
                    content: `❌ Failed to add **${file.name}**`,
                    type: 'error'
                }]);
                setSpellbookExpression('confused');
            }
        }
        setTimeout(() => setSpellbookExpression('idle'), 2000);
    };

    // Handle Chat with Streaming
    const handleChat = async () => {
        if (!chatMessage.trim()) return;

        const userMsg = chatMessage;
        setChatMessage('');
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg, type: 'text' }]);
        setSpellbookExpression('thinking');
        setIsTyping(true);

        try {
            // Use fetch for streaming support
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMsg }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            setIsTyping(false); // Stop typing indicator as streaming starts
            setSpellbookExpression('talking');

            // Create a placeholder for the bot's response
            setChatHistory(prev => [...prev, { role: 'bot', content: '', type: 'text' }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botReply = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                botReply += chunk;

                // Update the last message in history with the accumulated text
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    const lastMsgIndex = newHistory.length - 1;
                    if (lastMsgIndex >= 0) {
                        newHistory[lastMsgIndex] = {
                            ...newHistory[lastMsgIndex],
                            content: botReply
                        };
                    }
                    return newHistory;
                });
            }

            setSpellbookExpression('happy');
            setTimeout(() => setSpellbookExpression('idle'), 4000);

        } catch (error) {
            console.error(error);
            setIsTyping(false);
            setSpellbookExpression('confused');
            // Remove the empty bot message if it was added (optional, but cleaner)
            setChatHistory(prev => {
                // Check if the last message was the empty bot one we just added
                if (prev.length > 0 && prev[prev.length - 1].role === 'bot' && prev[prev.length - 1].content === '') {
                    return prev.slice(0, -1);
                }
                return prev;
            });

            setChatHistory(prev => [...prev, {
                role: 'bot',
                content: "🦉 Hmm, something went wrong with the magic...",
                type: 'error'
            }]);
            setTimeout(() => setSpellbookExpression('idle'), 3000);
        }
    };

    // Handle Analysis
    const triggerAnalysis = async () => {
        if (files.length === 0) {
            setChatHistory(prev => [...prev, { role: 'system', content: "⚠️ Please upload a scroll first", type: 'warning' }]);
            return;
        }

        const fileToAnalyze = files[files.length - 1];
        setChatHistory(prev => [...prev, { role: 'user', content: "Analyze my performance", type: 'text' }]);
        setIsTyping(true);
        setSpellbookExpression('thinking');

        const formData = new FormData();
        formData.append('file', fileToAnalyze);

        try {
            const res = await axios.post('http://localhost:8000/analyze/performance', formData);
            setIsTyping(false);

            let analysisData = null;
            try {
                let jsonString = res.data.analysis.replace(/```json\n?|\n?```/g, '');
                analysisData = JSON.parse(jsonString);
            } catch (e) {
                analysisData = { raw_text: res.data.analysis };
            }

            setChatHistory(prev => [...prev, {
                role: 'bot',
                content: "Here's what the crystal ball reveals:",
                type: 'analysis',
                data: analysisData
            }]);
            setSpellbookExpression('excited');
        } catch (error) {
            setIsTyping(false);
            setChatHistory(prev => [...prev, { role: 'system', content: "❌ The spell failed", type: 'error' }]);
            setSpellbookExpression('confused');
        }
        setTimeout(() => setSpellbookExpression('idle'), 3000);
    };

    // Handle Prediction
    const triggerPrediction = async () => {
        if (files.length < 2) {
            setChatHistory(prev => [...prev, { role: 'system', content: "⚠️ Need at least 2 scrolls for divination", type: 'warning' }]);
            return;
        }

        setChatHistory(prev => [...prev, { role: 'user', content: "Predict future questions", type: 'text' }]);
        setIsTyping(true);
        setSpellbookExpression('thinking');

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        try {
            const res = await axios.post('http://localhost:8000/analyze/prediction', formData);
            setIsTyping(false);

            let predictionData = null;
            try {
                let jsonString = res.data.predictions.replace(/```json\n?|\n?```/g, '');
                predictionData = JSON.parse(jsonString);
            } catch (e) {
                predictionData = { raw_text: res.data.predictions };
            }

            setChatHistory(prev => [...prev, {
                role: 'bot',
                content: "The prophecy reveals:",
                type: 'prediction',
                data: predictionData
            }]);
            setSpellbookExpression('excited');
        } catch (error) {
            setIsTyping(false);
            setChatHistory(prev => [...prev, { role: 'system', content: "❌ Divination failed", type: 'error' }]);
            setSpellbookExpression('confused');
        }
        setTimeout(() => setSpellbookExpression('idle'), 3000);
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-magic-purple via-ink-black to-magic-burgundy text-parchment font-serif overflow-hidden relative">

            {/* Magical Cursor */}
            <MagicalCursor />

            {/* Magical Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-magic-gold/5 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-magic-emerald/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-magic-bronze/3 rounded-full blur-[100px]" />

                {/* Floating magical particles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-magic-gold rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Sidebar - Library */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-80 bg-black/40 backdrop-blur-xl border-r border-magic-gold/20 flex flex-col z-20 relative shadow-2xl"
                        style={{
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h20v20H0z" fill="%23000" fill-opacity="0.05"/%3E%3C/svg%3E")',
                        }}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-magic-gold/20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-magic-gold to-magic-bronze rounded-lg flex items-center justify-center shadow-lg shadow-magic-gold/20">
                                    <BookOpen className="w-6 h-6 text-ink-black" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-magic-gold via-magic-bronze to-magic-gold bg-clip-text text-transparent">
                                        Magical Library
                                    </h1>
                                    <p className="text-xs text-magic-gold/60">Hogwarts Study Assistant</p>
                                </div>
                            </div>
                        </div>

                        {/* Scrolls Collection */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-magic-gold/70 uppercase tracking-wider">Ancient Scrolls</h3>
                                    <span className="text-xs text-magic-gold font-semibold">{files.length}</span>
                                </div>

                                {files.length === 0 ? (
                                    <div className="p-6 border border-dashed border-magic-gold/20 rounded-xl text-center bg-black/20">
                                        <FileText className="w-8 h-8 text-magic-gold/40 mx-auto mb-2" />
                                        <p className="text-xs text-magic-gold/50">No scrolls in library</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {files.map((file, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group flex items-center gap-3 p-3 rounded-lg bg-parchment/5 hover:bg-parchment/10 border border-transparent hover:border-magic-gold/30 transition-all cursor-pointer"
                                            >
                                                <FileText className="w-4 h-4 text-magic-gold/60 group-hover:text-magic-gold flex-shrink-0" />
                                                <span className="text-sm text-parchment/80 truncate flex-1">{file.name}</span>
                                                <span className="text-xs text-magic-gold/50">{(file.size / 1024).toFixed(1)}KB</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Upload Scroll Button */}
                            <label className="flex items-center justify-center gap-2 w-full p-4 bg-gradient-to-r from-magic-gold/10 to-magic-bronze/10 hover:from-magic-gold/20 hover:to-magic-bronze/20 border border-magic-gold/30 rounded-xl cursor-pointer transition-all group mt-4">
                                <Upload className="w-4 h-4 text-magic-gold group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold text-magic-gold">Add Scroll</span>
                                <input type="file" multiple className="hidden" onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg,.txt" />
                            </label>
                        </div>

                        {/* Wizard Profile */}
                        <div className="p-6 border-t border-magic-gold/20 bg-black/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-magic-burgundy to-magic-purple flex items-center justify-center text-sm font-bold ring-2 ring-magic-gold/30">HS</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-parchment">Harish Sridar</p>
                                    <div className="flex items-center gap-1.5">
                                        <Wand2 className="w-3 h-3 text-magic-gold" />
                                        <p className="text-xs text-magic-gold">Wizard</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative z-10">

                {/* Header */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-magic-gold/20 bg-black/20 backdrop-blur-sm">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-magic-gold/10 rounded-lg transition-colors group"
                    >
                        <Menu className="w-5 h-5 text-magic-gold/60 group-hover:text-magic-gold" />
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowRAGStatus(!showRAGStatus)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-all ${showRAGStatus
                                ? 'bg-magic-gold/20 border-magic-gold/40 text-magic-gold'
                                : 'bg-magic-gold/5 border-magic-gold/20 text-magic-gold/60 hover:text-magic-gold'
                                }`}
                        >
                            <Database className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">RAG System</span>
                        </button>
                        <div className="flex items-center gap-2 px-4 py-2 bg-magic-gold/5 border border-magic-gold/20 rounded-full">
                            <Sparkles className="w-3.5 h-3.5 text-magic-gold" />
                            <span className="text-xs font-medium text-magic-gold">Magic Active</span>
                        </div>
                    </div>
                </header>


                {/* Chat Area or RAG Status */}
                {showRAGStatus ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <RAGStatus />
                    </div>
                ) : (
                    <>
                        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar scroll-smooth">
                            <div className="w-full max-w-7xl mx-auto space-y-6">

                                {/* Welcome Screen with Centered Owl */}
                                {!hasStartedChat && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] text-center space-y-8"
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-magic-gold/10 blur-[80px] rounded-full animate-pulse" />
                                            <MagicalSpellbook expression={spellbookExpression} size="xlarge" />
                                        </div>

                                        <div className="space-y-3 max-w-2xl">
                                            <h2 className="text-4xl font-bold bg-gradient-to-r from-parchment via-magic-gold to-magic-bronze bg-clip-text text-transparent">
                                                Welcome to the Chamber of Knowledge
                                            </h2>
                                            <p className="text-magic-gold/70 text-lg font-serif italic">
                                                "It is our choices that show what we truly are, far more than our abilities."
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
                                            <motion.button
                                                onClick={triggerAnalysis}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="p-6 bg-gradient-to-br from-parchment/5 to-parchment/10 hover:from-parchment/10 hover:to-parchment/15 border border-magic-gold/20 hover:border-magic-gold/40 rounded-2xl transition-all text-left group"
                                            >
                                                <TrendingUp className="w-8 h-8 text-magic-gold mb-4 group-hover:scale-110 transition-transform" />
                                                <h3 className="font-bold text-lg text-parchment mb-1">Crystal Ball Reading</h3>
                                                <p className="text-sm text-magic-gold/60">Reveal your academic strengths & weaknesses</p>
                                            </motion.button>

                                            <motion.button
                                                onClick={triggerPrediction}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="p-6 bg-gradient-to-br from-parchment/5 to-parchment/10 hover:from-parchment/10 hover:to-parchment/15 border border-magic-gold/20 hover:border-magic-gold/40 rounded-2xl transition-all text-left group"
                                            >
                                                <Sparkles className="w-8 h-8 text-magic-bronze mb-4 group-hover:scale-110 transition-transform" />
                                                <h3 className="font-bold text-lg text-parchment mb-1">Divination</h3>
                                                <p className="text-sm text-magic-gold/60">Predict future exam questions with magic</p>
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Chat Messages */}
                                {chatHistory.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[85%] ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-magic-gold/20 to-magic-bronze/20 border border-magic-gold/30 text-parchment'
                                            : 'bg-parchment/5 border border-magic-gold/20 text-parchment/90'
                                            } px-6 py-4 rounded-2xl backdrop-blur-md shadow-lg`}>
                                            {msg.type === 'text' && <p className="whitespace-pre-wrap leading-relaxed font-serif">{msg.content}</p>}
                                            {msg.type === 'error' && <p className="text-red-400 flex items-center gap-2 font-serif"><X className="w-4 h-4" /> {msg.content}</p>}
                                            {msg.type === 'warning' && <p className="text-yellow-400 flex items-center gap-2 font-serif"><Lightbulb className="w-4 h-4" /> {msg.content}</p>}

                                            {msg.type === 'analysis' && (
                                                <div className="space-y-4">
                                                    <p className="font-serif">{msg.content}</p>
                                                    <AnalysisWidget data={msg.data} />
                                                </div>
                                            )}

                                            {msg.type === 'prediction' && (
                                                <div className="space-y-4">
                                                    <p className="font-serif">{msg.content}</p>
                                                    <PredictionWidget data={msg.data} />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Typing Indicator */}
                                {isTyping && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                        <div className="bg-parchment/5 border border-magic-gold/20 px-6 py-4 rounded-2xl">
                                            <div className="flex gap-1.5">
                                                <span className="w-2 h-2 bg-magic-gold rounded-full animate-bounce"></span>
                                                <span className="w-2 h-2 bg-magic-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                                <span className="w-2 h-2 bg-magic-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </main>

                        {/* Input Area - Spell Casting */}
                        <div className="p-4 md:p-8 pt-4">
                            <div className="w-full max-w-7xl mx-auto">
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-magic-gold via-magic-bronze to-magic-gold rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                    <div className="relative flex items-center bg-black/60 backdrop-blur-xl border border-magic-gold/30 rounded-2xl p-3 shadow-2xl">
                                        <input
                                            type="text"
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                                            placeholder="Cast your spell..."
                                            spellCheck="true"
                                            className="flex-1 bg-transparent border-none px-4 py-3 text-parchment placeholder-magic-gold/40 focus:outline-none focus:ring-0 font-serif text-base"
                                        />
                                        <motion.button
                                            onClick={handleChat}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="p-3 bg-gradient-to-r from-magic-gold to-magic-bronze hover:from-magic-gold/90 hover:to-magic-bronze/90 rounded-xl text-ink-black transition-all shadow-lg shadow-magic-gold/20"
                                        >
                                            <Send className="w-5 h-5" />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Golden Snitch Companion - Moves dynamically & evades cursor */}
            {hasStartedChat && (
                <GoldenSnitch />
            )}
        </div>
    );
};

export default StudentDashboard;
