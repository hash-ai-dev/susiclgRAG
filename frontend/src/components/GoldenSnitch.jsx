import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';

const GoldenSnitch = () => {
    const [position, setPosition] = useState({ x: window.innerWidth - 100, y: 100 });
    const [isMoving, setIsMoving] = useState(false);
    const [trail, setTrail] = useState([]);
    const isMovingRef = useRef(false);

    // Track mouse position for evasion
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring physics for smooth movement
    const x = useMotionValue(window.innerWidth - 100);
    const y = useMotionValue(100);
    const springConfig = { damping: 15, stiffness: 120, mass: 0.5 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    // Update ref when isMoving changes
    useEffect(() => {
        isMovingRef.current = isMoving;
    }, [isMoving]);

    // Move to a random spot
    const moveToRandomSpot = useCallback((evasive = false) => {
        setIsMoving(true);

        const padding = 100;
        const newX = padding + Math.random() * (window.innerWidth - padding * 2);
        const newY = padding + Math.random() * (window.innerHeight - padding * 2);

        setPosition({ x: newX, y: newY });
        x.set(newX);
        y.set(newY);

        setTimeout(() => {
            setIsMoving(false);
        }, evasive ? 800 : 2000);
    }, [x, y]);

    // Autonomous movement loop
    useEffect(() => {
        const initialTimer = setTimeout(() => moveToRandomSpot(), 1000);
        const loop = setInterval(() => {
            if (!isMovingRef.current) {
                moveToRandomSpot();
            }
        }, 4000 + Math.random() * 3000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(loop);
        };
    }, [moveToRandomSpot]);

    // Evasion Logic
    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);

            const currentX = springX.get();
            const currentY = springY.get();

            const dist = Math.hypot(e.clientX - currentX, e.clientY - currentY);

            // If mouse gets too close (within 150px), FLEE!
            if (dist < 150 && !isMovingRef.current) {
                moveToRandomSpot(true);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [moveToRandomSpot, springX, springY, mouseX, mouseY]);

    // Star Trail generation - tracks exact position
    useEffect(() => {
        if (!isMoving) return;

        const unsubscribeX = springX.onChange((latestX) => {
            if (!isMoving) return;
            const latestY = springY.get();

            // Add offset to position trail at center of the ball (container is 50x50, so center is +25)
            setTrail(prev => [...prev, {
                id: Date.now() + Math.random(),
                x: latestX + 25,  // Center of the 50px container
                y: latestY + 25,  // Center of the 50px container
                timestamp: Date.now()
            }]);
        });

        return () => {
            unsubscribeX();
        };
    }, [isMoving, springX, springY]);

    // Cleanup trail
    useEffect(() => {
        const cleanup = setInterval(() => {
            const now = Date.now();
            setTrail(prev => prev.filter(t => now - t.timestamp < 800)); // Stars live for 800ms
        }, 100);
        return () => clearInterval(cleanup);
    }, []);

    return (
        <>
            {/* Star Trail */}
            <AnimatePresence>
                {trail.map((star, index) => (
                    <motion.div
                        key={star.id}
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{ opacity: 0, scale: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="fixed pointer-events-none z-40"
                        style={{
                            left: star.x - 8,
                            top: star.y - 8,
                            width: 16,
                            height: 16,
                            background: `radial-gradient(circle, rgba(255, 215, 0, ${1 - index * 0.02}) 0%, rgba(255, 200, 0, ${0.6 - index * 0.015}) 40%, transparent 100%)`,
                            boxShadow: '0 0 12px rgba(255, 215, 0, 0.6)',
                            filter: 'brightness(2)',
                            mixBlendMode: 'screen',
                            borderRadius: '50%'
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* The Golden Snitch */}
            <motion.div
                className="fixed top-0 left-0 z-50 pointer-events-none"
                style={{ x: springX, y: springY }}
            >
                <div className="relative flex items-center justify-center" style={{ width: 50, height: 50 }}>
                    {/* Left Wing */}
                    <motion.div
                        className="absolute"
                        style={{
                            left: -20,
                            top: 10,
                            transformOrigin: 'right center'
                        }}
                        animate={{
                            rotateY: [0, -60, 0],
                            rotateZ: [-10, -20, -10]
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <svg width="30" height="40" viewBox="0 0 30 40" fill="none">
                            <path
                                d="M 28 20 Q 15 5, 5 2 Q 2 10, 5 20 Q 2 30, 5 38 Q 15 35, 28 20 Z"
                                fill="url(#wingGradient)"
                                stroke="#C0C0C0"
                                strokeWidth="0.5"
                                opacity="0.9"
                            />
                            <defs>
                                <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#E8E8E8" stopOpacity="0.95" />
                                    <stop offset="50%" stopColor="#D0D0D0" stopOpacity="0.85" />
                                    <stop offset="100%" stopColor="#B8B8B8" stopOpacity="0.75" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </motion.div>

                    {/* Right Wing */}
                    <motion.div
                        className="absolute"
                        style={{
                            right: -20,
                            top: 10,
                            transformOrigin: 'left center'
                        }}
                        animate={{
                            rotateY: [0, 60, 0],
                            rotateZ: [10, 20, 10]
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <svg width="30" height="40" viewBox="0 0 30 40" fill="none">
                            <path
                                d="M 2 20 Q 15 5, 25 2 Q 28 10, 25 20 Q 28 30, 25 38 Q 15 35, 2 20 Z"
                                fill="url(#wingGradient2)"
                                stroke="#C0C0C0"
                                strokeWidth="0.5"
                                opacity="0.9"
                            />
                            <defs>
                                <linearGradient id="wingGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#E8E8E8" stopOpacity="0.95" />
                                    <stop offset="50%" stopColor="#D0D0D0" stopOpacity="0.85" />
                                    <stop offset="100%" stopColor="#B8B8B8" stopOpacity="0.75" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </motion.div>

                    {/* Golden Ball Body */}
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 shadow-2xl border-2 border-yellow-300"
                        style={{
                            boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4), inset 0 -5px 10px rgba(0, 0, 0, 0.3), inset 0 5px 10px rgba(255, 255, 255, 0.4)'
                        }}
                    >
                        {/* Highlight/Shine */}
                        <div className="absolute top-1 left-2 w-4 h-4 bg-white/70 rounded-full blur-[2px]" />

                        {/* Decorative engravings */}
                        <div className="absolute inset-0 rounded-full" style={{
                            background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)'
                        }} />

                        {/* Center detail */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-yellow-700/30 rounded-full" />
                    </div>

                    {/* Magical Glow */}
                    <motion.div
                        className="absolute inset-0 bg-yellow-400/40 blur-xl rounded-full"
                        animate={{
                            opacity: [0.3, 0.6, 0.3],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            </motion.div>
        </>
    );
};

export default GoldenSnitch;
