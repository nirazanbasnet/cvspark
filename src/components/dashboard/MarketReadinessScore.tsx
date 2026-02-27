import { cn } from "@/lib/utils";
import { AnalysisData } from "@/context/CvContext";
import { CheckCircle2, AlertCircle, BookOpen } from "lucide-react";

export function MarketReadinessScore({ analysisData }: { analysisData: AnalysisData }) {
    if (!analysisData) {
        return (
            <div className="w-full bg-white rounded-xl shadow-sm border border-neutral-200 p-8 flex flex-col items-center justify-center min-h-[400px] text-neutral-500 text-center">
                <p>Market Score is missing or corrupted.<br />Please use the Re-Analyze button to restore it.</p>
            </div>
        );
    }

    const score = analysisData.score;

    return (
        <div className="w-full space-y-6 flex flex-col items-center">
            {/* Header / Score Circular Dial */}
            <div className="bg-white/5 rounded-xl shadow-sm border border-white/10 p-8 flex flex-col items-center justify-center w-full">
                <div className="relative flex items-center justify-center w-32 h-32 mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="transparent"
                            className="stroke-white/5"
                            strokeWidth="10"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="transparent"
                            className="stroke-emerald-400 transition-all duration-1000 ease-out"
                            strokeWidth="10"
                            strokeDasharray="264"
                            strokeDashoffset={264 - (264 * score) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white tracking-tighter">
                            {score}
                        </span>
                        <span className="text-xs font-medium text-neutral-500 mt-0.5">
                            / 100
                        </span>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-white">Industry Standard Score</h3>
                <p className="text-xs font-bold text-neutral-400 mt-1 uppercase tracking-wider">
                    {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Improvement"}
                </p>
                <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-3 py-1 rounded-full mt-3">
                    Target Role: {analysisData.roleCategory}
                </div>
            </div>

            {/* Market Fit Proof */}
            <div className="bg-white/5 rounded-xl shadow-sm border border-white/10 p-6 w-full text-sm">
                <h4 className="font-bold text-white mb-2">Market Fit Summary</h4>
                <p className="text-neutral-400 leading-relaxed mb-6">
                    {analysisData.marketFitSummary}
                </p>

                <div className="space-y-6">
                    {analysisData.categories.map((category, idx) => (
                        <div key={idx} className="border-t border-white/5 pt-4 first:border-0 first:pt-0">
                            <div className="flex flex-col mb-4 bg-black/40 rounded-lg p-3 border border-white/5">
                                <div className="flex justify-between items-center mb-1.5">
                                    <h5 className="font-bold text-rose-200">{category.name}</h5>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                                        {category.score}/100
                                    </span>
                                </div>
                                {category.sourceCited && (
                                    <div className="flex gap-1.5 items-center text-[11px] text-neutral-500 font-medium tracking-wide">
                                        <BookOpen className="w-3.5 h-3.5 text-rose-500" />
                                        <span className="uppercase">Source: </span>
                                        <span className="text-neutral-400 italic">"{category.sourceCited}"</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
                                {/* Successes */}
                                {category.good.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">What you did well</div>
                                        {category.good.map((item, gIdx) => (
                                            <div key={gIdx} className="flex gap-2 items-start text-neutral-300 text-[13px] leading-relaxed">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Improvements */}
                                {category.improvements.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2">Areas to Improve</div>
                                        {category.improvements.map((item, iIdx) => (
                                            <div key={iIdx} className="flex gap-2 items-start text-neutral-300 text-[13px] leading-relaxed">
                                                <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
