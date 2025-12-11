import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, CheckCircle, Lightbulb, Target, Sparkles, Brain } from 'lucide-react';

export const AnalysisWidget = ({ data }) => {
    if (!data) return null;

    return (
        <div className="w-full max-w-2xl bg-deep-space/80 border border-neon-blue/30 rounded-xl p-4 md:p-6 backdrop-blur-md shadow-[0_0_15px_rgba(0,243,255,0.1)] overflow-hidden relative">
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-neon-blue/5 to-transparent h-[200%] w-full animate-scanline opacity-20"></div>

            <h3 className="text-lg font-bold text-neon-blue mb-4 flex items-center gap-2 relative z-10">
                <TrendingUp className="w-5 h-5" />
                Performance Analysis
            </h3>

            {/* Overall Summary */}
            {data.overall_performance && (
                <div className="bg-black/40 p-4 rounded-lg border border-white/10 mb-4 relative z-10">
                    <p className="text-gray-300 text-sm leading-relaxed">{data.overall_performance}</p>
                </div>
            )}

            {/* Weak Areas */}
            {data.weak_areas && data.weak_areas.length > 0 && (
                <div className="mb-4 relative z-10">
                    <h4 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Critical Focus Areas
                    </h4>
                    <div className="grid gap-3">
                        {data.weak_areas.map((area, idx) => (
                            <div key={idx} className="bg-red-900/10 border border-red-500/20 p-3 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-red-200 font-semibold text-sm">{area.subject}</span>
                                    <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-xs font-bold">
                                        {area.score}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-xs mb-2">{area.reason}</p>
                                <div className="pl-2 border-l-2 border-red-500/30">
                                    {area.tips.map((tip, i) => (
                                        <p key={i} className="text-xs text-gray-500 flex items-start gap-1">
                                            <span className="text-red-500">•</span> {tip}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Strengths */}
            {data.strengths && data.strengths.length > 0 && (
                <div className="relative z-10">
                    <h4 className="text-sm font-bold text-green-400 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Top Strengths
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {data.strengths.map((strength, idx) => (
                            <span key={idx} className="bg-green-900/20 border border-green-500/30 px-3 py-1 rounded-full text-green-300 text-xs font-medium">
                                {strength}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const PredictionWidget = ({ data }) => {
    if (!data) return null;

    return (
        <div className="w-full max-w-2xl bg-deep-space/80 border border-purple-500/30 rounded-xl p-4 md:p-6 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.1)] overflow-hidden relative">
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-purple-500/5 to-transparent h-[200%] w-full animate-scanline opacity-20"></div>

            <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2 relative z-10">
                <Sparkles className="w-5 h-5" />
                Exam Predictions
            </h3>

            {/* Patterns */}
            {data.patterns_identified && data.patterns_identified.length > 0 && (
                <div className="bg-black/40 p-4 rounded-lg border border-white/10 mb-4 relative z-10">
                    <h4 className="text-sm font-bold text-cyan-300 mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Detected Patterns
                    </h4>
                    <ul className="space-y-1">
                        {data.patterns_identified.map((pattern, idx) => (
                            <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                                <span className="text-cyan-500">•</span> {pattern}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Questions */}
            {data.predicted_questions && data.predicted_questions.length > 0 && (
                <div className="relative z-10">
                    <h4 className="text-sm font-bold text-green-300 mb-3 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        High Probability Questions
                    </h4>
                    <div className="space-y-3">
                        {data.predicted_questions.slice(0, 3).map((q, idx) => ( // Show top 3 initially
                            <div key={idx} className="bg-green-900/10 border border-green-500/20 p-3 rounded-lg">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-green-200 font-semibold text-sm flex-1">Q: {q.question}</span>
                                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300 ml-2 whitespace-nowrap">
                                        {q.difficulty}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 italic">{q.reasoning}</p>
                            </div>
                        ))}
                        {data.predicted_questions.length > 3 && (
                            <p className="text-center text-xs text-gray-500 mt-2">
                                + {data.predicted_questions.length - 3} more questions hidden...
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
