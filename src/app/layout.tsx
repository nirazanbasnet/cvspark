import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CvProvider } from "@/context/CvContext";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* Global Header for Auth */}
          <header className="absolute top-0 right-0 p-4 z-50">
            <SignedOut>
              <div className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors border border-white/10 shadow-sm cursor-pointer">
                <SignInButton mode="modal" signUpFallbackRedirectUrl="/builder" />
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-2 border-emerald-500/30" } }} />
            </SignedIn>
          </header>

          <CvProvider>
            {children}
          </CvProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
