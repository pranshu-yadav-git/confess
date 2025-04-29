
'use client';

 import React, { useState, useRef, useEffect } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { Button } from '@/components/ui/button';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
 import { useToast } from "@/hooks/use-toast";
 import Confetti from 'react-confetti';
 import { useWindowSize } from '@react-hook/window-size';
 import { cn } from '@/lib/utils'; // Import cn for conditional classes

 interface ProposalGameProps {}

 const CUTE_MESSAGES = [
   "Oops, try again?",
   "Aww, don't be like that!",
   "My heart says yes though...",
   "Pretty please?",
   "Is that a maybe?",
   "You're making this difficult!",
   "Think of the puppies!",
   "But... but... love?",
   "Okay, last chance?",
   "You clicked it again! 😉"
 ];

 const ProposalGame: React.FC<ProposalGameProps> = () => {
   const { toast } = useToast();
   const [noButtonPosition, setNoButtonPosition] = useState<{ x: number | string; y: number | string }>({ x: '55%', y: '50%' }); // Start slightly right of center
   const [noButtonScale, setNoButtonScale] = useState(1);
   const [noButtonInitialStyle, setNoButtonInitialStyle] = useState<React.CSSProperties>({ // For initial centered position
        position: 'absolute',
        left: '55%', // Place it next to Yes
        top: '50%',
        transform: 'translate(-50%, -50%) scale(1)', // Center vertically and horizontally
        transition: 'left 0.3s ease-out, top 0.3s ease-out, transform 0.1s ease-in-out',
   });
    const [isNoButtonMoving, setIsNoButtonMoving] = useState(false); // Track if movement logic is active
   const [showConfettiPopup, setShowConfettiPopup] = useState(false);
   const gameAreaRef = useRef<HTMLDivElement>(null);
   const noButtonRef = useRef<HTMLButtonElement>(null);
   const { width, height } = useWindowSize();

   const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
     if (!noButtonRef.current || !gameAreaRef.current || !isNoButtonMoving) return; // Only move if logic is active

     const noButtonRect = noButtonRef.current.getBoundingClientRect();
     const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
     const mouseX = event.clientX - gameAreaRect.left;
     const mouseY = event.clientY - gameAreaRect.top;

     // Calculate button center relative to the game area (using pixel position)
      // Ensure noButtonPosition uses numbers before calculation
      const currentX = typeof noButtonPosition.x === 'string' ? parseFloat(noButtonPosition.x) : noButtonPosition.x;
      const currentY = typeof noButtonPosition.y === 'string' ? parseFloat(noButtonPosition.y) : noButtonPosition.y;

      if (isNaN(currentX) || isNaN(currentY)) {
          // Handle cases where initial position might still be percentage or parsing fails
          console.warn("Button position is not numeric, cannot calculate center.");
          return;
      }

     const buttonCenterX = currentX + noButtonRect.width / 2;
     const buttonCenterY = currentY + noButtonRect.height / 2;


     const proximity = 80; // Increased distance threshold
     const distance = Math.sqrt(
       Math.pow(mouseX - buttonCenterX, 2) + Math.pow(mouseY - buttonCenterY, 2)
     );

     if (distance < proximity) {
       moveNoButton(gameAreaRect);
     }
   };

    // Activate movement logic on first hover over the game area *after* initial render
    const handleMouseEnterGameArea = () => {
        if (!isNoButtonMoving && gameAreaRef.current && noButtonRef.current) {
            setIsNoButtonMoving(true);
            // Set initial position in pixels based on current % layout if needed
            const gameRect = gameAreaRef.current.getBoundingClientRect();
            const btnRect = noButtonRef.current.getBoundingClientRect();

             // Calculate initial pixel position based on its current placement relative to the game area
            const initialPixelX = btnRect.left - gameRect.left;
            const initialPixelY = btnRect.top - gameRect.top;


            setNoButtonPosition({x: initialPixelX, y: initialPixelY});
            setNoButtonInitialStyle({
                position: 'absolute',
                left: `${initialPixelX}px`,
                top: `${initialPixelY}px`,
                transform: `scale(${noButtonScale})`,
                transition: 'left 0.3s ease-out, top 0.3s ease-out, transform 0.1s ease-in-out',
            });
        }
    };


   const moveNoButton = (gameAreaRect: DOMRect) => {
     if (!noButtonRef.current) return;

     const buttonWidth = noButtonRef.current.offsetWidth * noButtonScale; // Account for scale
     const buttonHeight = noButtonRef.current.offsetHeight * noButtonScale; // Account for scale
     // Ensure padding from edges
     const padding = 20;
     const maxX = gameAreaRect.width - buttonWidth - padding;
     const maxY = gameAreaRect.height - buttonHeight - padding;

     const newX = Math.max(padding, Math.random() * maxX);
     const newY = Math.max(padding, Math.random() * maxY);

     setNoButtonPosition({ x: newX, y: newY });
     // Update style directly for absolute pixel positioning
      setNoButtonInitialStyle(prevStyle => ({ // Use previous style to maintain scale
         ...prevStyle,
         position: 'absolute',
         left: `${newX}px`,
         top: `${newY}px`,
         // Transform only includes scale now, position is set via left/top
         transform: `scale(${noButtonScale})`,
         transition: 'left 0.3s ease-out, top 0.3s ease-out, transform 0.1s ease-in-out',
      }));
   };

   const handleNoClick = () => {
     const newScale = noButtonScale * 0.95;
     const finalScale = newScale < 0.2 ? 0.2 : newScale;
     setNoButtonScale(finalScale);

     const randomMessage = CUTE_MESSAGES[Math.floor(Math.random() * CUTE_MESSAGES.length)];
     toast({
       title: "❤️",
       description: <span style={{ fontFamily: 'var(--font-dancing-script)', fontSize: '1.1rem' }}>{randomMessage}</span>, // Apply font
       variant: "default", // Use default (themed) toast variant
       duration: 2000,
     });

      // Update style immediately with new scale
      setNoButtonInitialStyle(prevStyle => ({
         ...prevStyle,
         transform: `scale(${finalScale})`, // Apply new scale
      }));

     // Ensure movement logic is active and move button
      if (!isNoButtonMoving) {
          handleMouseEnterGameArea(); // Activate movement if not already active
      }
     if (gameAreaRef.current) {
        moveNoButton(gameAreaRef.current.getBoundingClientRect());
     }
   };

   const handleYesClick = () => {
     setShowConfettiPopup(true);
   };

   return (
     <motion.div
       initial={{ opacity: 0, scale: 0.9 }}
       animate={{ opacity: 1, scale: 1 }}
       transition={{ delay: 0.3, duration: 0.5 }}
       className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg shadow-xl" // Use theme gradients
     >
        <AnimatePresence>
         {showConfettiPopup && width && height && (
              <Confetti
                 width={width}
                 height={height}
                 recycle={false}
                 numberOfPieces={400}
                 gravity={0.15}
                 initialVelocityY={20}
                 colors={[ // Love-themed confetti colors
                    '#FFC0CB', // Light Pink
                    '#FF69B4', // Hot Pink
                    '#B76E79', // Rose Gold (Accent)
                    '#FFFFFF', // White
                    '#ADD8E6', // Baby Blue (Secondary)
                    '#F8F8FF' // Ghost White (Subtle)
                  ]}
              />
         )}
       </AnimatePresence>

       <h2
         className="text-3xl md:text-4xl font-bold text-center text-primary-foreground mb-8 drop-shadow-md" // Use theme text color
         style={{ fontFamily: 'var(--font-dancing-script)' }} // Apply romantic font
        >
         I love you, will you accept my proposal? Please...
       </h2>

       <div
         ref={gameAreaRef}
         className="relative w-full max-w-sm h-48 md:h-64 flex items-center justify-center border-2 border-dashed border-accent/50 rounded-lg p-4 overflow-hidden" // Use theme accent for border
         onMouseMove={handleMouseMove}
         onMouseEnter={handleMouseEnterGameArea} // Activate movement logic on enter
         aria-live="polite"
       >
         {/* Yes Button - Positioned slightly left of center */}
         <Button
           onClick={handleYesClick}
           className={cn( // Use cn for merging classes
            "absolute left-[45%] top-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold py-3 px-6 rounded-full text-xl shadow-lg hover:scale-105 transition-transform duration-200 z-10",
            "bg-green-500 hover:bg-green-600 text-white" // Keep specific green/red for semantic meaning
            )}
           aria-label="Yes, I accept"
           style={{ fontFamily: 'var(--font-inter), sans-serif' }} // Use sans-serif for button clarity
         >
           Yes 😍
         </Button>

          {/* No Button - Starts next to Yes, then moves */}
         <motion.button
            ref={noButtonRef}
            onClick={handleNoClick}
            className={cn( // Use cn
                "font-bold py-2 px-4 rounded-full text-lg shadow-lg z-20 cursor-pointer",
                "bg-red-500 hover:bg-red-600 text-white" // Keep specific green/red
                )}
            style={noButtonInitialStyle} // Apply dynamic style for position and scale
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            aria-label="No (moves away on hover)"
            // Apply sans-serif font for button clarity
         >
             <span style={{ fontFamily: 'var(--font-inter), sans-serif' }}>No 🙄</span>
         </motion.button>
       </div>

       <Dialog open={showConfettiPopup} onOpenChange={setShowConfettiPopup}>
         <DialogContent className="bg-background border-accent rounded-lg shadow-2xl"> {/* Theme background and accent border */}
           <DialogHeader>
             <DialogTitle
                className="text-center text-4xl text-accent font-bold mt-4" // Theme accent color
                style={{ fontFamily: 'var(--font-dancing-script)' }} // Apply romantic font
             >
               Yesss! 🎉
             </DialogTitle>
           </DialogHeader>
           <DialogDescription
                className="text-center text-2xl text-primary-foreground py-8" // Theme text color
                style={{ fontFamily: 'var(--font-dancing-script)' }} // Apply romantic font
            >
             Love You Pookie 🎀💝
           </DialogDescription>
           <div className="flex justify-center pb-4">
              <Button onClick={() => setShowConfettiPopup(false)} variant="outline" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>Close</Button> {/* Use outline variant */}
           </div>
         </DialogContent>
       </Dialog>
     </motion.div>
   );
 };

 export default ProposalGame;
