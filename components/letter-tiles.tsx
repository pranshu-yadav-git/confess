
// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Heart, Hand } from 'lucide-react'; // Import Hand icon
import { cn } from '../lib/utils';
import Image from 'next/image';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import SwipeHintAnimation from './swipe-hint-animation'; // Import the new component

interface LetterTileProps {
  onReveal: () => void;
}

const TOTAL_TILES = 16; // 15 cover tiles + 1 reveal tile
const REVEAL_THRESHOLD = 100; // Pixels threshold to consider a tile 'dragged away'
const INACTIVITY_TIMEOUT = 5000; // 5 seconds before showing hint

// Placeholder horizontal envelope image URL - Larger dimensions
const ENVELOPE_IMAGE_URL = "https://picsum.photos/seed/envelopeH/256/192"; // Aspect ratio ~4:3 (w-64 h-48 in Tailwind)
const TILE_WIDTH_CLASS = 'w-64'; // Updated width
const TILE_HEIGHT_CLASS = 'h-48'; // Updated height
const IMAGE_WIDTH = 256; // Match Tailwind w-64
const IMAGE_HEIGHT = 192; // Match Tailwind h-48

const LetterTiles: React.FC<LetterTileProps> = ({ onReveal }) => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [tiles, setTiles] = useState<
    { id: number; rotation: number; isRevealed: boolean; initialX: number; initialY: number; x: number; y: number; zIndex: number }[]
  >([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isFinalTileVisible, setIsFinalTileVisible] = useState(false); // Tracks if only the final tile is left
  const [animateFinalTile, setAnimateFinalTile] = useState(false); // Controls final tile's reveal animation (scale up + pulse)
  const [showRevealConfetti, setShowRevealConfetti] = useState(false); // Controls confetti burst
  const [draggingTileId, setDraggingTileId] = useState<number | null>(null);
  const { width, height } = useWindowSize(); // For confetti dimensions

  // Hint Animation State
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);


  // Function to reset the inactivity timer and hide the hint
  const resetInactivityTimer = () => {
    setShowSwipeHint(false); // Hide hint immediately on interaction
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    // Start timer only if the tiles are still visible and hint is not already showing
    if (revealedCount < TOTAL_TILES - 1 && !animateFinalTile) {
       inactivityTimerRef.current = setTimeout(() => {
         // Only show hint if no tile is currently being dragged
         if (draggingTileId === null) {
           setShowSwipeHint(true);
         }
       }, INACTIVITY_TIMEOUT);
    }
  };


  useEffect(() => {
    // Start the initial timer
    resetInactivityTimer();

    // Add global listeners to detect interaction anywhere on the page within this component phase
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('touchstart', resetInactivityTimer);

    // Cleanup listeners and timer on component unmount
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('touchstart', resetInactivityTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedCount, animateFinalTile, draggingTileId]); // Rerun effect if tile state changes that should stop the hint logic


  useEffect(() => {
    // Center all tiles initially using 0,0 offsets (adjusted by transform)
    const initialTiles = Array.from({ length: TOTAL_TILES }, (_, i) => {
      const isRevealTile = i === 0;
      const initialX = 0; // Start at center (offset 0 relative to tile container)
      const initialY = 0; // Start at center (offset 0 relative to tile container)
      const rotation = isRevealTile ? 0 : Math.random() * 10 - 5; // Cover tiles slight random rotation (-5 to 5 deg)
      const zIndex = isRevealTile ? 10 : 10 + i; // Heart (id 0) at the bottom (10), covers on top (11+)

      return {
        id: i,
        rotation: rotation,
        isRevealed: false,
        initialX: initialX,
        initialY: initialY,
        x: initialX, // Current x offset from center
        y: initialY, // Current y offset from center
        zIndex: zIndex,
      };
    });
    setTiles(initialTiles);
  }, []);

  // Recalculate Z-Index when tiles or dragging state changes
  useEffect(() => {
    setTiles(prevTiles => {
        const baseZIndex = 10;
        return prevTiles.map((tile) => {
            let zIndex;
             if (tile.id === 0) {
                 // Heart tile is generally at the bottom unless being animated or dragged
                 zIndex = animateFinalTile ? baseZIndex + TOTAL_TILES + 2 : (draggingTileId === 0 ? baseZIndex + TOTAL_TILES + 1 : baseZIndex);
             } else {
                 // Cover tiles: Higher ID = higher stack position initially.
                 // Non-revealed tiles stack naturally based on their ID order.
                 zIndex = baseZIndex + tile.id;
             }

            // Bring currently dragged tile higher (could be heart or cover)
            const finalZIndex = draggingTileId === tile.id ? baseZIndex + TOTAL_TILES + 1 : zIndex;

            return { ...tile, zIndex: finalZIndex };
        });
    });
// Dependency array needs to reflect what affects z-index: number of tiles, revealed status, dragging state, animation state
}, [tiles.length, revealedCount, draggingTileId, animateFinalTile]);


  // Effect to check if only the final tile remains
   useEffect(() => {
     if (revealedCount === TOTAL_TILES - 1) {
       setIsFinalTileVisible(true);
       setShowSwipeHint(false); // Ensure hint is hidden when final tile appears
       if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current); // Clear timer

       // Add a small delay before starting the final animation to ensure tiles are gone
       const timer = setTimeout(() => {
         setAnimateFinalTile(true); // Start scale-up and pulse animation
         setShowRevealConfetti(true); // Trigger confetti burst
       }, 300); // Short delay
       return () => clearTimeout(timer);
     } else {
       setIsFinalTileVisible(false);
       setAnimateFinalTile(false); // Reset animation state if tiles are put back etc.
       resetInactivityTimer(); // Restart inactivity timer if tiles are back
     }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [revealedCount]);


  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    id: number
  ) => {
    setDraggingTileId(null); // End dragging
    resetInactivityTimer(); // Reset timer after drag interaction ends

    // Find the tile to get its initial position (which is 0,0 - center offset)
    const tile = tiles.find(t => t.id === id);
    if (!tile) return;

    // Calculate the final offset from the center based on the drag
    const finalOffsetX = info.offset.x;
    const finalOffsetY = info.offset.y;

    const distance = Math.sqrt(finalOffsetX ** 2 + finalOffsetY ** 2);

    if (id !== 0 && distance > REVEAL_THRESHOLD) {
       // Mark as revealed, it will exit via AnimatePresence
       // Keep its dragged position (offset) for the exit animation start point
       setTiles((prevTiles) =>
         prevTiles.map((t) =>
           t.id === id ? { ...t, isRevealed: true, x: finalOffsetX, y: finalOffsetY } : t
         )
       );
       setRevealedCount((count) => count + 1);
    } else {
       // Snap back smoothly to the center (offset 0,0 relative to container)
       setTiles((prevTiles) =>
         prevTiles.map((t) =>
           t.id === id ? { ...t, x: 0, y: 0 } : t // Snap back to center offset (0,0)
         )
       );
    }
  };

   const handleDragStart = (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
      id: number
    ) => {
        setDraggingTileId(id); // Start dragging any tile
        setShowSwipeHint(false); // Hide hint when dragging starts
        if (inactivityTimerRef.current) {
           clearTimeout(inactivityTimerRef.current); // Clear timer during drag
        }
  };

   const handleFinalTileClick = () => {
     // Only trigger if the final animation has started and the callback hasn't been fired yet.
     if (animateFinalTile && onReveal) {
        // Optionally stop confetti immediately or let it fade
        // setShowRevealConfetti(false);
        onReveal(); // Call the callback passed from the parent to transition views
     }
   };

   // Get dynamic style for each tile, positioning within the centered container
   const getTileStyle = (tile: { id: number; zIndex: number; x: number; y: number; rotation: number; }) => {
      // Position absolutely *within* the container div.
      // The container is centered by flexbox, so absolute children start at top-left of container.
      return {
          zIndex: tile.zIndex,
          position: 'absolute',
          // Use transform to apply current x, y offset and rotation *from the container's center*.
          // No need for top/left 50% and translate(-50%, -50%) as the parent handles centering.
          transform: `translate(${tile.x}px, ${tile.y}px) rotate(${tile.rotation}deg)`,
          // Center the tile's origin to allow rotation around its center
          transformOrigin: 'center center',
          cursor: tile.id === 0 && isFinalTileVisible ? 'pointer' : (draggingTileId === tile.id ? 'grabbing' : 'grab'),
      };
   };


  return (
    // Main container using flexbox for centering its child (the tile container)
    <div
        ref={constraintsRef}
        className="relative w-full h-screen flex items-center justify-center overflow-hidden p-4 bg-background"
        onMouseMove={resetInactivityTimer} // Reset timer on mouse move over the area
        onTouchStart={resetInactivityTimer} // Reset timer on touch start over the area
        >
       {/* Confetti Layer */}
       {showRevealConfetti && width && height && (
          <Confetti
             width={width}
             height={height}
             recycle={false}
             numberOfPieces={400} // More confetti for bigger impact
             gravity={0.25} // Slightly stronger gravity
             initialVelocityY={30} // Launch higher
             colors={[ // Love-themed colors
                '#FFC0CB', // Light Pink
                '#FF69B4', // Hot Pink
                '#FF1493', // Deep Pink
                '#DB7093', // Pale Violet Red
                '#B76E79', // Rose Gold (Accent)
                '#FFFFFF', // White
                '#DC143C', // Crimson Red for pop
              ]}
             style={{ zIndex: 9999 }} // Ensure confetti is on top
             tweenDuration={1500} // Slightly longer duration
             onConfettiComplete={() => setShowRevealConfetti(false)} // Stop rendering confetti when done
          />
       )}

      {/* Swipe Hint Animation */}
       <AnimatePresence>
           {showSwipeHint && <SwipeHintAnimation />}
       </AnimatePresence>

      {/* Tile Container - This div is positioned by the flex parent and holds the absolutely positioned tiles */}
      {/* It needs a defined size to contain the tiles correctly */}
      <div className={cn("relative", TILE_WIDTH_CLASS, TILE_HEIGHT_CLASS)}>
          <AnimatePresence>
            {tiles.map((tile, index) => // Pass index for stagger animation
              !tile.isRevealed ? (
                <motion.div
                  key={tile.id}
                  className={cn(
                    'absolute inset-0 rounded-lg shadow-lg flex items-center justify-center overflow-hidden', // Base styles, absolute within container
                    // Different background/border for the heart tile
                    tile.id === 0 ? 'bg-primary/80 border-2 border-accent' : 'bg-card border border-border',
                    // Conditional border pop for pulsing heart using accent color
                    animateFinalTile && tile.id === 0 && 'border-4 border-accent ring-4 ring-accent/50'
                  )}
                  style={getTileStyle(tile)} // Apply dynamic style for z-index, offset, rotation, cursor
                  initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }} // Start at container center (x:0, y:0 offset), faded and small
                  animate={
                     animateFinalTile && tile.id === 0
                     ? { // Scale up and pulse animation for the heart tile
                         opacity: 1,
                         x: 0, // Keep centered offset
                         y: 0,
                         scale: [1, 1.4, 1.3], // Initial scale up, then start pulsing between 1.4 and 1.3
                         rotate: 0, // Ensure rotation is reset
                         transition: {
                            opacity: { duration: 0.3 },
                            x: { duration: 0.3, ease: 'easeOut' }, // Smooth centering (already centered)
                            y: { duration: 0.3, ease: 'easeOut' },
                            scale: { duration: 0.5, ease: 'easeOut', times: [0, 0.7, 1] },
                            rotate: { duration: 0.3 },
                            // Pulse animation (repeats after initial scale up)
                            default: { delay: 0.5, duration: 0.6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
                          }
                       }
                     : { // Normal animation for cover tiles or heart before reveal
                          x: tile.x, // Use current x, y offset for position
                          y: tile.y,
                          rotate: tile.rotation,
                          opacity: 1,
                          scale: 1,
                          transition: {
                             opacity: { duration: 0.5, delay: index * 0.05 }, // Staggered fade-in using index
                             scale: { duration: 0.5, delay: index * 0.05 }, // Staggered scale-in using index
                             x: { type: 'spring', stiffness: 300, damping: 30 }, // Spring for snap back to center offset
                             y: { type: 'spring', stiffness: 300, damping: 30 }
                          }
                        }
                   }
                  exit={{ // Animate out when isRevealed becomes true (for cover tiles)
                    opacity: 0,
                    scale: 0.5,
                    // Fly off in a random direction from its last dragged position (offset)
                    x: tile.x + (Math.random() - 0.5) * (width || 800), // Use window width or fallback
                    y: tile.y + (Math.random() - 0.5) * (height || 600), // Use window height or fallback
                    rotate: tile.rotation + (Math.random() - 0.5) * 360,
                    transition: { duration: 0.6, ease: 'easeOut' },
                  }}
                  drag={!animateFinalTile || tile.id !== 0} // Allow dragging cover tiles, or heart BEFORE final animation
                  dragConstraints={constraintsRef} // Constrain dragging to the main flex container
                  dragElastic={0.1} // Less elastic snap back
                  onDragStart={(event, info) => handleDragStart(event, info, tile.id)}
                  onDragEnd={(event, info) => handleDragEnd(event, info, tile.id)}
                  // Update position state (offset x, y) during drag for smooth interaction & z-index update
                   onDrag={(event, info) => {
                       if (draggingTileId === tile.id) {
                           // Update offset position based on drag offset from the container's center
                           setTiles(prev => prev.map(t => t.id === tile.id ? {...t, x: info.offset.x, y: info.offset.y} : t));
                           // Reset inactivity timer during drag movement as well
                           resetInactivityTimer();
                       }
                   }}
                  whileHover={!animateFinalTile && tile.id !== 0 ? { scale: 1.03, rotate: tile.rotation + (Math.random() * 4 - 2) } : {}} // Hover effect only on draggable cover tiles
                  whileTap={!animateFinalTile && tile.id !== 0 ? { scale: 1.05 } : {}} // Tap effect only on draggable cover tiles
                  onClick={tile.id === 0 ? handleFinalTileClick : undefined} // Click action only for final tile (id 0) when visible
                  layout // Animate layout changes smoothly
                >
                  {tile.id === 0 ? ( // Final reveal tile (heart)
                      <Heart
                          className={cn(
                              "w-24 h-24 text-accent fill-accent transition-colors duration-300", // Base heart styles using accent
                               animateFinalTile && "fill-accent text-white" // Change fill/stroke during pulse
                              )}
                       />
                  ) : ( // Cover tiles (envelopes)
                    <Image
                        src={ENVELOPE_IMAGE_URL}
                        alt={`Envelope ${tile.id}`}
                        width={IMAGE_WIDTH}
                        height={IMAGE_HEIGHT}
                        className="pointer-events-none select-none rounded-lg object-cover w-full h-full" // Ensure image fills the div
                        priority={tile.id > TOTAL_TILES - 6} // Prioritize loading top images
                    />
                  )}
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
      </div>


       {isFinalTileVisible && !animateFinalTile && ( // Show message before the pulse starts
         <motion.p
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.5 }}
           className="absolute bottom-10 text-center text-lg text-muted-foreground animate-pulse"
           style={{ fontFamily: 'var(--font-dancing-script)' }} // Apply romantic font
         >
           Click the heart...
         </motion.p>
       )}
    </div>
  );
};

export default LetterTiles;

