import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Robot = ({ expression = 'idle' }) => {
    const [isBlinking, setIsBlinking] = useState(false);

    // Blinking animation
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 150);
        }, 3000 + Math.random() * 2000);
        return () => clearInterval(blinkInterval);
    }, []);

    const variants = {
        idle: {
            y: [0, -15, 0],
            rotate: [0, -2, 2, 0],
            transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
        },
        thinking: {
            rotate: [0, -8, 8, -8, 8, 0],
            y: [0, -5, 0],
            transition: { repeat: Infinity, duration: 1.5 }
        },
        happy: {
            scale: [1, 1.15, 1.05, 1.15, 1],
            rotate: [0, -10, 10, -10, 0],
            transition: { duration: 0.8, repeat: 2 }
        },
        talking: {
            scale: [1, 1.03, 1, 1.03, 1],
            y: [0, -3, 0, -3, 0],
            transition: { repeat: Infinity, duration: 0.4 }
        },
        excited: {
            y: [0, -25, 0, -20, 0, -15, 0],
            rotate: [0, -15, 15, -10, 10, 0],
            scale: [1, 1.1, 1, 1.08, 1],
            transition: { repeat: Infinity, duration: 1.2 }
        },
        confused: {
            rotate: [0, -15, 15, -10, 10, -5, 5, 0],
            x: [0, -5, 5, -3, 3, 0],
            transition: { repeat: Infinity, duration: 2 }
        },
        sleeping: {
            y: [0, 5, 0],
            rotate: [-5, -8, -5],
            transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
        },
        surprised: {
            scale: [1, 1.2, 1.15, 1.2, 1.1],
            y: [0, -10, -5],
            transition: { duration: 0.5 }
        }
    };

    const eyeVariants = {
        idle: { scaleY: 1, scaleX: 1 },
        thinking: {
            scaleY: [1, 0.3, 1, 0.3, 1],
            scaleX: [1, 1.2, 1],
            transition: { repeat: Infinity, duration: 2 }
        },
        happy: {
            scaleY: 0.4,
            scaleX: 1.3,
            y: [0, -2, 0],
            transition: { duration: 0.3 }
        },
        talking: { scaleY: 1, scaleX: 1 },
        excited: {
            scaleY: 1.3,
            scaleX: 1.3,
            transition: { duration: 0.3 }
        },
        confused: {
            scaleY: [1, 0.8, 1.2, 1],
            scaleX: [1, 1.2, 0.8, 1],
            transition: { repeat: Infinity, duration: 2 }
        },
        sleeping: {
            scaleY: 0.1,
            scaleX: 1.2,
            transition: { duration: 0.5 }
        },
        surprised: {
            scaleY: 1.5,
            scaleX: 1.5,
            transition: { duration: 0.3 }
        }
    };

    const mouthPaths = {
        idle: "M 35 62 Q 50 65 65 62",
        happy: "M 35 60 Q 50 70 65 60",
        talking: "M 40 62 L 60 62",
        excited: "M 32 58 Q 50 75 68 58",
        confused: "M 35 62 Q 45 60 55 62 Q 60 64 65 62",
        sleeping: "M 40 65 Q 50 63 60 65",
        surprised: "M 45 60 Q 50 68 55 60"
    };

    return (
        <motion.div
            className="w-56 h-56 relative mx-auto"
            animate={expression}
            variants={variants}
        >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl filter">
                <defs>
                    <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="50%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#c4b5fd" />
                    </linearGradient>
                    <radialGradient id="eyeGlow">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
                        <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="softGlow">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Body - Rounder and cuter */}
                <circle
                    cx="50"
                    cy="52"
                    r="42"
                    fill="url(#bodyGrad)"
                    stroke="#e9d5ff"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                    filter="url(#softGlow)"
                />

                {/* Face screen - larger and rounder */}
                <rect
                    x="20"
                    y="32"
                    width="60"
                    height="38"
                    rx="12"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="1.5"
                    opacity="0.9"
                />

                {/* Eyes - Bigger and cuter */}
                <motion.g
                    variants={eyeVariants}
                    animate={isBlinking ? { scaleY: 0.1 } : expression}
                    transition={{ duration: 0.1 }}
                >
                    {/* Left eye glow */}
                    <circle cx="37" cy="50" r="8" fill="url(#eyeGlow)" opacity="0.6" />
                    <circle cx="37" cy="50" r="5.5" fill="#22d3ee" filter="url(#glow)" />
                    <circle cx="35" cy="48" r="2" fill="#ffffff" opacity="0.9" />

                    {/* Right eye glow */}
                    <circle cx="63" cy="50" r="8" fill="url(#eyeGlow)" opacity="0.6" />
                    <circle cx="63" cy="50" r="5.5" fill="#22d3ee" filter="url(#glow)" />
                    <circle cx="61" cy="48" r="2" fill="#ffffff" opacity="0.9" />
                </motion.g>

                {/* Cute cheek blushes when happy or excited */}
                {(expression === 'happy' || expression === 'excited') && (
                    <>
                        <circle cx="15" cy="55" r="4" fill="#f472b6" opacity="0.4" />
                        <circle cx="85" cy="55" r="4" fill="#f472b6" opacity="0.4" />
                    </>
                )}

                {/* Mouth - More expressive */}
                {expression !== 'thinking' && (
                    <motion.path
                        d={mouthPaths[expression] || mouthPaths.idle}
                        stroke="#22d3ee"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                        filter="url(#glow)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3 }}
                    />
                )}

                {/* Sleeping Z's */}
                {expression === 'sleeping' && (
                    <g opacity="0.8">
                        <motion.text
                            x="75"
                            y="25"
                            fill="#22d3ee"
                            fontSize="8"
                            fontWeight="bold"
                            animate={{ y: [25, 15], opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 2, delay: 0 }}
                        >
                            Z
                        </motion.text>
                        <motion.text
                            x="82"
                            y="20"
                            fill="#22d3ee"
                            fontSize="10"
                            fontWeight="bold"
                            animate={{ y: [20, 10], opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
                        >
                            Z
                        </motion.text>
                        <motion.text
                            x="90"
                            y="15"
                            fill="#22d3ee"
                            fontSize="12"
                            fontWeight="bold"
                            animate={{ y: [15, 5], opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
                        >
                            Z
                        </motion.text>
                    </g>
                )}

                {/* Confusion swirls */}
                {expression === 'confused' && (
                    <g opacity="0.7">
                        <motion.path
                            d="M 75 25 Q 80 20 85 25 Q 90 30 85 35"
                            stroke="#fbbf24"
                            strokeWidth="2"
                            fill="none"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            style={{ transformOrigin: "80px 30px" }}
                        />
                    </g>
                )}

                {/* Antenna - cuter with bouncing tip */}
                <line x1="50" y1="10" x2="50" y2="2" stroke="#a78bfa" strokeWidth="2.5" />
                <motion.circle
                    cx="50"
                    cy="2"
                    r="3.5"
                    fill="#ef4444"
                    filter="url(#glow)"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [1, 0.7, 1]
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut"
                    }}
                />
            </svg>
        </motion.div>
    );
};

export default Robot;
