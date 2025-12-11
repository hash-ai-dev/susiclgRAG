import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';

const MagicalCursor = () => {
    const [trails, setTrails] = useState([]);

    // Spring physics for butter-smooth movement
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Optimized spring config for responsiveness
    const springConfig = { damping: 20, stiffness: 1000, mass: 0.1 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    useEffect(() => {
        let trailId = 0;
        let lastX = 0;
        let lastY = 0;

        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Emit particles based on smooth position
        const interval = setInterval(() => {
            const currentX = smoothX.get();
            const currentY = smoothY.get();

            // Only add trail if moved enough
            const dist = Math.hypot(currentX - lastX, currentY - lastY);

            if (dist > 1) {
                const newTrail = {
                    id: trailId++,
                    x: currentX,
                    y: currentY,
                    timestamp: Date.now()
                };
                setTrails(prev => [...prev.slice(-30), newTrail]);
                lastX = currentX;
                lastY = currentY;
            }
        }, 8); // ~120fps update for smoother trail

        // Cleanup old particles
        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            setTrails(prev => prev.filter(t => now - t.timestamp < 600));
        }, 100);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearInterval(interval);
            clearInterval(cleanupInterval);
        };
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {/* Trail particles */}
            <AnimatePresence>
                {trails.map((trail, index) => (
                    <motion.div
                        key={trail.id}
                        initial={{ opacity: 1, scale: 0.8 }}
                        animate={{ opacity: 0, scale: 2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute w-8 h-8 rounded-full blur-[4px]"
                        style={{
                            left: trail.x - 16,
                            top: trail.y - 16,
                            background: `radial-gradient(circle, rgba(255, 255, 220, ${1 - index * 0.03}) 0%, rgba(255, 215, 0, ${0.6 - index * 0.02}) 40%, transparent 100%)`,
                            boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 100, 0, 0.4)',
                            filter: 'brightness(2.5) contrast(1.5)',
                            mixBlendMode: 'screen'
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default MagicalCursor;
