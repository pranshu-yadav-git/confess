
'use client';

import React, { useState } from 'react';
import LetterTiles from '../components/letter-tiles';
import OpenLetter from '../components/open-letter';
import ProposalGame from '../components/proposal-game';
import { motion, AnimatePresence } from 'framer-motion';

// Define the possible states of the application view
type AppState = 'tiles' | 'letter' | 'game';

export default function Home() {
  // State to manage the current view/component being displayed
  const [appState, setAppState] = useState<AppState>('tiles');

  // Handler to transition from LetterTiles to OpenLetter
  const handleTilesRevealed = () => {
    setAppState('letter');
  };

  // Handler to transition from OpenLetter to ProposalGame
  // This is called *after* the internal shrinking animation in OpenLetter completes
  const handleLetterClicked = () => {
    setAppState('game');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background overflow-hidden">
      {/* AnimatePresence handles the enter/exit animations between states */}
      <AnimatePresence mode="wait">
        {/* Conditionally render LetterTiles component */}
        {appState === 'tiles' && (
          <motion.div
            key="tiles"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -50 }} // Keep exit animation
            transition={{ duration: 0.5 }}
            className="w-full h-full flex items-center justify-center" // Ensure full height for centering
          >
            <LetterTiles onReveal={handleTilesRevealed} />
          </motion.div>
        )}

        {/* Conditionally render OpenLetter component */}
        {appState === 'letter' && (
          <motion.div
            key="letter"
            // Simplified entrance for the container - the component inside handles its reveal animation
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            // Simple fade out exit - the shrinking is handled inside the component before transition
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }} // Shorter duration for container fade
            className="w-full h-full flex items-center justify-center" // Container takes full space
          >
            {/* Pass the handler to transition to the game */}
            <OpenLetter onPaperClick={handleLetterClicked} />
          </motion.div>
        )}

        {/* Conditionally render ProposalGame component */}
        {appState === 'game' && (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} // Simple fade out
            transition={{ duration: 0.5 }}
            className="w-full h-full flex items-center justify-center" // Ensure full height
          >
            <ProposalGame />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
