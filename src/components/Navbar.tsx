"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Database, Menu, X } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const navItems = [
        { label: 'Dashboard', href: '/dashboard' },
    ];

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full py-4 px-4 sm:px-6 lg:px-12 xl:px-20 absolute top-0 left-0 z-50 bg-transparent"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/">
                    <motion.div
                        className="flex items-center gap-2 cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                    >
                        <span className="font-bold text-slate-900 text-xl tracking-tight">CvSpark</span>
                    </motion.div>
                </Link>

                {/* Desktop Auth */}
                <div className="hidden md:flex items-center gap-4">
                    {navItems.map((item) => (
                        <motion.a
                            key={item.label}
                            href={item.href}
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            {item.label}
                        </motion.a>
                    ))}
                    {/* Top action bar */}
                    <div>
                        <button onClick={() => router.push('/dashboard/scraper')} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:scale-105 transition-all outline-none shadow-sm">
                            <Database className="w-4 h-4 text-blue-500" />
                            Scraper Database
                        </button>
                    </div>
                    <SignedOut>
                        <SignInButton mode="modal" signUpFallbackRedirectUrl="/builder">
                            <motion.button
                                className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Sign In
                            </motion.button>
                        </SignInButton>
                        <SignInButton mode="modal" signUpFallbackRedirectUrl="/builder">
                            <motion.button
                                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-md"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Get Started
                            </motion.button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9 border-2 border-blue-500/30" } }} />
                    </SignedIn>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="md:hidden mt-4 pb-4 border-t border-slate-100 pt-4 bg-white rounded-2xl shadow-xl px-4 absolute left-4 right-4"
                >
                    <div className="flex flex-col gap-4">
                        {navItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors px-2 py-1"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.label}
                            </a>
                        ))}
                        {/* Top action bar */}
                        <div>
                            <button onClick={() => router.push('/dashboard/scraper')} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:scale-105 transition-all outline-none shadow-sm">
                                <Database className="w-4 h-4 text-blue-500" />
                                Scraper Database
                            </button>
                        </div>
                        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-100">
                            <SignedOut>
                                <SignInButton mode="modal" signUpFallbackRedirectUrl="/builder">
                                    <button className="w-full px-5 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
                                        Sign In
                                    </button>
                                </SignInButton>
                                <SignInButton mode="modal" signUpFallbackRedirectUrl="/builder">
                                    <button className="w-full px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                                        Get Started
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <div className="flex items-center gap-3 px-2 py-1">
                                    <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-2 border-blue-500/30" } }} />
                                    <span className="text-sm font-medium text-slate-700">My Account</span>
                                </div>
                            </SignedIn>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
};

export default Navbar;
