"use client";

import { useState, useEffect, Suspense } from "react";
import { ResumePreview } from "@/components/export/ResumePreview";
import {
    Compass,
    Briefcase,
    FileCode2,
    ArrowLeft,
    Download,
    Loader2,
    User,
    GraduationCap,
    Wrench,
    Save,
    Eye,
    EyeOff,
    FilePlus2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCvContext } from "@/context/CvContext";
import { useSearchParams } from "next/navigation";
import { GoldStandardResume } from "@/types/resume";

// We will import these once they are created, stubbing them out for now to ensure compilation.
import { BasicsEditor } from "@/components/builder/BasicsEditor";
import { ExperienceEditor } from "@/components/builder/ExperienceEditor";
import { EducationEditor } from "@/components/builder/EducationEditor";
import { SkillsEditor } from "@/components/builder/SkillsEditor";
import { ProjectsEditor } from "@/components/builder/ProjectsEditor";
import { CustomSectionsEditor } from "@/components/builder/CustomSectionsEditor";

function BuilderContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const { cvs, updateCvData, getPdfBlob } = useCvContext();
    const cv = cvs.find(c => c.id === id);

    // Core Live State Object
    const [liveCvData, setLiveCvData] = useState<GoldStandardResume | null>(null);

    const [activeTab, setActiveTab] = useState("basics");
    const [isSaving, setIsSaving] = useState(false);
    const [originalPdfUrl, setOriginalPdfUrl] = useState<string | null>(null);
    const [showOriginal, setShowOriginal] = useState(false);

    // Hydrate the live editor state from the DB when the component mounts
    useEffect(() => {
        if (cv?.cvData && !liveCvData) {
            // Deep copy to break reference links and ensure React detects state mutations properly
            setLiveCvData(JSON.parse(JSON.stringify(cv.cvData)));
        }
    }, [cv, liveCvData]);

    // Load the massive Original PDF from IndexedDB seamlessly
    useEffect(() => {
        async function fetchPdf() {
            if (!cv || originalPdfUrl) return;
            const blob = await getPdfBlob(cv.id);
            if (blob) {
                setOriginalPdfUrl(URL.createObjectURL(blob));
            }
        }
        fetchPdf();
    }, [cv, originalPdfUrl, getPdfBlob]);

    const handleSave = async () => {
        if (!cv || !liveCvData) return;
        try {
            setIsSaving(true);
            await updateCvData(cv.id, liveCvData);
            // Optionally could pop a success toast here
        } catch (err) {
            console.error("Failed to save CV:", err);
            alert("Failed to save changes.");
        } finally {
            setTimeout(() => setIsSaving(false), 500); // UI visual delay
        }
    };

    if (!cv || !liveCvData) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
                <Compass className="w-12 h-12 text-rose-500 mb-4 animate-pulse" />
                <h1 className="text-2xl font-bold mb-2">No CV Data Found</h1>
                <p className="text-neutral-400 mb-6">Please analyze a resume on the dashboard first.</p>
                <Link href="/" className="px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
                    Go to Dashboard
                </Link>
            </div>
        );
    }

    const TABS = [
        { id: "basics", icon: User, label: "Basics & Summary" },
        { id: "experience", icon: Briefcase, label: "Experience" },
        { id: "education", icon: GraduationCap, label: "Education" },
        { id: "skills", icon: Wrench, label: "Skills Matrix" },
        { id: "opensource", icon: FileCode2, label: "Open Source" },
        { id: "custom", icon: FilePlus2, label: "Custom Sections" },
    ];

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 bg-black/60 border-r border-white/5 p-6 flex flex-col shrink-0 relative z-20">
                <Link href={`/score/${cv.id}`} className="flex items-center gap-2 text-rose-400 font-bold mb-10 hover:text-white transition-colors cursor-pointer">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Document Sections</h3>
                <nav className="space-y-1.5 flex-1">
                    {TABS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                activeTab === item.id
                                    ? "bg-rose-500/10 text-rose-400 shadow-[inset_2px_0_0_0_#fb7185] border border-rose-500/20"
                                    : "text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent"
                            )}
                        >
                            <item.icon className={cn("w-4 h-4 transition-colors", activeTab === item.id ? "text-rose-400" : "text-neutral-500 group-hover:text-neutral-300")} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full h-11 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/50 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col xl:flex-row h-screen overflow-hidden">

                {/* Left Pane: Specialized Section Editor */}
                <div className="w-full xl:w-1/2 p-6 md:p-8 xl:p-10 overflow-y-auto custom-scrollbar bg-gradient-to-br from-neutral-900 to-black relative">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="max-w-2xl mx-auto relative z-10 pb-32">
                        {activeTab === "basics" && <BasicsEditor liveCvData={liveCvData} setLiveCvData={setLiveCvData} />}
                        {activeTab === "experience" && <ExperienceEditor liveCvData={liveCvData} setLiveCvData={setLiveCvData} />}
                        {activeTab === "education" && <EducationEditor liveCvData={liveCvData} setLiveCvData={setLiveCvData} />}
                        {activeTab === "skills" && <SkillsEditor liveCvData={liveCvData} setLiveCvData={setLiveCvData} />}
                        {activeTab === "opensource" && <ProjectsEditor liveCvData={liveCvData} setLiveCvData={setLiveCvData} />}
                        {activeTab === "custom" && <CustomSectionsEditor liveCvData={liveCvData} setLiveCvData={setLiveCvData} />}
                    </div>
                </div>

                {/* Right Pane: Live ATS PDF Preview AND Original Split Viewer */}
                <div className="w-full xl:w-1/2 bg-neutral-200 overflow-hidden flex flex-col relative border-l border-neutral-800/10">

                    {/* Preview Context Bar */}
                    <div className="h-14 bg-white border-b border-neutral-300 flex items-center justify-between px-4 z-10 shadow-sm shrink-0">
                        <div className="flex items-center gap-2">
                            {originalPdfUrl && (
                                <button
                                    onClick={() => setShowOriginal(!showOriginal)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-colors",
                                        showOriginal
                                            ? "bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200"
                                            : "bg-white text-neutral-600 border border-neutral-300 hover:bg-neutral-100"
                                    )}
                                >
                                    {showOriginal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    {showOriginal ? "Hide Original Upload" : "Compare Source PDF"}
                                </button>
                            )}
                        </div>

                        <button
                            onClick={async () => {
                                const element = document.getElementById('cv-pdf-content');
                                if (!element) return;

                                const opt = {
                                    margin: 0,
                                    filename: `${liveCvData.basics.name.replace(/\s+/g, '_')}_CV.pdf`,
                                    image: { type: 'jpeg', quality: 0.98 },
                                    html2canvas: { scale: 2, useCORS: true },
                                    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                                };

                                // Use dynamic import for html2pdf to prevent SSR window issues
                                const html2pdf = (await import('html2pdf.js')).default as any;
                                html2pdf().set(opt).from(element).save();
                            }}
                            className="px-4 py-1.5 bg-black text-white rounded-md text-xs font-bold flex items-center gap-2 hover:bg-neutral-800 transition-colors shadow-sm"
                        >
                            <Download className="w-3.5 h-3.5" /> Download ATS PDF
                        </button>
                    </div>

                    {/* Preview Render Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative p-8">
                        {showOriginal && originalPdfUrl ? (
                            <iframe
                                src={originalPdfUrl}
                                className="w-full h-[1200px] border border-neutral-300 rounded-sm shadow-xl bg-white"
                                title="Original Uploaded CV"
                            />
                        ) : (
                            <div className="transform origin-top lg:scale-95 mx-auto max-w-[816px] transition-transform duration-300">
                                <div id="cv-pdf-content" className="bg-white">
                                    <ResumePreview cvData={liveCvData} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}

export default function BuilderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
                <Loader2 className="w-12 h-12 text-rose-500 mb-4 animate-spin" />
                <h1 className="text-2xl font-bold mb-2">Loading ATS Interface...</h1>
            </div>
        }>
            <BuilderContent />
        </Suspense>
    );
}
