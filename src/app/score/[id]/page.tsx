"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCvContext } from "@/context/CvContext";
import { ArrowLeft, ArrowRight, Loader2, RefreshCw, FileText, LayoutDashboard } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ResumeViewer } from "@/components/dashboard/ResumeViewer";
import { MarketReadinessScore } from "@/components/dashboard/MarketReadinessScore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { JobMatches } from "@/components/dashboard/JobMatches";
import { PartyPopper, Briefcase, Download } from "lucide-react";

export default function ScoreDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const { cvs, isLoaded, getPdfBlob, updateFullCv } = useCvContext();
    const [isReanalyzing, setIsReanalyzing] = useState(false);

    // Right panel tabs
    const [rightTab, setRightTab] = useState<'original' | 'parsed'>('original');

    // PDF blob URL
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const cv = cvs.find(c => c.id === id);

    // Celebratory Modal State
    const [showEurekaModal, setShowEurekaModal] = useState(false);
    const [hasJustSaved, setHasJustSaved] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('justSaved') === 'true') {
                setShowEurekaModal(true);
                setHasJustSaved(true);
                const url = new URL(window.location.href);
                url.searchParams.delete('justSaved');
                window.history.replaceState({}, '', url);
            }
        }
    }, [id]);

    useEffect(() => {
        if (cv) {
            getPdfBlob(cv.id).then((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    setPdfUrl(url);
                }
            });
        }
    }, [cv?.id, cv, getPdfBlob]);

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

            if (result.requiresOcr) {
                const { extractOcrTextFromPdf } = await import("@/lib/ocr");
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

            await updateFullCv(cv.id, finalAnalysis, finalCvData);

        } catch (err: any) {
            console.error("Reanalysis failed:", err);
            alert("Error during re-analysis: " + err.message);
        } finally {
            setIsReanalyzing(false);
        }
    };

    if (!isLoaded) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (!cv) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900"><h2 className="text-2xl font-bold mb-4">CV Not Found</h2><button onClick={() => router.push("/")} className="text-blue-600 hover:text-blue-500 font-medium">Return to Dashboard</button></div>;

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col h-screen overflow-hidden">
            {/* Topbar: Apply Light Theme */}
            <header className="flex-none h-16 border-b border-slate-200 bg-white px-6 pr-14 flex items-center justify-between z-50 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/dashboard")} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"><ArrowLeft className="w-5 h-5" /></button>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-slate-100 border border-slate-200 rounded text-slate-600"><FileText className="w-4 h-4" /></div>
                        <div>
                            <h1 className="text-sm font-bold text-slate-900 leading-tight">{cv.fileName}</h1>
                            <p className="text-[11px] text-slate-500">Last updated: {new Date(cv.uploadDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {hasJustSaved && (
                        <button onClick={() => setShowEurekaModal(true)} className="animate-[pulse_2s_ease-in-out_3] bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-100 transition-colors shadow-sm">
                            <Briefcase className="w-4 h-4" />
                            Job Matches
                        </button>
                    )}
                    <button onClick={handleReanalyze} disabled={isReanalyzing} className="bg-white border border-slate-200 text-slate-700 font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors disabled:opacity-50">
                        {isReanalyzing ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <RefreshCw className="w-4 h-4 text-blue-600" />}
                        {isReanalyzing ? "Analyzing..." : "Re-Analyze Score"}
                    </button>
                    <SignedIn>
                        <button onClick={() => router.push(`/builder?id=${cv.id}`)} className="bg-blue-600 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-colors">
                            Edit CV <span className="hidden md:inline">in Builder</span> <ArrowRight className="w-4 h-4" />
                        </button>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal" signUpFallbackRedirectUrl={`/builder?id=${cv.id}`}>
                            <button className="bg-blue-600 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
                                Login <span className="hidden md:inline">to Edit CV</span> <ArrowRight className="w-4 h-4" />
                            </button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </header>

            {/* Split Layout */}
            <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
                {/* Left Side: Score Details */}
                <div className="w-full md:w-1/2 border-r border-slate-200 overflow-y-auto p-6 md:p-8 bg-slate-50 custom-scrollbar relative">
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-3"><LayoutDashboard className="w-6 h-6 text-blue-600" /> Readiness Score</h2>
                        <MarketReadinessScore analysisData={cv.analysisData} />
                    </div>
                </div>

                {/* Right Side: Tabbed Viewer */}
                <div className="w-full md:w-1/2 flex flex-col bg-slate-100/50 relative overflow-hidden">
                    <div className="h-14 border-b border-slate-200 bg-white flex px-4 gap-4 flex-none items-end justify-between">
                        <div className="flex gap-4">
                            <button onClick={() => setRightTab('original')} className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${rightTab === 'original' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Original Upload</button>
                            <button onClick={() => setRightTab('parsed')} className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${rightTab === 'parsed' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>App Updated CV</button>
                        </div>
                        {rightTab === 'parsed' && (
                            <button
                                onClick={async () => {
                                    const element = document.getElementById('cv-pdf-content');
                                    if (!element) return;

                                    // Fetch and sanitize all styles asynchronously before cloning
                                    let sanitizedCss = '';
                                    try {
                                        const styleTags = Array.from(document.querySelectorAll('style'));
                                        for (const tag of styleTags) {
                                            sanitizedCss += tag.innerHTML + '\\n';
                                        }

                                        const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
                                        for (const link of linkTags) {
                                            const href = (link as HTMLLinkElement).href;
                                            if (href) {
                                                const res = await fetch(href);
                                                if (res.ok) {
                                                    sanitizedCss += await res.text() + '\\n';
                                                }
                                            }
                                        }
                                        sanitizedCss = sanitizedCss.replace(/\boklch\b/gi, 'rgb').replace(/\blab\b/gi, 'rgb').replace(/\boklab\b/gi, 'rgb').replace(/\blch\b/gi, 'rgb');
                                    } catch (e) {
                                        console.warn("Failed to fetch some stylesheets", e);
                                    }

                                    const opt = {
                                        margin: 0,
                                        filename: `${(cv?.cvData?.basics?.name || 'document').toLowerCase().replace(/\\s+/g, '_')}_cvspark.pdf`,
                                        image: { type: 'jpeg', quality: 0.98 },
                                        html2canvas: {
                                            scale: 2,
                                            useCORS: true,
                                            onclone: (doc: any) => {
                                                // Remove original tags that could crash html2canvas
                                                const elementsToRemove = doc.querySelectorAll('style, link[rel="stylesheet"]');
                                                elementsToRemove.forEach((e: any) => e.remove());

                                                // Aggressively strip any inline styles using new color functions
                                                const allElements = doc.querySelectorAll('*');
                                                allElements.forEach((el: any) => {
                                                    if (el.style && el.style.cssText) {
                                                        let css = el.style.cssText;
                                                        if (css.includes('oklch') || css.includes('lab') || css.includes('lch')) {
                                                            el.style.cssText = css
                                                                .replace(/\boklch\b/gi, 'rgb')
                                                                .replace(/\blab\b/gi, 'rgb')
                                                                .replace(/\boklab\b/gi, 'rgb')
                                                                .replace(/\blch\b/gi, 'rgb');
                                                        }
                                                    }
                                                });

                                                // Inject the monolithic, sanitized CSS
                                                const baseStyle = doc.createElement('style');
                                                baseStyle.innerHTML = sanitizedCss;
                                                doc.head.appendChild(baseStyle);

                                                // Inject explict color fallbacks for our specific classes
                                                const customStyle = doc.createElement('style');
                                                customStyle.innerHTML =
                                                    ".text-slate-900 {color: #0f172a !important; }\\n" +
                                                    ".text-slate-700 {color: #334155 !important; }\\n" +
                                                    ".text-slate-500 {color: #64748b !important; }\\n" +
                                                    ".text-blue-600 {color: #2563eb !important; }\\n" +
                                                    ".text-blue-700 {color: #1d4ed8 !important; }\\n" +
                                                    ".text-blue-500 {color: #3b82f6 !important; }\\n" +
                                                    ".text-white {color: #ffffff !important; }\\n" +
                                                    ".bg-white {background-color: #ffffff !important; }\\n" +
                                                    ".bg-blue-600 {background-color: #2563eb !important; }\\n" +
                                                    ".bg-slate-50 {background-color: #f8fafc !important; }\\n" +
                                                    ".bg-slate-100 {background-color: #f1f5f9 !important; }\\n" +
                                                    ".border-slate-200 {border-color: #e2e8f0 !important; }\\n" +
                                                    ".border-slate-300 {border-color: #cbd5e1 !important; }\\n" +
                                                    ".border-blue-400 {border-color: #60a5fa !important; }";
                                                doc.head.appendChild(customStyle);
                                            }
                                        },
                                        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                                    };

                                    const html2pdf = (await import('html2pdf.js')).default as any;
                                    html2pdf().set(opt).from(element).save();
                                }}
                                className="mb-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <Download className="w-3.5 h-3.5" /> Download PDF
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                        <div className="h-full min-h-[80vh] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
                            {rightTab === 'original' && (
                                pdfUrl ? (
                                    <iframe src={`${pdfUrl}#view=FitH`} className="absolute inset-0 w-full h-full rounded-xl" title="Original CV Viewer"></iframe>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
                                )
                            )}
                            {rightTab === 'parsed' && (
                                <div className="absolute inset-0 w-full h-full overflow-y-auto rounded-xl bg-white p-4">
                                    <div className="transform origin-top lg:scale-95 mx-auto max-w-[816px] transition-transform duration-300">
                                        <div id="cv-pdf-content" className="bg-white">
                                            <ResumeViewer cvData={cv?.cvData} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Eureka Modal */}
            <Dialog open={showEurekaModal} onOpenChange={setShowEurekaModal}>
                <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-y-auto bg-slate-50 border-slate-200 shadow-2xl rounded-2xl p-0">
                    <DialogHeader className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-10 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-blue-100">
                            <PartyPopper className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">
                            CV Updated Successfully! Here are your Job Matches.
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium max-w-lg mx-auto mt-2">
                            We used your updated profile to find jobs uniquely suited for you. Check out your personalized matches below!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="px-6">
                        {cv?.cvData && (
                            <JobMatches
                                resumeText={cv.cvData.basics?.summary || "Software Engineer"}
                                primaryRole={cv.cvData.basics?.label || cv.analysisData?.roleCategory || "Software Engineer"}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </main >
    );
}
