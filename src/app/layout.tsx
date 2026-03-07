"use client"

import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { TooltipProvider } from "@/components/ui/tooltip"

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans tactical-grid min-h-screen relative`}
      >

        <TooltipProvider>
          <main className="flex-1 overflow-auto bg-[rgba(5,5,6,0.85)] min-h-screen relative">
            {children}
          </main>
        </TooltipProvider>
      </body>
    </html>
  );
}
