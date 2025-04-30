import type { Metadata } from 'next';
import { Dancing_Script, Inter } from 'next/font/google'; // Use Inter as fallback/base
import './globals.css';
import { Toaster } from "../components/ui/toaster"; // Import Toaster

// Using Inter as a base sans-serif font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Define CSS variable for Inter
});

// Romantic script font
const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'], // Include weights if needed
  variable: '--font-dancing-script', // Define CSS variable for Dancing Script
});

export const metadata: Metadata = {
  title: 'A Love Revelation', // Updated title
  description: 'A special message just for you.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <body className={`${inter.variable} ${dancingScript.variable} font-sans antialiased`}>
      {children}
      <Toaster /> {/* Add Toaster here */}
    </body>
  );
}
