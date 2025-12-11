import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Robot3D = ({ expression = 'idle', size = 'large' }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [blink, setBlink] = useState(false);

    // Eye tracking
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (expression === 'idle') {
                setMousePos({ x: e.clientX, y: e.clientY });
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

    const sizeClasses = {
        small: 'w-24 h-24',
        medium: 'w-32 h-32',
        large: 'w-48 h-48',
        xlarge: 'w-64 h-64'
    };

    const expressionStates = {
        idle: { y: [0, -8, 0], rotate: [0, -1, 1, 0] },
        thinking: { y: [-5, -10, -5], rotate: [-2, 2, -2] },
        happy: { y: [-10, -15, -10], scale: [1, 1.05, 1] },
        excited: { y: [-15, -25, -15], scale: [1, 1.1, 1], rotate: [-5, 5, -5] },
        talking: { y: [-5, -8, -5], scale: [1, 1.02, 1] },
        confused: { rotate: [-10, 10, -10] },
    };

    return (
        <motion.div
            className={`relative ${sizeClasses[size]} flex items-center justify-center`}
            animate={expressionStates[expression] || expressionStates.idle}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
            {/* Robot Body Container */}
            <div className="relative w-full h-full">

                {/* Antenna */}
                <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 w-1 h-8 bg-gradient-to-t from-gray-300 to-transparent"
                    animate={{ scaleY: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neon-blue rounded-full shadow-[0_0_10px_#00f3ff] animate-pulse" />
                </motion.div>

                {/* Head */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-12 bg-gradient-to-b from-gray-100 to-gray-300 rounded-t-xl border-2 border-gray-400 shadow-lg">
                    {/* Eyes Container */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-3">
                        {/* Left Eye */}
                        <div className="relative w-4 h-4 bg-black rounded-full overflow-hidden">
                            <motion.div
                                className="absolute w-2 h-2 bg-neon-blue rounded-full shadow-[0_0_8px_#00f3ff]"
                                animate={{
                                    x: blink ? 0 : (mousePos.x / window.innerWidth - 0.5) * 4,
                                    y: blink ? 0 : (mousePos.y / window.innerHeight - 0.5) * 4,
                                    scale: blink ? 0.1 : 1
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                        </div>
                        {/* Right Eye */}
                        <div className="relative w-4 h-4 bg-black rounded-full overflow-hidden">
                            <motion.div
                                className="absolute w-2 h-2 bg-neon-blue rounded-full shadow-[0_0_8px_#00f3ff]"
                                animate={{
                                    x: blink ? 0 : (mousePos.x / window.innerWidth - 0.5) * 4,
                                    y: blink ? 0 : (mousePos.y / window.innerHeight - 0.5) * 4,
                                    scale: blink ? 0.1 : 1
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                        </div>
                    </div>

                    {/* Screen/Display */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 rounded-sm opacity-70" />
                </div>

                {/* Neck */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-6 h-4 bg-gray-400 border-x-2 border-gray-500" />

                {/* Body */}
                <div className="absolute top-16 left-1/2 -translate-x-1/2 w-20 h-16 bg-gradient-to-b from-gray-200 to-gray-400 rounded-lg border-2 border-gray-500 shadow-xl">
                    {/* Chest Panel */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-10 bg-gradient-to-br from-blue-100 to-blue-300 rounded border border-blue-400 flex items-center justify-center">
                        <div className="w-8 h-6 bg-gradient-to-r from-gray-700 to-gray-800 rounded-sm flex items-center justify-center">
                            <motion.div
                                className="w-6 h-4 bg-gradient-to-r from-neon-blue/50 to-purple-500/50 rounded-sm"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                    </div>
                </div>

                {/* Arms */}
                <motion.div
                    className="absolute top-18 -left-2 w-3 h-12 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full border border-gray-500"
                    animate={{ rotate: expression === 'excited' ? [-10, 10, -10] : 0 }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                />
                <motion.div
                    className="absolute top-18 -right-2 w-3 h-12 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full border border-gray-500"
                    animate={{ rotate: expression === 'excited' ? [10, -10, 10] : 0 }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                />

                {/* Legs */}
                <div className="absolute top-32 left-1/2 -translate-x-1/2 flex gap-2">
                    <div className="w-4 h-10 bg-gradient-to-b from-gray-300 to-gray-500 rounded-b-lg border border-gray-600">
                        <div className="absolute bottom-0 w-5 h-3 bg-blue-400 rounded-b-md -ml-0.5 border border-blue-500" />
                    </div>
                    <div className="w-4 h-10 bg-gradient-to-b from-gray-300 to-gray-500 rounded-b-lg border border-gray-600">
                        <div className="absolute bottom-0 w-5 h-3 bg-blue-400 rounded-b-md -ml-0.5 border border-blue-500" />
                    </div>
                </div>

                {/* Shadow */}
                <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-2 bg-black/20 rounded-full blur-sm"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </div>
        </motion.div>
    );
};

export default Robot3D;
