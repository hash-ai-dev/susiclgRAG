import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Upload, Sparkles, AlertCircle, Target, Brain, BookOpen, X } from 'lucide-react';

const PredictionDashboard = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [predictionData, setPredictionData] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setLoading(true);
        setError(null);
        setPredictionData(null);

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const res = await axios.post('http://localhost:8000/analyze/prediction', formData);

            // Parse the response
            let jsonString = res.data.predictions;

            // Clean up markdown code blocks if present
            if (jsonString.includes('```json')) {
                jsonString = jsonString.replace(/```json\n?|\n?```/g, '');
            } else if (jsonString.includes('```')) {
                jsonString = jsonString.replace(/```\n?|\n?```/g, '');
            }

            try {
                const parsedData = JSON.parse(jsonString);
                setPredictionData(parsedData);
            } catch (e) {
                console.error("JSON Parse Error:", e);
                // Fallback if it's not valid JSON
                setPredictionData({ raw_text: jsonString });
            }

        } catch (err) {
            console.error(err);
            setError("Failed to predict questions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-900/60 to-cyan-900/60 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl h-full flex flex-col overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                Question Prediction
            </h2>

            {!predictionData && !loading && (
                <div className="flex flex-col items-center justify-center flex-1">
                    <div className="border-2 border-dashed border-cyan-500/50 rounded-2xl p-12 text-center hover:border-cyan-400 hover:bg-cyan-500/10 transition-all cursor-pointer group w-full max-w-xl">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            id="prediction-upload"
                            accept=".pdf,.png,.jpg,.jpeg,.txt"
                            multiple
                        />
                        <label htmlFor="prediction-upload" className="cursor-pointer block">
                            <motion.div
                                className="text-6xl mb-4"
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                🔮
                            </motion.div>
                            <p className="text-xl text-gray-300 group-hover:text-white transition mb-2">
                                Upload Past Question Papers
                            </p>
                            <p className="text-sm text-gray-500">
                                Upload 2+ past papers to identify patterns and predict future questions
                            </p>
                        </label>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-xl mt-6 space-y-2"
                        >
                            <h3 className="text-sm font-semibold text-cyan-300 mb-2">
                                Selected Files ({files.length})
                            </h3>
                            {files.map((file, idx) => (
                                <div
                                    key={idx}
                                    className="bg-cyan-900/20 border border-cyan-500/30 px-4 py-3 rounded-xl flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-4 h-4 text-cyan-400" />
                                        <span className="text-sm text-gray-300">{file.name}</span>
                                    </div>
                                    <button
                                        onClick={() => removeFile(idx)}
                                        className="text-red-400 hover:text-red-300 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    <motion.button
                        onClick={handleUpload}
                        disabled={files.length < 2}
                        whileHover={{ scale: files.length >= 2 ? 1.02 : 1 }}
                        whileTap={{ scale: files.length >= 2 ? 0.98 : 1 }}
                        className="w-full max-w-xl mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed py-4 rounded-xl font-semibold transition-all shadow-lg disabled:shadow-none shadow-cyan-500/30 text-lg flex items-center justify-center gap-2"
                    >
                        {files.length < 2
                            ? '⚠️ Upload at least 2 papers'
                            : loading
                                ? 'Analyzing Patterns...'
                                : '🔮 Predict Questions'}
                    </motion.button>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center flex-1 text-cyan-300">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="mb-4"
                    >
                        <Brain className="w-12 h-12" />
                    </motion.div>
                    <p className="text-xl font-semibold">AI is analyzing question patterns...</p>
                    <p className="text-sm text-gray-400 mt-2">Identifying trends and predicting likely questions.</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 flex items-center gap-3 mb-6">
                    <AlertCircle className="w-6 h-6" />
                    {error}
                </div>
            )}

            {predictionData && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Patterns Identified */}
                    {predictionData.patterns_identified && predictionData.patterns_identified.length > 0 && (
                        <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                            <h3 className="text-lg font-bold text-cyan-300 mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                Patterns Identified
                            </h3>
                            <ul className="space-y-2">
                                {predictionData.patterns_identified.map((pattern, idx) => (
                                    <li key={idx} className="text-gray-300 flex items-start gap-2">
                                        <span className="text-cyan-500 mt-1">•</span>
                                        {pattern}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Study Priorities */}
                    {predictionData.study_priorities && predictionData.study_priorities.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                Study Priorities
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {predictionData.study_priorities.map((priority, idx) => (
                                    <div key={idx} className="bg-yellow-900/20 border border-yellow-500/30 px-4 py-2 rounded-xl text-yellow-200 font-medium">
                                        {priority}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Predicted Questions */}
                    {predictionData.predicted_questions && predictionData.predicted_questions.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-green-300 mb-4 flex items-center gap-2">
                                <Brain className="w-5 h-5" />
                                Predicted Questions ({predictionData.predicted_questions.length})
                            </h3>
                            <div className="grid gap-4">
                                {predictionData.predicted_questions.map((q, idx) => (
                                    <div key={idx} className="bg-green-900/10 border border-green-500/20 p-5 rounded-2xl">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="text-lg font-semibold text-green-200 flex-1">
                                                Q{idx + 1}: {q.question}
                                            </h4>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ml-3 ${q.difficulty === 'easy'
                                                    ? 'bg-green-500/20 text-green-300'
                                                    : q.difficulty === 'medium'
                                                        ? 'bg-yellow-500/20 text-yellow-300'
                                                        : 'bg-red-500/20 text-red-300'
                                                }`}>
                                                {q.difficulty?.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="mb-3">
                                            <span className="text-xs font-semibold text-cyan-400">Topic: </span>
                                            <span className="text-sm text-gray-300">{q.topic}</span>
                                        </div>

                                        <div className="bg-black/20 p-4 rounded-xl">
                                            <h5 className="text-xs font-bold text-purple-300 mb-2">Why This Question?</h5>
                                            <p className="text-sm text-gray-400">{q.reasoning}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Raw Text Fallback */}
                    {predictionData.raw_text && (
                        <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                            <h3 className="text-lg font-bold text-gray-300 mb-2">Prediction Result</h3>
                            <p className="text-gray-400 whitespace-pre-wrap">{predictionData.raw_text}</p>
                        </div>
                    )}

                    <button
                        onClick={() => { setPredictionData(null); setFiles([]); }}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 transition-colors"
                    >
                        Analyze More Papers
                    </button>
                </div>
            )}
        </div>
    );
};

export default PredictionDashboard;
