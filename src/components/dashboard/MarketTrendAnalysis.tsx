import { CheckCircle2, ChevronRight, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryResult {
    name: string;
    score: number;
    good: string[];
    improvements: string[];
}

export interface MarketTrendAnalysisProps {
    roleCategory: string;
    marketFitSummary: string;
    categories: CategoryResult[];
}

export function MarketTrendAnalysis({ roleCategory, marketFitSummary, categories }: MarketTrendAnalysisProps) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="w-full space-y-8 animate-fade-in-up">
            {/* Header / Summary Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-rose-500/5 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                    <div className="p-4 bg-indigo-500/20 rounded-2xl shrink-0">
                        <Target className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-indigo-300 uppercase tracking-widest mb-1">Inferred Market Role</h2>
                        <h3 className="text-3xl font-bold tracking-tight text-white mb-3">{roleCategory}</h3>
                        <p className="text-white/70 leading-relaxed text-lg">{marketFitSummary}</p>
                    </div>
                </div>
            </div>

            {/* Dynamic Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {categories.map((category, index) => {
                    const isExcellent = category.score >= 80;
                    const isGood = category.score >= 60 && category.score < 80;

                    return (
                        <div key={index} className="flex flex-col bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl hover:bg-white/10 transition-colors h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-white/50" />
                                    {category.name}
                                </h4>
                                <div className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-bold shadow-md",
                                    isExcellent ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" :
                                        isGood ? "bg-blue-500/20 text-blue-400 border border-blue-500/20" :
                                            "bg-rose-500/20 text-rose-400 border border-rose-500/20"
                                )}>
                                    {category.score} / 100
                                </div>
                            </div>

                            <div className="space-y-6 flex-1 flex flex-col">
                                {/* Good Points */}
                                {category.good && category.good.length > 0 && (
                                    <div className="flex-1">
                                        <h5 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> Market Alignment
                                        </h5>
                                        <ul className="space-y-3">
                                            {category.good.map((point, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <ChevronRight className="w-4 h-4 text-emerald-500/50 mt-0.5 shrink-0" />
                                                    <span className="text-white/80 text-sm leading-relaxed">{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Improvement Points */}
                                {category.improvements && category.improvements.length > 0 && (
                                    <div className="flex-1">
                                        <h5 className="text-sm font-semibold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" /> Areas to Level Up
                                        </h5>
                                        <ul className="space-y-3">
                                            {category.improvements.map((point, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <ChevronRight className="w-4 h-4 text-rose-500/50 mt-0.5 shrink-0" />
                                                    <span className="text-white/80 text-sm leading-relaxed">{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
