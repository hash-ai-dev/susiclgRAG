import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MagicalSpellbook = ({ expression = 'idle', size = 'large' }) => {
    const [floatingSymbols, setFloatingSymbols] = useState([]);
    const [pageFlip, setPageFlip] = useState(false);
    const [isVanished, setIsVanished] = useState(false);
    const [quote, setQuote] = useState(null);

    const symbols = ['✨', '⚡', '🌟', '◈', '✦', '❋', '✧', '※'];

    const hpQuotes = [
        "It does not do to dwell on dreams and forget to live.",
        "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.",
        "It is our choices, Harry, that show what we truly are, far more than our abilities.",
        "I solemnly swear that I am up to no good.",
        "Mischief Managed!",
        "Wit beyond measure is man's greatest treasure.",
        "Words are, in my not-so-humble opinion, our most inexhaustible source of magic.",
        "After all this time? Always.",
        "You're a wizard, Harry.",
        "Help will always be given at Hogwarts to those who ask for it.",
        "I am what I am, an' I'm not ashamed.",
        "Things we lose have a way of coming back to us in the end, if not always in the way we expect."
    ];

    // Handle click to vanish
    const handleBookClick = () => {
        if (isVanished || quote) return; // Prevent multiple clicks

        // Vanish book immediately
        setIsVanished(true);

        // Show quote after book vanishes (small delay for smooth transition)
        setTimeout(() => {
            const randomQuote = hpQuotes[Math.floor(Math.random() * hpQuotes.length)];
            setQuote(randomQuote);

            // Hide quote after 4 seconds
            setTimeout(() => {
                setQuote(null);

                // Bring book back after quote disappears
                setTimeout(() => {
                    setIsVanished(false);
                }, 500);
            }, 4000);
        }, 600);
    };

    // Generate floating symbols
    useEffect(() => {
        if (!isVanished && (expression === 'excited' || expression === 'happy' || expression === 'thinking')) {
            const interval = setInterval(() => {
                const newSymbol = {
                    id: Date.now() + Math.random(),
                    symbol: symbols[Math.floor(Math.random() * symbols.length)],
                    x: Math.random() * 60 - 30,
                    y: Math.random() * 20,
                    rotation: Math.random() * 360,
                };
                setFloatingSymbols(prev => [...prev, newSymbol]);
                setTimeout(() => {
                    setFloatingSymbols(prev => prev.filter(s => s.id !== newSymbol.id));
                }, 2000);
            }, expression === 'excited' ? 200 : 400);
            return () => clearInterval(interval);
        }
    }, [expression, isVanished]);

    // Page flipping effect
    useEffect(() => {
        if (!isVanished && (expression === 'thinking' || expression === 'talking')) {
            const interval = setInterval(() => {
                setPageFlip(true);
                setTimeout(() => setPageFlip(false), 400);
            }, expression === 'thinking' ? 800 : 1200);
            return () => clearInterval(interval);
        }
    }, [expression, isVanished]);

    const sizeMap = {
        small: 120,
        medium: 180,
        large: 240,
        xlarge: 320
    };

    const baseSize = sizeMap[size];

    // Expression-based animations
    const containerVariants = {
        idle: {
            y: [0, -12, 0],
            rotate: [0, -1, 1, 0],
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        },
        thinking: {
            y: [-10, -20, -10],
            rotate: [0, 3, -3, 0],
            scale: [1, 1.05, 1],
            transition: { duration: 1.5, repeat: Infinity }
        },
        happy: {
            y: [-15, -25, -15],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.08, 1],
            transition: { duration: 1, repeat: Infinity }
        },
        excited: {
            y: [-20, -30, -20],
            rotate: [-5, 5, -5],
            scale: [1, 1.1, 1],
            transition: { duration: 0.8, repeat: Infinity }
        },
        talking: {
            y: [-8, -15, -8],
            rotate: [0, -2, 2, 0],
            transition: { duration: 1.2, repeat: Infinity }
        },
        confused: {
            rotate: [-8, 8, -8],
            y: [-5, -10, -5],
            transition: { duration: 1.5, repeat: Infinity }
        },
        vanished: {
            scale: 0,
            opacity: 0,
            rotate: 1080,
            y: -100,
            filter: "blur(30px)",
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    const glowIntensity = {
        idle: 0.3,
        thinking: 0.7,
        happy: 0.6,
        excited: 0.8,
        talking: 0.5,
        confused: 0.4
    };

    return (
        <div
            className="relative flex items-center justify-center"
            style={{ width: baseSize * 1.2, height: baseSize }}
        >
            {/* Quote Bubble - appears when book is vanished */}
            <AnimatePresence>
                {quote && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute z-50 bg-parchment text-amber-900 p-6 rounded-lg shadow-2xl border-2 border-magic-gold/50 font-serif text-center min-w-[250px] max-w-[350px]"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            boxShadow: '0 0 30px rgba(255, 215, 0, 0.5), 0 0 60px rgba(255, 215, 0, 0.3)'
                        }}
                    >
                        <p className="italic text-xl font-medium leading-relaxed">"{quote}"</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="relative flex items-center justify-center cursor-pointer w-full h-full"
                variants={containerVariants}
                animate={isVanished ? "vanished" : expression}
                onClick={handleBookClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Magical aura */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-magic-gold/20 via-purple-500/20 to-magic-bronze/20 rounded-full blur-3xl"
                    animate={{
                        opacity: [glowIntensity[expression], glowIntensity[expression] + 0.2, glowIntensity[expression]],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Floating symbols */}
                <AnimatePresence>
                    {floatingSymbols.map(symbol => (
                        <motion.div
                            key={symbol.id}
                            className="absolute text-2xl"
                            style={{
                                left: `50%`,
                                top: `50%`,
                            }}
                            initial={{
                                opacity: 1,
                                scale: 0,
                                x: 0,
                                y: 0,
                                rotate: 0
                            }}
                            animate={{
                                opacity: 0,
                                scale: 1.5,
                                x: symbol.x,
                                y: symbol.y - 50,
                                rotate: symbol.rotation
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                        >
                            <span className="text-magic-gold drop-shadow-lg">{symbol.symbol}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* The Spellbook */}
                <div className="relative" style={{ width: baseSize * 0.9, height: baseSize * 0.7 }}>

                    {/* Book cover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-amber-900 rounded-lg shadow-2xl border-4 border-amber-700/50 overflow-hidden"
                        style={{
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.3)'
                        }}
                    >
                        {/* Leather texture */}
                        <div className="absolute inset-0 opacity-30">
                            <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20" />
                            {[...Array(15)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute h-px bg-black/20"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                        width: `${20 + Math.random() * 30}%`,
                                        transform: `rotate(${Math.random() * 180}deg)`
                                    }}
                                />
                            ))}
                        </div>

                        {/* Ornate border */}
                        <div className="absolute inset-2 border-2 border-magic-gold/40 rounded-md" />

                        {/* Metal corners */}
                        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
                            <div
                                key={corner}
                                className={`absolute w-6 h-6 bg-gradient-to-br from-magic-gold to-magic-bronze border border-magic-gold/50 ${corner === 'top-left' ? 'top-0 left-0 rounded-br-lg' :
                                    corner === 'top-right' ? 'top-0 right-0 rounded-bl-lg' :
                                        corner === 'bottom-left' ? 'bottom-0 left-0 rounded-tr-lg' :
                                            'bottom-0 right-0 rounded-tl-lg'
                                    }`}
                                style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)' }}
                            />
                        ))}

                        {/* Central emblem */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20">
                            <motion.div
                                className="w-full h-full rounded-full bg-gradient-to-br from-magic-gold to-magic-bronze flex items-center justify-center border-2 border-magic-gold/60"
                                animate={{
                                    boxShadow: [
                                        '0 0 20px rgba(212, 175, 55, 0.3)',
                                        '0 0 30px rgba(212, 175, 55, 0.6)',
                                        '0 0 20px rgba(212, 175, 55, 0.3)'
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <span className="text-3xl">✦</span>
                            </motion.div>
                        </div>

                        {/* Magical runes around emblem */}
                        {['◈', '※', '✧', '❋'].map((rune, i) => (
                            <motion.div
                                key={i}
                                className="absolute text-magic-gold text-xl opacity-60"
                                style={{
                                    left: `${50 + Math.cos((i * Math.PI) / 2) * 35}%`,
                                    top: `${50 + Math.sin((i * Math.PI) / 2) * 35}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                                animate={{
                                    opacity: [0.4, 0.7, 0.4],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.5
                                }}
                            >
                                {rune}
                            </motion.div>
                        ))}
                    </div>

                    {/* Book spine/edge (left side) */}
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-amber-950 to-red-900 rounded-l-lg border-r border-black/30"
                        style={{ boxShadow: 'inset -2px 0 5px rgba(0, 0, 0, 0.5)' }}
                    />

                    {/* Pages (right side) */}
                    <div className="absolute right-0 top-2 bottom-2 w-2 bg-gradient-to-l from-parchment via-yellow-100 to-parchment rounded-r-sm overflow-hidden">
                        {/* Page lines */}
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-full h-px bg-amber-800/20"
                                style={{ top: `${i * 8}%` }}
                            />
                        ))}
                    </div>

                    {/* Animated page flip */}
                    <AnimatePresence>
                        {pageFlip && (
                            <motion.div
                                className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-parchment to-yellow-50 rounded-r-lg origin-left"
                                initial={{ rotateY: 0, opacity: 1 }}
                                animate={{ rotateY: -180, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                style={{
                                    transformStyle: 'preserve-3d',
                                    boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.2)'
                                }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Magical glow from inside (when open/active) */}
                    {(expression === 'happy' || expression === 'excited' || expression === 'thinking') && (
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-magic-gold/0 via-magic-gold/30 to-magic-gold/0 rounded-lg pointer-events-none"
                            animate={{
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    )}

                    {/* Light rays emanating from book */}
                    {(expression === 'excited' || expression === 'happy') && (
                        <>
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute top-1/2 left-1/2 w-1 bg-gradient-to-t from-magic-gold/60 to-transparent origin-bottom"
                                    style={{
                                        height: '60px',
                                        transform: `translate(-50%, -50%) rotate(${i * 36}deg)`
                                    }}
                                    animate={{
                                        opacity: [0, 0.8, 0],
                                        scaleY: [0.5, 1, 0.5]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.2
                                    }}
                                />
                            ))}
                        </>
                    )}

                    {/* Shadow beneath book */}
                    <motion.div
                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[90%] h-4 bg-black/40 rounded-full blur-lg"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.4, 0.5, 0.4]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default MagicalSpellbook;
