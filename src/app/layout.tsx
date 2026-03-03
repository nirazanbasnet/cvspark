import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CvProvider } from "@/context/CvContext";
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CvSpark",
  description: "AI-powered CV Score Builder and Job Matching Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.variable} ${playfair.variable} antialiased`}
        >
          <CvProvider>
            {children}
          </CvProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
