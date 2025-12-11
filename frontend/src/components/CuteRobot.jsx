import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CuteRobot = ({ expression = 'idle', size = 'large' }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [blink, setBlink] = useState(false);
    const [bounce, setBounce] = useState(false);

    // Eye tracking
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (expression === 'idle') {
                const rect = document.body.getBoundingClientRect();
                setMousePos({
                    x: (e.clientX / window.innerWidth - 0.5) * 20,
                    y: (e.clientY / window.innerHeight - 0.5) * 20
                });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [expression]);

    // Blinking
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setBlink(true);
            setTimeout(() => setBlink(false), 150);
        }, 3000 + Math.random() * 2000);
        return () => clearInterval(blinkInterval);
    }, []);

    // Happy bounce
    useEffect(() => {
        if (expression === 'happy' || expression === 'excited') {
            setBounce(true);
            setTimeout(() => setBounce(false), 600);
        }
    }, [expression]);

    const sizeMap = {
        small: 80,
        medium: 120,
        large: 160,
        xlarge: 220
    };

    const baseSize = sizeMap[size];

    // Expression-based eye shapes
    const getEyeShape = () => {
        switch (expression) {
            case 'happy':
            case 'excited':
                return 'rounded-full'; // Wide happy eyes
            case 'thinking':
                return 'rounded-lg'; // Slightly squinted
            case 'confused':
                return 'rounded-md'; // Confused look
            case 'talking':
                return 'rounded-full';
            default:
                return 'rounded-full';
        }
    };

    // Expression-based mouth shapes
    const getMouth = () => {
        switch (expression) {
            case 'happy':
                return (
                    <motion.div
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-6 border-b-4 border-white rounded-b-full"
                        animate={{ scaleX: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    />
                );
            case 'excited':
                return (
                    <motion.div
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-14 h-8 bg-white rounded-full"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 0.3, repeat: Infinity }}
                    />
                );
            case 'thinking':
                return (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-8 h-2 bg-white/70 rounded-full" />
                );
            case 'confused':
                return (
                    <motion.div
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-3 bg-white/70 rounded-full"
                        animate={{ rotate: [-5, 5, -5] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    />
                );
            case 'talking':
                return (
                    <motion.div
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-6 bg-white rounded-full"
                        animate={{ scaleY: [1, 0.6, 1, 0.8, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                    />
                );
            default:
                return (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-2 bg-white/80 rounded-full" />
                );
        }
    };

    // Base animation variants
    const containerVariants = {
        idle: {
            y: [0, -10, 0],
            rotate: [0, -2, 2, 0],
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        },
        thinking: {
            y: [-5, -8, -5],
            rotate: [-3, 3, -3],
            transition: { duration: 1.5, repeat: Infinity }
        },
        happy: {
            y: bounce ? [-20, -30, -20] : [-10, -15, -10],
            scale: bounce ? [1, 1.1, 1] : 1,
            transition: { duration: 0.6, repeat: Infinity }
        },
        excited: {
            y: [-15, -25, -15],
            rotate: [-8, 8, -8],
            scale: [1, 1.08, 1],
            transition: { duration: 0.5, repeat: Infinity }
        },
        talking: {
            y: [-5, -8, -5],
            transition: { duration: 0.8, repeat: Infinity }
        },
        confused: {
            rotate: [-10, 10, -10],
            transition: { duration: 1, repeat: Infinity }
        },
    };

    return (
        <motion.div
            className="relative flex items-center justify-center"
            style={{ width: baseSize, height: baseSize }}
            variants={containerVariants}
            animate={expression}
        >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/20 to-purple-500/20 rounded-full blur-2xl" />

            {/* Main body container */}
            <div className="relative w-full h-full">

                {/* Antenna with heart */}
                <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 flex flex-col items-center"
                    animate={{
                        rotate: expression === 'happy' ? [-10, 10, -10] : 0,
                        y: expression === 'excited' ? [-2, 2, -2] : 0
                    }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                >
                    <motion.div
                        className="w-3 h-3 bg-gradient-to-br from-pink-400 to-red-400 rounded-full shadow-lg shadow-pink-500/50"
                        animate={{
                            scale: [1, 1.2, 1],
                            boxShadow: ['0 0 10px rgba(244, 114, 182, 0.5)', '0 0 20px rgba(244, 114, 182, 0.8)', '0 0 10px rgba(244, 114, 182, 0.5)']
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <div className="w-0.5 h-6 bg-gradient-to-b from-gray-400 to-transparent" />
                </motion.div>

                {/* Head - Rounded and cute */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-white via-gray-100 to-gray-200 rounded-3xl shadow-2xl border-2 border-white/50 overflow-hidden">

                    {/* Blush marks */}
                    <div className="absolute top-12 left-2 w-4 h-3 bg-pink-300/60 rounded-full blur-sm" />
                    <div className="absolute top-12 right-2 w-4 h-3 bg-pink-300/60 rounded-full blur-sm" />

                    {/* Eyes */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-4">
                        {/* Left Eye */}
                        <div className={`relative w-5 h-5 bg-gradient-to-br from-slate-800 to-black ${getEyeShape()} overflow-hidden shadow-inner`}>
                            <motion.div
                                className="absolute w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-500/50"
                                style={{ top: '50%', left: '50%' }}
                                animate={{
                                    x: blink ? 0 : mousePos.x / 4,
                                    y: blink ? 0 : mousePos.y / 4,
                                    scale: blink ? [1, 0.1, 1] : 1,
                                    translateX: '-50%',
                                    translateY: '-50%'
                                }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            >
                                {/* Sparkle */}
                                <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full" />
                            </motion.div>
                        </div>

                        {/* Right Eye */}
                        <div className={`relative w-5 h-5 bg-gradient-to-br from-slate-800 to-black ${getEyeShape()} overflow-hidden shadow-inner`}>
                            <motion.div
                                className="absolute w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-500/50"
                                style={{ top: '50%', left: '50%' }}
                                animate={{
                                    x: blink ? 0 : mousePos.x / 4,
                                    y: blink ? 0 : mousePos.y / 4,
                                    scale: blink ? [1, 0.1, 1] : 1,
                                    translateX: '-50%',
                                    translateY: '-50%'
                                }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            >
                                {/* Sparkle */}
                                <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Mouth */}
                    {getMouth()}

                    {/* Cute detail - screen lines */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        <div className="w-1 h-1 bg-neon-blue/50 rounded-full" />
                        <div className="w-1 h-1 bg-purple-500/50 rounded-full" />
                        <div className="w-1 h-1 bg-pink-500/50 rounded-full" />
                    </div>
                </div>

                {/* Body - Rounded and friendly */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-16 h-14 bg-gradient-to-br from-gray-100 to-gray-300 rounded-2xl shadow-xl border-2 border-white/50">
                    {/* Heart display on chest */}
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center"
                        animate={{
                            scale: expression === 'happy' || expression === 'excited' ? [1, 1.2, 1] : 1
                        }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                    >
                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-pink-400">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    </motion.div>
                </div>

                {/* Arms - Cute and stubby */}
                <motion.div
                    className="absolute top-22 -left-2 w-2.5 h-8 bg-gradient-to-b from-gray-200 to-gray-300 rounded-full shadow-md border border-white/30"
                    animate={{
                        rotate: expression === 'excited' ? [-20, 20, -20] : expression === 'happy' ? [-10, 10, -10] : 0,
                        y: expression === 'thinking' ? [0, -2, 0] : 0
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                />
                <motion.div
                    className="absolute top-22 -right-2 w-2.5 h-8 bg-gradient-to-b from-gray-200 to-gray-300 rounded-full shadow-md border border-white/30"
                    animate={{
                        rotate: expression === 'excited' ? [20, -20, 20] : expression === 'happy' ? [10, -10, 10] : 0,
                        y: expression === 'thinking' ? [0, -2, 0] : 0
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                />

                {/* Legs - Short and adorable */}
                <div className="absolute top-34 left-1/2 -translate-x-1/2 flex gap-2">
                    <motion.div
                        className="w-3 h-6 bg-gradient-to-b from-gray-200 to-gray-400 rounded-b-xl shadow-md border border-white/30"
                        animate={{
                            scaleY: expression === 'excited' ? [1, 0.9, 1] : 1
                        }}
                        transition={{ duration: 0.3, repeat: Infinity }}
                    >
                        <div className="absolute bottom-0 w-4 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-b-lg -ml-0.5 shadow-md" />
                    </motion.div>
                    <motion.div
                        className="w-3 h-6 bg-gradient-to-b from-gray-200 to-gray-400 rounded-b-xl shadow-md border border-white/30"
                        animate={{
                            scaleY: expression === 'excited' ? [1, 0.9, 1] : 1
                        }}
                        transition={{ duration: 0.3, repeat: Infinity, delay: 0.15 }}
                    >
                        <div className="absolute bottom-0 w-4 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-b-lg -ml-0.5 shadow-md" />
                    </motion.div>
                </div>

                {/* Floating hearts when happy/excited */}
                {(expression === 'happy' || expression === 'excited') && (
                    <>
                        <motion.div
                            className="absolute top-0 left-0 text-pink-400 text-xs"
                            animate={{
                                y: [-20, -40],
                                x: [-10, -15],
                                opacity: [0, 1, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                        >
                            ♥
                        </motion.div>
                        <motion.div
                            className="absolute top-0 right-0 text-pink-400 text-xs"
                            animate={{
                                y: [-20, -40],
                                x: [10, 15],
                                opacity: [0, 1, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        >
                            ♥
                        </motion.div>
                    </>
                )}

                {/* Thought bubble when thinking */}
                {expression === 'thinking' && (
                    <motion.div
                        className="absolute -top-8 -right-8 flex items-end gap-1"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                    >
                        <div className="w-2 h-2 bg-white/80 rounded-full" />
                        <div className="w-3 h-3 bg-white/80 rounded-full" />
                        <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-lg">
                            🤔
                        </div>
                    </motion.div>
                )}

                {/* Shadow */}
                <motion.div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-2 bg-black/20 rounded-full blur-md"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
            </div>
        </motion.div>
    );
};

export default CuteRobot;
