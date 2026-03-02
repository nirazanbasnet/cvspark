"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCvContext } from "@/context/CvContext";
import { ArrowLeft, ArrowRight, Loader2, RefreshCw } from "lucide-react";
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
    const [activeTab, setActiveTab] = useState<'score' | 'jobs'>('score');

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
            {/* Header */}
            <header className="flex-none h-16 border-b border-white/5 bg-neutral-900/50 px-6 flex items-center justify-between z-50">
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
                        className="bg-transparent border border-white/20 text-neutral-300 font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isReanalyzing ? <Loader2 className="w-4 h-4 animate-spin text-rose-500" /> : <RefreshCw className="w-4 h-4 text-rose-500" />}
                        {isReanalyzing ? "Analyzing..." : "Re-Analyze Score"}
                    </button>
                    <SignedIn>
                        <button
                            onClick={() => router.push(`/builder?id=${cv.id}`)}
                            className="bg-rose-500 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-rose-600 transition-colors shadow-sm"
                        >
                            Edit CV in Builder <ArrowRight className="w-4 h-4" />
                        </button>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal" signUpFallbackRedirectUrl={`/builder?id=${cv.id}`}>
                            <button className="bg-rose-500 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-rose-600 transition-colors shadow-sm">
                                Login to Edit CV <ArrowRight className="w-4 h-4" />
                            </button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </header>

            {/* Split UI */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                {/* Left Pane - Resume Viewer (Replaces old Dashboard) */}
                <div className="w-full lg:w-1/2 h-full overflow-y-auto p-6 md:p-10 custom-scrollbar pb-32 bg-black/40">
                    <ResumeViewer cvData={cv.cvData} />
                </div>

                {/* Right Pane - Content */}
                <div className="w-full lg:w-1/2 h-full bg-neutral-950 border-l border-white/5 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-10 relative overflow-y-auto p-6 md:p-10 custom-scrollbar flex items-start justify-center pt-8 pb-32">
                    <div className="w-full flex flex-col gap-6">
                        <div className="flex space-x-6 border-b border-white/10 w-full px-2">
                            <button
                                onClick={() => setActiveTab('score')}
                                className={`pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'score'
                                    ? 'border-rose-500 text-rose-400'
                                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                                    }`}
                            >
                                Readiness Score
                            </button>
                            <button
                                onClick={() => setActiveTab('jobs')}
                                className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'jobs'
                                    ? 'border-rose-500 text-rose-400'
                                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                                    }`}
                            >
                                Job Matches
                                <span className="bg-rose-500/20 text-rose-400 py-0.5 px-2 rounded-full text-[10px] font-black tracking-wider">NEW</span>
                            </button>
                        </div>

                        {activeTab === 'score' ? (
                            <MarketReadinessScore analysisData={cv.analysisData} />
                        ) : (
                            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                                <JobMatches
                                    resumeText={`${cv.cvData.basics.label} ${cv.cvData.basics.summary}\n\nExperience: ${cv.cvData.experience.map(e => `${e.role} at ${e.company}`).join(', ')}\n\nSkills: ${Object.values(cv.cvData.skills || {}).flat().join(', ')}`}
                                    primaryRole={cv.cvData.basics.label || cv.cvData.experience?.[0]?.role}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
