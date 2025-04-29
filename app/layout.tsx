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
    <html lang="en">
      {/* Add both font variables to the body class */}
      <body className={`${inter.variable} ${dancingScript.variable} font-sans antialiased`}>
        {/* Tailwind's font-sans will use --font-inter by default (set in tailwind.config) */}
        {/* Apply font-dancing-script class where needed, or set it globally in globals.css */}
        {children}
        <Toaster /> {/* Add Toaster here */}
      </body>
    </html>
  );
}
