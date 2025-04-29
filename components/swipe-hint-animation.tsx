
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Hand } from 'lucide-react';
import { cn } from '@/lib/utils';

const SwipeHintAnimation: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2, // Slight delay before appearing
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: {
        duration: 0.3,
        ease: 'easeIn',
      },
    },
  };

  const handVariants = {
    initial: { x: '-50%', opacity: 0 }, // Start centered horizontally, slightly off
    animate: {
      x: ['-50%', '0%', '-100%', '-50%'], // Swipe right, swipe left, return center
      opacity: [0, 1, 1, 0], // Fade in, stay visible, fade out
      transition: {
        duration: 2.5, // Duration of one swipe cycle
        ease: 'easeInOut',
        repeat: Infinity,
        repeatDelay: 0.5, // Pause between cycles
        times: [0, 0.3, 0.7, 1], // Timing for each keyframe
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        'absolute inset-x-0 top-[calc(50%+8rem)] z-40', // Position below the tile stack
        'flex flex-col items-center justify-center pointer-events-none' // Center content, disable pointer events
      )}
      aria-hidden="true" // Hide from accessibility as it's purely visual
    >
      <motion.div
        className="relative w-20 h-12" // Container for the hand icon
      >
        <motion.div
          variants={handVariants}
          initial="initial"
          animate="animate"
          className="absolute top-0 left-1/2" // Position hand at the horizontal center start
        >
          <Hand className="w-8 h-8 text-accent opacity-80 transform rotate-[15deg]" />
        </motion.div>
      </motion.div>
      <p className="mt-2 text-sm text-muted-foreground opacity-90" style={{ fontFamily: 'var(--font-inter)'}}>
        (Swipe the letters)
      </p>
    </motion.div>
  );
};

export default SwipeHintAnimation;
