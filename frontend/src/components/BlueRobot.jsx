import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BlueRobot = ({ expression = 'idle' }) => {
    const [isBlinking, setIsBlinking] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Track mouse movement for eye tracking
    useEffect(() => {
        const handleMouseMove = (e) => {
            // Calculate normalized position (-1 to 1) relative to window center
            const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
            const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Blinking animation
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 150);
        }, 3000 + Math.random() * 4000);
        return () => clearInterval(blinkInterval);
    }, []);

    const containerVariants = {
        idle: {
            y: [0, -10, 0],
            rotate: [0, -1, 1, 0],
            transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
        },
        thinking: {
            y: [0, -5, 0],
            rotate: [0, -5, 5, 0],
            transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
        },
        happy: {
            y: [0, -15, 0],
            scale: [1, 1.05, 1],
            transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
        },
        excited: {
            y: [0, -20, 0, -10, 0],
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, 0],
            transition: { repeat: Infinity, duration: 1, ease: "easeInOut" }
        },
        confused: {
            rotate: [0, -10, 10, 0],
            transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
        },
        talking: {
            scale: [1, 1.02, 1],
            transition: { repeat: Infinity, duration: 0.3 }
        }
    };

    // Eye movement logic
    const eyeX = mousePosition.x * 5;
    const eyeY = mousePosition.y * 5;

    return (
        <motion.div
            className="w-48 h-48 relative"
            variants={containerVariants}
            animate={expression}
        >
            {/* Main Body - Glossy Sphere */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 shadow-[0_0_40px_rgba(59,130,246,0.6)]">
                {/* Inner Glow/Depth */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-tl from-blue-900/50 to-transparent opacity-80"></div>

                {/* Specular Highlight (Top Left) */}
                <div className="absolute top-4 left-8 w-16 h-8 bg-white/40 rounded-full blur-md transform -rotate-12"></div>
                <div className="absolute top-6 left-10 w-8 h-4 bg-white/70 rounded-full blur-sm transform -rotate-12"></div>

                {/* Rim Light (Bottom Right) */}
                <div className="absolute bottom-4 right-6 w-20 h-20 bg-cyan-300/30 rounded-full blur-xl"></div>
            </div>

            {/* Face Screen Area */}
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-32 h-24 bg-black/80 rounded-[2rem] backdrop-blur-sm border border-white/10 shadow-inner overflow-hidden">

                {/* Eyes Container */}
                <div className="relative w-full h-full flex justify-center items-center gap-4">

                    {/* Left Eye */}
                    <motion.div
                        className="relative w-8 h-10 bg-cyan-300 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                        animate={{
                            scaleY: isBlinking ? 0.1 : (expression === 'happy' ? 0.5 : 1),
                            x: eyeX,
                            y: eyeY,
                            height: expression === 'surprised' ? 48 : 40
                        }}
                    >
                        <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-80"></div>
                    </motion.div>

                    {/* Right Eye */}
                    <motion.div
                        className="relative w-8 h-10 bg-cyan-300 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                        animate={{
                            scaleY: isBlinking ? 0.1 : (expression === 'happy' ? 0.5 : 1),
                            x: eyeX,
                            y: eyeY,
                            height: expression === 'surprised' ? 48 : 40
                        }}
                    >
                        <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-80"></div>
                    </motion.div>
                </div>

                {/* Mouth (Canvas/SVG based on expression) */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    {expression === 'talking' && (
                        <motion.div
                            className="w-8 h-1 bg-cyan-300 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                            animate={{ scaleX: [0.5, 1.2, 0.5], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 0.3 }}
                        />
                    )}
                    {expression === 'happy' && (
                        <div className="w-6 h-3 border-b-2 border-cyan-300 rounded-full"></div>
                    )}
                    {expression === 'confused' && (
                        <div className="w-6 h-1 bg-cyan-300 rounded-full transform rotate-12"></div>
                    )}
                    {expression === 'surprised' && (
                        <div className="w-4 h-4 border-2 border-cyan-300 rounded-full"></div>
                    )}
                </div>
            </div>

            {/* Antenna */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-gray-400 -z-10"></div>
            <motion.div
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
            ></motion.div>

            {/* Hover/Float Shadow */}
            <motion.div
                className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-black/40 blur-lg rounded-full"
                animate={{
                    scale: expression === 'excited' ? [1, 0.8, 1] : [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            ></motion.div>
        </motion.div>
    );
};

export default BlueRobot;
