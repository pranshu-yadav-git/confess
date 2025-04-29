
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card'; // Use Card for structure if needed, or just divs
import { cn } from '@/lib/utils';

interface OpenLetterProps {
  onPaperClick: () => void; // Callback when the fully revealed paper is clicked
}

const OpenLetter: React.FC<OpenLetterProps> = ({ onPaperClick }) => {
  // State to track if the full letter content should be visible
  const [isLetterRevealed, setIsLetterRevealed] = useState(false);
  // State to track if the envelope animation (flap opening, initial letter slide) is complete
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  // State to trigger the shrink animation before transitioning out
  const [isShrinking, setIsShrinking] = useState(false);

  // Text content
  const partialText = "My Dearest, \n\nThere's something I've been..."; // Approx 6 words
  const fullText = `My Dearest,\n\nThere's something I've been wanting to ask you for a while now. Every moment with you feels like a dream, brighter and more beautiful than I ever imagined. You fill my life with so much joy and laughter, and I can't picture a single day without you by my side.\n\nFrom the moment we met, I knew you were special. You understand me like no one else does, support my dreams, and make even the ordinary days feel extraordinary. You are my best friend, my confidante, my everything.\n\nThinking about our future together fills my heart with excitement and happiness. I want to build a life with you, share every adventure, overcome every challenge, and grow old together.`;

  // Handler for clicking the partially revealed letter
  const handlePartialLetterClick = () => {
    if (isEnvelopeOpen && !isLetterRevealed && !isShrinking) { // Only allow revealing full letter after envelope animation and if not already revealed/shrinking
        setIsLetterRevealed(true);
    }
  };

  // Handler for clicking the fully revealed letter (triggers shrink, then transition)
   const handleFullLetterClick = () => {
     if (isLetterRevealed && !isShrinking) {
       setIsShrinking(true); // Start shrinking animation
       // onPaperClick will be called by onAnimationComplete
     }
   };

  // Callback for when the flap animation completes
  const onFlapAnimationComplete = () => {
    setIsEnvelopeOpen(true); // Mark envelope animation as done
  };

  // Define animation variants for the letter paper
  const paperVariants = {
      hidden: { // Inside envelope initial state
          y: '60%',
          opacity: 0,
          scale: 0.9,
          position: 'absolute',
          width: '90%',
          height: '95%',
          bottom: 0,
          left: '5%', // Centered within the initial relative container
          zIndex: 20,
      },
      partial: { // Partially revealed state
          y: '10%',
          opacity: 1,
          scale: 1,
          position: 'absolute',
          width: '90%',
          height: '95%',
          bottom: 0,
          left: '5%',
          zIndex: 20,
      },
      full: { // Full screen revealed state
          opacity: 1,
          position: 'fixed', // Use fixed positioning to break out of container
          inset: '2rem', // Padding around the screen
          width: 'calc(100vw - 4rem)',
          height: 'calc(100vh - 4rem)',
          y: 0,
          x: 0, // Ensure centering or edge-to-edge based on inset
          scale: 1,
          zIndex: 50, // Bring to front
          bottom: 'auto', // Override absolute positioning helpers
          left: 'auto',
      },
      shrinking: { // State when shrinking back before transition
          y: '10%', // Go back towards partial position
          opacity: 1,
          scale: 1, // Back to normal scale
          position: 'fixed', // Keep fixed during shrink to avoid jump? Or back to absolute? Test 'absolute'
          inset: 'auto', // Remove inset
          width: '90%', // Back to original width (relative to parent)
          height: '95%', // Back to original height
          bottom: 0,
          left: '5%', // Centered again
          zIndex: 20, // Lower z-index
      }
  };


  return (
    // Container for the envelope - Needs to allow fixed positioning breakout
    // Keep perspective for 3D effects if needed
    <div className="w-full max-w-md relative perspective-1000 h-96"> {/* Ensure some height */}

      {/* Envelope Structure */}
      <motion.div
        className="relative bg-primary/30 border border-accent/50 shadow-xl rounded-lg aspect-[4/3] overflow-hidden mx-auto" // Center envelope initially
        initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
        animate={{ opacity: isShrinking ? 0 : 1, rotateY: 0, scale: isShrinking ? 0.8 : 1 }} // Fade out envelope when shrinking starts
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ transformStyle: 'preserve-3d', display: isLetterRevealed && !isShrinking ? 'none' : 'block' }} // Hide envelope when letter is full screen
      >
        {/* Back of the envelope */}
        <div className="absolute inset-0 bg-primary/10 rounded-lg z-0"></div>

        {/* Top Flap */}
        <motion.div
          className="absolute top-0 left-0 w-full h-[55%] bg-primary origin-bottom z-30 border-b border-accent/50 rounded-t-lg shadow-md"
          initial={{ rotateX: 0 }}
          animate={{ rotateX: -180 }}
          transition={{ delay: 0.8, duration: 0.8, ease: 'easeInOut' }}
          style={{
             clipPath: 'polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%)',
             backfaceVisibility: 'hidden',
             transformStyle: 'preserve-3d',
          }}
           onAnimationComplete={onFlapAnimationComplete}
        >
           <div className="absolute inset-0 bg-primary/40 rounded-t-lg" style={{ transform: 'rotateX(180deg)', backfaceVisibility: 'hidden' }}></div>
        </motion.div>


        {/* Bottom part of the envelope front */}
         <div className="absolute bottom-0 left-0 w-full h-1/2 bg-primary/20 z-10 rounded-b-lg border-t border-accent/30"></div>
      </motion.div>

      {/* Letter Content - Separate motion div to handle its own animation cycle */}
      <motion.div
          id="letter-paper"
          className={cn( // Base styles, bg, shadow etc.
              "bg-background p-4 md:p-6 rounded-md shadow-inner overflow-hidden",
              (isEnvelopeOpen && !isShrinking) ? "cursor-pointer" : "cursor-default", // Pointer logic
              "hover:shadow-lg transition-shadow"
          )}
          variants={paperVariants}
          initial="hidden"
          animate={
              isShrinking ? "shrinking" : (isLetterRevealed ? "full" : (isEnvelopeOpen ? "partial" : "hidden"))
          }
          transition={{
             delay: isLetterRevealed || isShrinking ? 0 : (isEnvelopeOpen ? 0.2 : 1.4), // Delay initial slide
             duration: isShrinking ? 0.6 : 0.7, // Faster shrink?
             ease: 'easeOut'
          }}
          onClick={isLetterRevealed ? handleFullLetterClick : handlePartialLetterClick} // Click handler
          onAnimationComplete={() => {
             if (isShrinking) {
                 onPaperClick(); // Call the transition callback AFTER shrinking
                 // Optional: setIsShrinking(false); // Reset state if component might re-render
             }
          }}
          style={{ transformStyle: 'preserve-3d' }} // Keep if needed for child elements
          role="button"
          aria-label={isLetterRevealed ? (isShrinking ? "Transitioning..." : "Click to continue") : "Click to read more"}
          layout // Animate layout changes smoothly
      >
          {/* Parchment Texture SVG */}
           <div className="absolute inset-0 opacity-[0.04] pointer-events-none overflow-hidden rounded-md">
             <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <filter id="parchment">
                    <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="5" seed="10" stitchTiles="stitch"/>
                    <feDiffuseLighting lightingColor="hsl(var(--background))" surfaceScale="1.5">
                        <feDistantLight azimuth="45" elevation="60"/>
                    </feDiffuseLighting>
                </filter>
                <rect width="100%" height="100%" filter="url(#parchment)" />
             </svg>
           </div>

          {/* Text content */}
          {/* Add max-h-full or similar when expanded for scrolling */}
          <div className={cn(
                "relative z-10 h-full overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-primary/20",
                isLetterRevealed && !isShrinking && "max-h-full" // Ensure scroll works when full screen
               )}>
               <AnimatePresence mode="wait">
                  <motion.p
                      key={isLetterRevealed ? 'full' : 'partial'}
                      className={cn(
                          "text-base md:text-lg text-foreground leading-relaxed whitespace-pre-line",
                          "font-dancing-script"
                          )}
                      style={{ fontFamily: 'var(--font-dancing-script)', fontSize: '1.3rem' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                  >
                      {isLetterRevealed ? fullText : partialText}
                       {!isLetterRevealed && isEnvelopeOpen && (
                          <span className="italic text-muted-foreground block mt-3 text-sm animate-pulse">
                              (click to read more...)
                          </span>
                          )}
                       {isLetterRevealed && !isShrinking && ( // Show only when fully revealed and not shrinking
                           <span className="italic text-muted-foreground block mt-4 text-sm animate-pulse">
                               (click the letter...)
                           </span>
                       )}
                  </motion.p>
               </AnimatePresence>
           </div>
      </motion.div>

    </div>
  );
};

export default OpenLetter;
