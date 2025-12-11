import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MagicalOwl = ({ expression = 'idle', size = 'large' }) => {
    const [blink, setBlink] = useState(false);
    const [wingFlap, setWingFlap] = useState(false);

    // Blinking
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setBlink(true);
            setTimeout(() => setBlink(false), 150);
        }, 3000 + Math.random() * 2000);
        return () => clearInterval(blinkInterval);
    }, []);

    // Wing flapping
    useEffect(() => {
        if (expression === 'excited' || expression === 'happy') {
            const flapInterval = setInterval(() => {
                setWingFlap(true);
                setTimeout(() => setWingFlap(false), 300);
            }, 600);
            return () => clearInterval(flapInterval);
        }
    }, [expression]);

    const sizeMap = {
        small: 80,
        medium: 120,
        large: 160,
        xlarge: 220
    };

    const baseSize = sizeMap[size];

    const containerVariants = {
        idle: {
            y: [0, -8, 0],
            rotate: [0, -1, 1, 0],
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        },
        thinking: {
            y: [-5, -10, -5],
            rotate: [0, 5, -5, 0],
            transition: { duration: 2, repeat: Infinity }
        },
        happy: {
            y: [-10, -18, -10],
            scale: [1, 1.05, 1],
            transition: { duration: 0.8, repeat: Infinity }
        },
        excited: {
            y: [-15, -25, -15],
            rotate: [-5, 5, -5],
            scale: [1, 1.08, 1],
            transition: { duration: 0.6, repeat: Infinity }
        },
        talking: {
            y: [-5, -10, -5],
            transition: { duration: 1, repeat: Infinity }
        },
        confused: {
            rotate: [-8, 8, -8],
            transition: { duration: 1.2, repeat: Infinity }
        },
    };

    return (
        <motion.div
            className="relative flex items-center justify-center"
            style={{ width: baseSize, height: baseSize }}
            variants={containerVariants}
            animate={expression}
        >
            {/* Magical glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-yellow-600/20 to-orange-500/20 rounded-full blur-2xl animate-pulse" />

            {/* Main owl container */}
            <div className="relative w-full h-full">

                {/* Magical sparkles around owl */}
                {(expression === 'happy' || expression === 'excited') && (
                    <>
                        <motion.div
                            className="absolute top-0 left-0 w-2 h-2"
                            animate={{
                                scale: [0, 1, 0],
                                rotate: [0, 180, 360],
                                opacity: [0, 1, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                        >
                            ✨
                        </motion.div>
                        <motion.div
                            className="absolute top-0 right-0 w-2 h-2"
                            animate={{
                                scale: [0, 1, 0],
                                rotate: [0, -180, -360],
                                opacity: [0, 1, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        >
                            ✨
                        </motion.div>
                    </>
                )}

                {/* Head */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200 rounded-full shadow-2xl border-2 border-amber-300/50 overflow-hidden">

                    {/* Feather pattern */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-2 left-2 w-3 h-3 bg-amber-800 rounded-full" />
                        <div className="absolute top-4 right-3 w-2 h-2 bg-amber-800 rounded-full" />
                        <div className="absolute bottom-3 left-4 w-2 h-2 bg-amber-800 rounded-full" />
                    </div>

                    {/* Ear tufts */}
                    <motion.div
                        className="absolute -top-2 left-4 w-4 h-8 bg-gradient-to-t from-amber-200 to-amber-400 rounded-t-full"
                        animate={{ rotate: expression === 'confused' ? [-10, 10, -10] : 0 }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute -top-2 right-4 w-4 h-8 bg-gradient-to-t from-amber-200 to-amber-400 rounded-t-full"
                        animate={{ rotate: expression === 'confused' ? [10, -10, 10] : 0 }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                    />

                    {/* Eyes - Large and wise */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-3">
                        {/* Left Eye */}
                        <div className="relative w-7 h-7 bg-gradient-to-br from-amber-900 to-black rounded-full shadow-inner border-2 border-amber-700">
                            <motion.div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full"
                                animate={{
                                    scale: blink ? [1, 0.1, 1] : 1
                                }}
                                transition={{ duration: 0.15 }}
                            >
                                {/* Pupil */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full">
                                    {/* Highlight */}
                                    <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Eye */}
                        <div className="relative w-7 h-7 bg-gradient-to-br from-amber-900 to-black rounded-full shadow-inner border-2 border-amber-700">
                            <motion.div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full"
                                animate={{
                                    scale: blink ? [1, 0.1, 1] : 1
                                }}
                                transition={{ duration: 0.15 }}
                            >
                                {/* Pupil */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full">
                                    {/* Highlight */}
                                    <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full" />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Beak */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-orange-500" />
                </div>

                {/* Body */}
                <div className="absolute top-22 left-1/2 -translate-x-1/2 w-20 h-16 bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-300 rounded-[50%] shadow-xl border-2 border-amber-300/50">
                    {/* Chest feather pattern */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-30">
                        <div className="w-8 h-1 bg-amber-700 rounded-full" />
                        <div className="w-10 h-1 bg-amber-700 rounded-full" />
                        <div className="w-8 h-1 bg-amber-700 rounded-full" />
                    </div>
                </div>

                {/* Wings */}
                <motion.div
                    className="absolute top-24 -left-3 w-8 h-12 bg-gradient-to-br from-amber-300 to-amber-500 rounded-l-full shadow-lg border-l-2 border-amber-400"
                    animate={{
                        rotate: wingFlap ? -20 : 0,
                        x: wingFlap ? -3 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ transformOrigin: 'right center' }}
                >
                    {/* Wing feathers */}
                    <div className="absolute inset-0 flex flex-col gap-1 p-1">
                        <div className="w-full h-1 bg-amber-600/50 rounded-full" />
                        <div className="w-full h-1 bg-amber-600/50 rounded-full" />
                        <div className="w-full h-1 bg-amber-600/50 rounded-full" />
                    </div>
                </motion.div>

                <motion.div
                    className="absolute top-24 -right-3 w-8 h-12 bg-gradient-to-bl from-amber-300 to-amber-500 rounded-r-full shadow-lg border-r-2 border-amber-400"
                    animate={{
                        rotate: wingFlap ? 20 : 0,
                        x: wingFlap ? 3 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ transformOrigin: 'left center' }}
                >
                    {/* Wing feathers */}
                    <div className="absolute inset-0 flex flex-col gap-1 p-1">
                        <div className="w-full h-1 bg-amber-600/50 rounded-full" />
                        <div className="w-full h-1 bg-amber-600/50 rounded-full" />
                        <div className="w-full h-1 bg-amber-600/50 rounded-full" />
                    </div>
                </motion.div>

                {/* Tail feathers */}
                <div className="absolute top-36 left-1/2 -translate-x-1/2 flex gap-1">
                    <div className="w-2 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-b-full" />
                    <div className="w-2 h-10 bg-gradient-to-b from-amber-400 to-amber-600 rounded-b-full" />
                    <div className="w-2 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-b-full" />
                </div>

                {/* Talons */}
                <div className="absolute top-38 left-1/2 -translate-x-1/2 flex gap-3">
                    <div className="flex gap-0.5">
                        <div className="w-1 h-3 bg-gray-700 rounded-b-sm" />
                        <div className="w-1 h-3 bg-gray-700 rounded-b-sm" />
                    </div>
                    <div className="flex gap-0.5">
                        <div className="w-1 h-3 bg-gray-700 rounded-b-sm" />
                        <div className="w-1 h-3 bg-gray-700 rounded-b-sm" />
                    </div>
                </div>

                {/* Shadow */}
                <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-3 bg-black/20 rounded-full blur-md"
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

export default MagicalOwl;
