import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Upload, TrendingUp, AlertCircle, CheckCircle, BookOpen, Lightbulb } from 'lucide-react';

const AnalysisDashboard = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);
    const [error, setError] = useState(null);

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        setAnalysisData(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('http://localhost:8000/analyze/performance', formData);

            // Parse the response. The backend returns { analysis: "string" }
            // The string might be markdown with ```json ... ```
            let jsonString = res.data.analysis;

            // Clean up markdown code blocks if present
            if (jsonString.includes('```json')) {
                jsonString = jsonString.replace(/```json\n?|\n?```/g, '');
            } else if (jsonString.includes('```')) {
                jsonString = jsonString.replace(/```\n?|\n?```/g, '');
            }

            try {
                const parsedData = JSON.parse(jsonString);
                setAnalysisData(parsedData);
            } catch (e) {
                console.error("JSON Parse Error:", e);
                // Fallback if it's not valid JSON, just show text
                setAnalysisData({ raw_text: jsonString });
            }

        } catch (err) {
            console.error(err);
            setError("Failed to analyze performance. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-900/60 to-pink-900/60 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl h-full flex flex-col overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-pink-400" />
                Performance Analysis
            </h2>

            {!analysisData && !loading && (
                <div className="flex flex-col items-center justify-center flex-1">
                    <div className="border-2 border-dashed border-pink-500/50 rounded-2xl p-12 text-center hover:border-pink-400 hover:bg-pink-500/10 transition-all cursor-pointer group w-full max-w-xl">
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="hidden"
                            id="exam-upload"
                            accept=".pdf,.png,.jpg,.jpeg,.txt"
                        />
                        <label htmlFor="exam-upload" className="cursor-pointer block">
                            <motion.div
                                className="text-6xl mb-4"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                📈
                            </motion.div>
                            <p className="text-xl text-gray-300 group-hover:text-white transition mb-2">
                                Upload Exam/Test Results
                            </p>
                            <p className="text-sm text-gray-500">
                                Upload your answer sheet or score card for AI analysis
                            </p>
                            {file && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="mt-4 p-4 bg-pink-600/30 rounded-xl inline-block"
                                >
                                    <p className="text-pink-300 font-semibold">✓ {file.name}</p>
                                </motion.div>
                            )}
                        </label>
                    </div>

                    <motion.button
                        onClick={handleUpload}
                        disabled={!file}
                        whileHover={{ scale: file ? 1.02 : 1 }}
                        whileTap={{ scale: file ? 0.98 : 1 }}
                        className="w-full max-w-xl mt-6 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed py-4 rounded-xl font-semibold transition-all shadow-lg disabled:shadow-none shadow-pink-500/30 text-lg flex items-center justify-center gap-2"
                    >
                        {loading ? 'Analyzing...' : '🚀 Analyze Performance'}
                    </motion.button>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center flex-1 text-pink-300">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="mb-4"
                    >
                        <TrendingUp className="w-12 h-12" />
                    </motion.div>
                    <p className="text-xl font-semibold">AI is analyzing your performance...</p>
                    <p className="text-sm text-gray-400 mt-2">Identifying strengths, weaknesses, and study tips.</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 flex items-center gap-3 mb-6">
                    <AlertCircle className="w-6 h-6" />
                    {error}
                </div>
            )}

            {analysisData && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Overall Summary */}
                    {analysisData.overall_performance && (
                        <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                            <h3 className="text-lg font-bold text-pink-300 mb-2">Overall Performance</h3>
                            <p className="text-gray-300 leading-relaxed">{analysisData.overall_performance}</p>
                        </div>
                    )}

                    {/* Weak Areas */}
                    {analysisData.weak_areas && analysisData.weak_areas.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Areas for Improvement
                            </h3>
                            <div className="grid gap-4">
                                {analysisData.weak_areas.map((area, idx) => (
                                    <div key={idx} className="bg-red-900/10 border border-red-500/20 p-5 rounded-2xl">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="text-lg font-semibold text-red-200">{area.subject}</h4>
                                            <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm font-bold">
                                                {area.score}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-4">{area.reason}</p>

                                        <div className="bg-black/20 p-4 rounded-xl">
                                            <h5 className="text-sm font-bold text-pink-300 mb-2 flex items-center gap-2">
                                                <Lightbulb className="w-4 h-4" />
                                                Strategic Tips
                                            </h5>
                                            <ul className="space-y-2">
                                                {area.tips.map((tip, i) => (
                                                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                        <span className="text-pink-500 mt-1">•</span>
                                                        {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Strengths */}
                    {analysisData.strengths && analysisData.strengths.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-green-300 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Key Strengths
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {analysisData.strengths.map((strength, idx) => (
                                    <div key={idx} className="bg-green-900/20 border border-green-500/30 px-4 py-2 rounded-xl text-green-200 font-medium">
                                        {strength}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Raw Text Fallback */}
                    {analysisData.raw_text && (
                        <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                            <h3 className="text-lg font-bold text-gray-300 mb-2">Analysis Result</h3>
                            <p className="text-gray-400 whitespace-pre-wrap">{analysisData.raw_text}</p>
                        </div>
                    )}

                    <button
                        onClick={() => { setAnalysisData(null); setFile(null); }}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 transition-colors"
                    >
                        Analyze Another Exam
                    </button>
                </div>
            )}
        </div>
    );
};

export default AnalysisDashboard;
