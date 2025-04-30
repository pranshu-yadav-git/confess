import { Dancing_Script, Inter } from 'next/font/google'; 
import './globals.css'; 
import { Toaster } from "../components/ui/toaster"; 

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', 
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'], 
  variable: '--font-dancing-script', 
});

export const metadata = {
  title: 'A Love Revelation',
  description: 'A special message just for you.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body className={`${inter.variable} ${dancingScript.variable} font-sans antialiased`}>
      {children}
      <Toaster />
    </body>
  );
}
