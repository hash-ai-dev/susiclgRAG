import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import MagicalSpellbook from './MagicalSpellbook';

const FloatingBook = ({ expression, size = 'medium' }) => {
    const [position, setPosition] = useState({ x: window.innerWidth - 100, y: 100 });
    const [isMoving, setIsMoving] = useState(false);
    const [trail, setTrail] = useState([]);

    // Use refs to track current position for trail generation
    const x = useMotionValue(window.innerWidth - 100);
    const y = useMotionValue(100);

    // Smooth spring physics for movement
    const springConfig = { damping: 20, stiffness: 80 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    // Generate random position
    const moveToRandomSpot = () => {
        setIsMoving(true);

        // Keep within safe bounds (padding from edges)
        const padding = 100;
        const newX = padding + Math.random() * (window.innerWidth - padding * 2);
        const newY = padding + Math.random() * (window.innerHeight - padding * 2);

        setPosition({ x: newX, y: newY });
        x.set(newX);
        y.set(newY);

        // Stop moving after animation completes (approx)
        setTimeout(() => {
            setIsMoving(false);
        }, 2000);
    };

    // Movement loop
    useEffect(() => {
        // Initial move
        const initialTimer = setTimeout(moveToRandomSpot, 1000);

        // Continuous loop
        const loop = setInterval(() => {
            moveToRandomSpot();
        }, 5000 + Math.random() * 3000); // Move every 5-8 seconds

        return () => {
            clearTimeout(initialTimer);
            clearInterval(loop);
        };
    }, []);

    // Trail generation
    useEffect(() => {
        let interval;
        if (isMoving) {
            interval = setInterval(() => {
                const currentX = springX.get();
                const currentY = springY.get();

                setTrail(prev => [...prev, {
                    id: Date.now(),
                    x: currentX,
                    y: currentY,
                    size: Math.random() * 8 + 4, // Random star size
                    rotation: Math.random() * 360
                }]);
            }, 50); // Emit star every 50ms
        }

        return () => clearInterval(interval);
    }, [isMoving, springX, springY]);

    // Cleanup trail
    useEffect(() => {
        const cleanup = setInterval(() => {
            const now = Date.now();
            setTrail(prev => prev.filter(t => now - t.id < 1000)); // Stars live for 1s
        }, 100);
        return () => clearInterval(cleanup);
    }, []);

    return (
        <>
            {/* Star Trail */}
            <AnimatePresence>
                {trail.map(star => (
                    <motion.div
                        key={star.id}
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{ opacity: 0, scale: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="fixed pointer-events-none z-40 text-magic-gold"
                        style={{
                            left: star.x,
                            top: star.y,
                            fontSize: star.size,
                            transform: `translate(-50%, -50%) rotate(${star.rotation}deg)`
                        }}
                    >
                        ✦
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* The Book */}
            <motion.div
                className="fixed z-50"
                style={{ x: springX, y: springY }}
                whileHover={{ scale: 1.1 }}
                drag
                dragMomentum={false}
            >
                <MagicalSpellbook expression={expression} size={size} />
            </motion.div>
        </>
    );
};

export default FloatingBook;
