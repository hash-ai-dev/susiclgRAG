import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MagicalBroomstick = ({ expression = 'idle', size = 'large' }) => {
    const [sparkles, setSparkles] = useState([]);

    // Generate sparkles periodically
    useEffect(() => {
        if (expression === 'excited' || expression === 'happy') {
            const interval = setInterval(() => {
                const newSparkle = {
                    id: Date.now() + Math.random(),
                    x: Math.random() * 100 - 50,
                    y: Math.random() * 40 - 20,
                };
                setSparkles(prev => [...prev, newSparkle]);
                setTimeout(() => {
                    setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
                }, 1500);
            }, 300);
            return () => clearInterval(interval);
        }
    }, [expression]);

    const sizeMap = {
        small: 150,
        medium: 220,
        large: 300,
        xlarge: 400
    };

    const baseSize = sizeMap[size];

    // Expression-based animations
    const containerVariants = {
        idle: {
            y: [0, -15, 0],
            rotate: [0, -2, 2, 0],
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        },
        thinking: {
            y: [-10, -20, -10],
            rotate: [0, 5, -5, 0],
            transition: { duration: 2, repeat: Infinity }
        },
        happy: {
            y: [-15, -25, -15],
            rotate: [-3, 3, -3],
            scale: [1, 1.05, 1],
            transition: { duration: 1, repeat: Infinity }
        },
        excited: {
            y: [-20, -35, -20],
            rotate: [-8, 8, -8],
            scale: [1, 1.08, 1],
            transition: { duration: 0.8, repeat: Infinity }
        },
        talking: {
            y: [-10, -18, -10],
            rotate: [0, -3, 3, 0],
            transition: { duration: 1.2, repeat: Infinity }
        },
        confused: {
            rotate: [-10, 10, -10],
            y: [-5, -10, -5],
            transition: { duration: 1.5, repeat: Infinity }
        },
    };

    return (
        <motion.div
            className="relative flex items-center justify-center"
            style={{ width: baseSize * 1.5, height: baseSize * 0.5 }}
            variants={containerVariants}
            animate={expression}
        >
            {/* Magical aura glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-magic-gold/30 via-magic-bronze/30 to-magic-gold/30 rounded-full blur-3xl animate-pulse" />

            {/* Sparkles */}
            {sparkles.map(sparkle => (
                <motion.div
                    key={sparkle.id}
                    className="absolute w-3 h-3 text-magic-gold text-xl"
                    initial={{ opacity: 1, scale: 0, x: sparkle.x, y: sparkle.y }}
                    animate={{
                        opacity: 0,
                        scale: 1.5,
                        y: sparkle.y - 40,
                        rotate: 360
                    }}
                    transition={{ duration: 1.5 }}
                >
                    ✨
                </motion.div>
            ))}

            {/* Realistic broomstick image */}
            <div className="relative w-full h-full flex items-center justify-center">
                <motion.img
                    src="/broomstick.png"
                    alt="Magical Broomstick"
                    className="w-full h-auto object-contain drop-shadow-2xl"
                    style={{
                        filter: 'drop-shadow(0 10px 30px rgba(212, 175, 55, 0.4))',
                        maxHeight: '100%',
                    }}
                    animate={{
                        filter: [
                            'drop-shadow(0 10px 30px rgba(212, 175, 55, 0.4))',
                            'drop-shadow(0 10px 40px rgba(212, 175, 55, 0.6))',
                            'drop-shadow(0 10px 30px rgba(212, 175, 55, 0.4))',
                        ]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Magical trail effect behind broom */}
                <motion.div
                    className="absolute left-0 w-[40%] h-[120%] pointer-events-none"
                    animate={{
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-magic-gold/30 via-magic-gold/20 to-transparent blur-2xl rounded-full" />
                </motion.div>

                {/* Shadow beneath broom */}
                <motion.div
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black/40 rounded-full blur-xl"
                    animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.4, 0.5, 0.4]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                />
            </div>

            {/* Additional magical particles around broom */}
            {(expression === 'happy' || expression === 'excited') && (
                <>
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={`particle-${i}`}
                            className="absolute w-1 h-1 bg-magic-gold rounded-full"
                            style={{
                                left: `${20 + i * 15}%`,
                                top: `${30 + (i % 2) * 40}%`,
                            }}
                            animate={{
                                y: [0, -20, 0],
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </>
            )}
        </motion.div>
    );
};

export default MagicalBroomstick;
