"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCvContext } from "@/context/CvContext";
import { ArrowLeft, ArrowRight, Loader2, RefreshCw, FileText, LayoutDashboard, Briefcase, ChevronRight, Trash2 } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ResumeViewer } from "@/components/dashboard/ResumeViewer";
import { MarketReadinessScore } from "@/components/dashboard/MarketReadinessScore";
import { JobMatches } from "@/components/dashboard/JobMatches";

export default function ScoreDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const { cvs, isLoaded, getPdfBlob, updateFullCv } = useCvContext();
    const [isReanalyzing, setIsReanalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState<'score' | 'jobs' | 'resume'>('score');

    const cv = cvs.find(c => c.id === id);

    const handleReanalyze = async () => {
        if (!cv) return;

        try {
            setIsReanalyzing(true);
            const blob = await getPdfBlob(cv.id);
            if (!blob) {
                alert("Original PDF file not found. Please upload it again from the dashboard.");
                return;
            }

            const formData = new FormData();
            formData.append('file', blob, cv.fileName);

            const res = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to analyze document");
            }

            const result = await res.json();

            let finalAnalysis = result.analysis;
            let finalCvData = result.extractedCv;

            // Handle Image-Based PDFs requiring client-side OCR
            if (result.requiresOcr) {
                // Dynamically import OCR logic to avoid bloating bundle
                const { extractOcrTextFromPdf } = await import("@/lib/ocr");
                // Convert blob to File to match function signature
                const fileObj = new File([blob], cv.fileName, { type: 'application/pdf' });
                const extractedText = await extractOcrTextFromPdf(fileObj);

                if (!extractedText.trim()) throw new Error("OCR Failed: Could not extract readable text from the image.");

                const textFormData = new FormData();
                textFormData.append("text", extractedText);

                const textRes = await fetch("/api/analyze", {
                    method: "POST",
                    body: textFormData,
                });

                const textData = await textRes.json();
                if (!textRes.ok || textData.error) throw new Error(textData.error || "Failed to analyze OCR text.");

                if (textData.analysis && textData.extractedCv) {
                    finalAnalysis = textData.analysis;
                    finalCvData = textData.extractedCv;
                } else {
                    throw new Error("Invalid response format from server.");
                }
            } else if (!finalAnalysis || !finalCvData) {
                throw new Error("Invalid response format from server.");
            }

            // Overwrite the existing scan data
            await updateFullCv(cv.id, finalAnalysis, finalCvData);

        } catch (err: any) {
            console.error("Reanalysis failed:", err);
            alert("Error during re-analysis: " + err.message);
        } finally {
            setIsReanalyzing(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!cv) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-bold mb-4">CV Not Found</h2>
                <button onClick={() => router.push("/")} className="text-rose-400 hover:text-rose-300 font-medium">
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col h-screen overflow-hidden">
            {/* Topbar */}
            <header className="flex-none h-16 border-b border-white/5 bg-neutral-900/50 px-6 pr-14 flex items-center justify-between z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/")}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-neutral-400"
                        aria-label="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white/5 border border-white/10 rounded text-neutral-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-white leading-tight">{cv.fileName}</h1>
                            <p className="text-[11px] text-neutral-500">Last updated: {new Date(cv.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReanalyze}
                        disabled={isReanalyzing}
                        className="bg-transparent border border-white/20 text-neutral-300 font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hidden md:flex"
                    >
                        {isReanalyzing ? <Loader2 className="w-4 h-4 animate-spin text-rose-500" /> : <RefreshCw className="w-4 h-4 text-rose-500" />}
                        {isReanalyzing ? "Analyzing..." : "Re-Analyze Score"}
                    </button>
                    <SignedIn>
                        <button
                            onClick={() => router.push(`/builder?id=${cv.id}`)}
                            className="bg-rose-500 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-rose-600 transition-colors shadow-sm"
                        >
                            Edit CV <span className="hidden md:inline">in Builder</span> <ArrowRight className="w-4 h-4" />
                        </button>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal" signUpFallbackRedirectUrl={`/builder?id=${cv.id}`}>
                            <button className="bg-rose-500 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-rose-600 transition-colors shadow-sm">
                                Login <span className="hidden md:inline">to Edit CV</span> <ArrowRight className="w-4 h-4" />
                            </button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </header>

            {/* Dashboard Layout */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Left Sidebar Menu */}
                <aside className="w-72 border-r border-white/5 bg-neutral-900/30 flex-col hidden md:flex z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
                    <div className="p-4 flex flex-col gap-2 mt-4">
                        <button onClick={() => setActiveTab('score')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'score' ? 'bg-rose-500/10 text-rose-400' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'}`}>
                            <LayoutDashboard className="w-5 h-5" /> Readiness Score
                        </button>
                        <button onClick={() => setActiveTab('jobs')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'jobs' ? 'bg-rose-500/10 text-rose-400' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'}`}>
                            <Briefcase className="w-5 h-5" /> Job Matches <span className="ml-auto bg-rose-500/20 text-rose-400 py-0.5 px-2 rounded-full text-[10px] font-black tracking-wider">NEW</span>
                        </button>
                        <button onClick={() => setActiveTab('resume')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'resume' ? 'bg-rose-500/10 text-rose-400' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'}`}>
                            <FileText className="w-5 h-5" /> Original Resume
                        </button>
                    </div>

                    {/* Recent Documents Section */}
                    {cvs.length > 0 && (
                        <div className="mt-8 flex-1 flex flex-col overflow-hidden">
                            <h3 className="px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">Recent Documents</h3>
                            <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar flex flex-col gap-2">
                                {cvs.map(recentCv => (
                                    <div
                                        key={recentCv.id}
                                        onClick={() => router.push(`/score/${recentCv.id}`)}
                                        className={`bg-white/5 border px-4 py-3 rounded-xl cursor-pointer transition-all group relative overflow-hidden flex flex-col gap-1 ${recentCv.id === id ? 'border-rose-500/40 bg-rose-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/10'}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <h4 className={`text-sm font-semibold truncate pr-6 ${recentCv.id === id ? 'text-rose-400' : 'text-white group-hover:text-rose-300'}`}>
                                                {recentCv.fileName}
                                            </h4>
                                            <ChevronRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 ${recentCv.id === id ? 'text-rose-400' : 'text-neutral-500'}`} />
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-[11px] text-neutral-400">
                                                {new Date(recentCv.uploadDate).toLocaleDateString()}
                                            </p>
                                            {recentCv.analysisData?.score && (
                                                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                                    {recentCv.analysisData.score}/100
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar bg-neutral-950/80">
                    <div className="h-full w-full flex flex-col pt-2 pb-32">

                        {/* Mobile Tab Nav (Hidden on md+) */}
                        <div className="flex md:hidden space-x-6 mb-8 overflow-x-auto pb-2 border-b border-white/10 flex-nowrap hide-scrollbar">
                            <button onClick={() => setActiveTab('score')} className={`whitespace-nowrap pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'score' ? 'border-rose-500 text-rose-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}>Readiness Score</button>
                            <button onClick={() => setActiveTab('jobs')} className={`whitespace-nowrap flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'jobs' ? 'border-rose-500 text-rose-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}>Job Matches <span className="bg-rose-500/20 text-rose-400 py-0.5 px-1.5 rounded-full text-[9px] font-black tracking-wider">NEW</span></button>
                            <button onClick={() => setActiveTab('resume')} className={`whitespace-nowrap pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'resume' ? 'border-rose-500 text-rose-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}>Original Resume</button>
                        </div>

                        <div className="flex-1 w-full animate-in fade-in zoom-in-95 duration-300">
                            {activeTab === 'score' && (
                                <MarketReadinessScore analysisData={cv.analysisData} />
                            )}

                            {activeTab === 'jobs' && (
                                <div className="bg-white/5 rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl">
                                    <JobMatches
                                        resumeText={`${cv.cvData.basics.label} ${cv.cvData.basics.summary}\n\nExperience: ${cv.cvData.experience.map(e => `${e.role} at ${e.company}`).join(', ')}\n\nSkills: ${Object.values(cv.cvData.skills || {}).flat().join(', ')}`}
                                        primaryRole={cv.cvData.basics.label || cv.cvData.experience?.[0]?.role}
                                    />
                                </div>
                            )}

                            {activeTab === 'resume' && (
                                <div className="h-full min-h-[80vh] bg-black/40 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                                    <ResumeViewer cvData={cv.cvData} />
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
