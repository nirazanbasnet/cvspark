import { AnalysisData } from "@/context/CvContext";
import { CheckCircle2, AlertCircle, BookOpen, Lightbulb } from "lucide-react";

export function MarketReadinessScore({ analysisData }: { analysisData: AnalysisData; theme?: 'light' | 'dark' }) {
    if (!analysisData) {
        return (
            <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[400px] text-slate-500 text-center">
                <p>Market Score is missing or corrupted.<br />Please use the Re-Analyze button to restore it.</p>
            </div>
        );
    }

    const score = analysisData.score;

    return (
        <div className="w-full space-y-6 flex flex-col items-center font-sans">
            {/* Header / Score Circular Dial */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 w-full flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 blur-3xl rounded-full -z-10 mt-[-50px] mr-[-50px]"></div>

                <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
                    <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Market Alignment</h3>
                    <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full inline-flex mb-4 uppercase tracking-widest">
                        Target: {analysisData.roleCategory}
                    </div>
                    <p className="text-sm text-slate-600 font-medium">
                        Your CV is scored against an industry-standard benchmark (e.g., heavily quantified, zero passive voice).
                    </p>
                </div>

                <div className="flex gap-6 items-center flex-shrink-0 bg-slate-50 p-4 border border-slate-200 rounded-2xl shadow-inner">
                    {/* User Score dial */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex items-center justify-center w-24 h-24">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="transparent" className="stroke-slate-200" strokeWidth="8" />
                                <circle cx="50" cy="50" r="42" fill="transparent"
                                    className="stroke-emerald-500 transition-all duration-1000 ease-out"
                                    strokeWidth="8" strokeDasharray="264" strokeDashoffset={264 - (264 * score) / 100} strokeLinecap="round" />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-slate-900 tracking-tighter">{score}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Score</p>
                            <p className="text-sm font-bold text-emerald-600 mt-0.5">
                                {score >= 80 ? "Gold Standard" : score >= 60 ? "Competitive" : "Needs Work"}
                            </p>
                        </div>
                    </div>

                    <div className="w-px h-16 bg-slate-200 hidden sm:block"></div>

                    {/* Market Trend dial preview */}
                    {analysisData.averageMarketScore && (
                        <div className="flex items-center gap-4 hidden sm:flex">
                            <div className="relative flex items-center justify-center w-16 h-16">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" fill="transparent" className="stroke-slate-200" strokeWidth="8" />
                                    <circle cx="50" cy="50" r="42" fill="transparent"
                                        className="stroke-amber-500 transition-all duration-1000 ease-out opacity-75"
                                        strokeWidth="8" strokeDasharray="264" strokeDashoffset={264 - (264 * analysisData.averageMarketScore) / 100} strokeLinecap="round" />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center">
                                    <span className="text-sm font-bold text-slate-600">{analysisData.averageMarketScore}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest break-words w-20">Average Market Score</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Market Fit Proof */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 w-full text-sm">
                <h4 className="font-bold text-slate-900 mb-2">Market Fit Summary</h4>
                <p className="text-slate-600 leading-relaxed mb-6">
                    {analysisData.marketFitSummary}
                </p>

                <div className="space-y-6">
                    {analysisData.categories.map((category, idx) => (
                        <div key={idx} className="border-t border-slate-100 pt-4 first:border-0 first:pt-0">
                            <div className="flex flex-col mb-4 bg-slate-50 rounded-lg p-3 border border-slate-200">
                                <div className="flex justify-between items-center mb-1.5">
                                    <h5 className="font-bold text-blue-700">{category.name}</h5>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm">
                                        {category.score}/100
                                    </span>
                                </div>
                                {category.sourceCited && (
                                    <div className="flex gap-1.5 items-center text-[11px] text-slate-500 font-medium tracking-wide">
                                        <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                                        <span className="uppercase">Source: </span>
                                        <span className="text-slate-600 italic">&quot;{category.sourceCited}&quot;</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-6 px-1">
                                {/* Successes */}
                                {category.good.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4" /> Strong Aspects
                                        </div>
                                        {category.good.map((item, gIdx) => (
                                            <div key={gIdx} className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-slate-700 text-sm leading-relaxed flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Market Feedback / Actionable Improvements */}
                                {category.improvements && category.improvements.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-1 flex items-center gap-1.5">
                                            <AlertCircle className="w-4 h-4" /> Actionable Fixes (Do&apos;s &amp; Don&apos;ts)
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {category.improvements.map((item, iIdx) => (
                                                <div key={iIdx} className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col relative group">
                                                    {/* Original (Don't) */}
                                                    <div className="p-4 bg-rose-50 border-b border-rose-100 relative">
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-400"></div>
                                                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1 block">What you wrote (Avoid)</span>
                                                        <p className="text-sm text-slate-600 italic font-medium">&quot;{item.originalText || "Generic statement"}&quot;</p>
                                                    </div>

                                                    {/* Recommended (Do) */}
                                                    <div className="p-4 bg-emerald-50 flex-1 relative">
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
                                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1 block flex items-center gap-1.5">
                                                            Gold Standard Rewrite <CheckCircle2 className="w-3 h-3" />
                                                        </span>
                                                        <p className="text-sm font-bold text-slate-900 mb-3">&quot;{item.recommendedText || "Suggested improvement"}&quot;</p>

                                                        {item.reasoning && (
                                                            <div className="bg-white rounded-lg p-2.5 flex items-start gap-2 border border-slate-200">
                                                                <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                                                                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{item.reasoning}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
