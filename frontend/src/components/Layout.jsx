import React from 'react';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white font-sans selection:bg-pink-500 selection:text-white overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                {/* Gradient orbs */}
                <motion.div
                    className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[120px]"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/30 rounded-full blur-[120px]"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />
                <motion.div
                    className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-pink-600/20 rounded-full blur-[100px]"
                    animate={{
                        scale: [1, 1.15, 1],
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Animated grid */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundImage: `
                                linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
                            `,
                            backgroundSize: '50px 50px',
                            animation: 'gridMove 20s linear infinite'
                        }}
                    />
                </div>

                {/* Floating particles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -100, 0],
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 4,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <nav className="p-6 backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-50">
                <motion.div
                    className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 flex items-center gap-3"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.span
                        animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3
                        }}
                    >

                    </motion.span>
                </motion.div>
            </nav>

            <motion.main
                className="w-full h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {children}
            </motion.main>

            {/* Add keyframes for grid animation */}
            <style>{`
                @keyframes gridMove {
                    0% {
                        transform: translateY(0);
                    }
                    100% {
                        transform: translateY(50px);
                    }
                }
            `}</style>
        </div>
    );
};

export default Layout;
