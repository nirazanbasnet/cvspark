"use client";

import { useState } from "react";
import { Building2, Rocket, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const benchmarks = [
    {
        id: "bigtech",
        label: "Big Tech",
        icon: Building2,
        stats: { score: 92, exp: "8+", keywords: "15+" }
    },
    {
        id: "startups",
        label: "Startups",
        icon: Rocket,
        stats: { score: 85, exp: "5+", keywords: "10+" }
    },
    {
        id: "government",
        label: "Government",
        icon: Landmark,
        stats: { score: 78, exp: "10+", keywords: "8+" }
    }
];

export function BenchmarkComparison() {
    const [activeTab, setActiveTab] = useState("bigtech");

    const activeStats = benchmarks.find(b => b.id === activeTab)?.stats || benchmarks[0].stats;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-1">Benchmark Comparison</h3>
            <p className="text-xs text-neutral-500 mb-6">Compare your resume against industry standards</p>

            {/* Tabs */}
            <div className="flex bg-neutral-100 p-1 rounded-xl mb-6">
                {benchmarks.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center py-3 rounded-lg text-sm transition-all duration-300",
                                isActive
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50"
                            )}
                        >
                            <Icon className="w-5 h-5 mb-1" />
                            <span className="font-medium text-[11px]">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                    <p className="text-2xl font-bold text-neutral-900">{activeStats.score}</p>
                    <p className="text-[10px] text-neutral-500 font-medium">Avg Score</p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                    <p className="text-2xl font-bold text-neutral-900">{activeStats.exp}</p>
                    <p className="text-[10px] text-neutral-500 font-medium">Exp (yrs)</p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                    <p className="text-2xl font-bold text-neutral-900">{activeStats.keywords}</p>
                    <p className="text-[10px] text-neutral-500 font-medium">Keywords</p>
                </div>
            </div>
        </div>
    );
}
