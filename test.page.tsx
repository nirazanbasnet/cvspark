"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCvContext } from "@/context/CvContext";
import { ArrowLeft, ArrowRight, Loader2, RefreshCw, FileText, LayoutDashboard } from "lucide-react";
import { SignedIn } from "@clerk/nextjs";
import { ResumeViewer } from "@/components/dashboard/ResumeViewer";
import { MarketReadinessScore } from "@/components/dashboard/MarketReadinessScore";

export default function ScoreDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const { cvs, isLoaded, getPdfBlob } = useCvContext();
    const [isReanalyzing] = useState(false);

    // Right panel tabs
    const [rightTab, setRightTab] = useState<'original' | 'parsed'>('original');

    // PDF blob URL
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const cv = cvs.find(c => c.id === id);

    useEffect(() => {
        if (cv) {
            getPdfBlob(cv.id).then((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    setPdfUrl(url);
                }
            });
        }
        return () => {
            // Cleanup if needed
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cv?.id]);

    const handleReanalyze = async () => { /* ... existing logic ... */ };

    if (!isLoaded) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (!cv) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900"><h2 className="text-2xl font-bold mb-4">CV Not Found</h2><button onClick={() => router.push("/")} className="text-blue-600 hover:text-blue-500 font-medium">Return to Dashboard</button></div>;

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col h-screen overflow-hidden">
            {/* Topbar: Apply Light Theme */}
            <header className="flex-none h-16 border-b border-slate-200 bg-white px-6 pr-14 flex items-center justify-between z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/")} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"><ArrowLeft className="w-5 h-5" /></button>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-slate-100 border border-slate-200 rounded text-slate-600"><FileText className="w-4 h-4" /></div>
                        <div>
                            <h1 className="text-sm font-bold text-slate-900 leading-tight">{cv.fileName}</h1>
                            <p className="text-[11px] text-slate-500">Last updated: {new Date(cv.uploadDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={handleReanalyze} disabled={isReanalyzing} className="bg-white border border-slate-200 text-slate-700 font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors disabled:opacity-50">
                        {isReanalyzing ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <RefreshCw className="w-4 h-4 text-blue-600" />}
                        {isReanalyzing ? "Analyzing..." : "Re-Analyze Score"}
                    </button>
                    <SignedIn>
                        <button onClick={() => router.push(`/builder?id=${cv.id}`)} className="bg-blue-600 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm">
                            Edit CV <span className="hidden md:inline">in Builder</span> <ArrowRight className="w-4 h-4" />
                        </button>
                    </SignedIn>
                </div>
            </header>

            {/* Split Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Score Details */}
                <div className="w-1/2 border-r border-slate-200 overflow-y-auto p-6 md:p-8 bg-slate-50 custom-scrollbar relative">
                    <div className="max-w-3xl mx-auto pb-32">
                        <h2 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-3"><LayoutDashboard className="w-6 h-6 text-blue-600" /> Readiness Score</h2>
                        {/* We will need to adapt MarketReadinessScore to light theme later */}
                        <MarketReadinessScore analysisData={cv.analysisData} />
                    </div>
                </div>

                {/* Right Side: Tabbed Viewer */}
                <div className="w-1/2 flex flex-col bg-slate-100/50 relative overflow-hidden">
                    <div className="h-14 border-b border-slate-200 bg-white flex px-4 gap-4 flex-none items-end">
                        <button onClick={() => setRightTab('original')} className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${rightTab === 'original' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Original CV</button>
                        <button onClick={() => setRightTab('parsed')} className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${rightTab === 'parsed' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Parsed CV</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div className="h-full min-h-[80vh] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            {rightTab === 'original' && (
                                pdfUrl ? (
                                    <iframe src={`${pdfUrl}#toolbar=0`} className="w-full flex-1 rounded-xl" title="Original CV Viewer"></iframe>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
                                )
                            )}
                            {rightTab === 'parsed' && (
                                <div className="p-4 bg-slate-900 h-full overflow-y-auto rounded-xl">
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
