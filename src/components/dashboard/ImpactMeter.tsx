"use client";

import { useEffect, useState } from "react";

export function ImpactMeter({ score }: { score: number }) {
    // We animate the indicator slightly for better UX
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedScore(score);
        }, 300);
        return () => clearTimeout(timer);
    }, [score]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-orange-500">⚡</span>
                    <h3 className="text-lg font-bold text-neutral-900">Impact Meter</h3>
                </div>
                <span className="text-sm font-bold text-blue-600">{animatedScore}/100</span>
            </div>

            <p className="text-xs text-neutral-500 -mt-5">Action-oriented language score</p>

            {/* Gradient Bar */}
            <div className="relative pt-2 pb-6">
                <div className="h-6 w-full rounded-full bg-gradient-to-r from-rose-200 via-indigo-200 to-blue-300 relative">
                    <div
                        className="absolute top-1/2 -mt-2.5 h-5 w-5 bg-white border-2 border-neutral-800 rounded-full shadow-md transition-all duration-1000 ease-out"
                        style={{ left: `calc(${animatedScore}% - 10px)` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-neutral-400 font-medium">
                    <span>Passive</span>
                    <span>Action-Oriented</span>
                </div>
            </div>

            <div className="bg-blue-50/50 rounded-lg p-4 text-center border border-blue-100">
                <p className="text-sm font-bold text-blue-700">Moderately Impactful</p>
                <p className="text-xs text-blue-600/80 mt-1">Good start, consider adding more impact words</p>
            </div>
        </div>
    );
}
