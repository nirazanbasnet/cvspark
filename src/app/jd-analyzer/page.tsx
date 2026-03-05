"use client";

import { useState } from "react";
import { useCvContext } from "@/context/CvContext";
import Navbar from "@/components/Navbar";
import { Loader2, ArrowLeft, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface JDResult {
    skillMatchPercentage: number;
    gapAnalysis: {
        missingSkill: string;
        importance: "Critical" | "High" | "Medium" | "Low";
        recommendation: string;
    }[];
    recommendation: string;
    summary: string;
}

export default function JDAnalyzerPage() {
    const { cvs, isLoaded } = useCvContext();
    const router = useRouter();

    const [selectedCvId, setSelectedCvId] = useState<string>("");
    const [jdText, setJdText] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<JDResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!selectedCvId) {
            setError("Please select a CV.");
            return;
        }
        if (!jdText.trim()) {
            setError("Please paste a Job Description.");
            return;
        }

        const cv = cvs.find(c => c.id === selectedCvId);
        if (!cv) {
            setError("CV not found.");
            return;
        }

        const cvText = cv.cvData?.basics?.summary + "\n" +
            cv.cvData?.experience?.map(e => `${e.role} at ${e.company}: ${e.bullets?.join("; ")}`).join("\n") + "\n" +
            "Skills: " + Object.values(cv.cvData?.skills || {}).flat().join(", ");


        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/jd-analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cvText, jdText }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to analyze.");
            }

            const data = await res.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || "An error occurred during analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getRecommendationColor = (rec: string) => {
        if (rec === "Strong Apply") return "text-emerald-700 bg-emerald-100 border-emerald-300";
        if (rec === "Apply") return "text-blue-700 bg-blue-100 border-blue-300";
        if (rec === "Stretch") return "text-amber-700 bg-amber-100 border-amber-300";
        return "text-rose-700 bg-rose-100 border-rose-300";
    };

    if (!isLoaded) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    }

    return (
        <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-500/30">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.push('/dashboard')} className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-slate-800 border border-slate-200">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Target className="w-8 h-8 text-blue-500" />
                            JD Analyzer
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">Compare your CV against a specific Job Description.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">1. Select your App CV Profile</label>
                            <p className="text-xs text-slate-500 mb-3">The analyzer securely streams the <b>updated CV content from your CV Spark builder</b> (not your original PDF upload).</p>
                            <Select value={selectedCvId} onValueChange={setSelectedCvId}>
                                <SelectTrigger className="w-full border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <SelectValue placeholder="Choose an updated CV to analyze" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cvs.filter(cv => !!cv.lastUpdated).length === 0 && (
                                        <SelectItem value="none" disabled>No edited CVs found. Please edit & save a CV first.</SelectItem>
                                    )}
                                    {cvs.filter(cv => !!cv.lastUpdated).map(cv => (
                                        <SelectItem key={cv.id} value={cv.id}>{cv.cvData?.basics?.name || "CV"} - {cv.fileName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <label className="block text-sm font-bold text-slate-700 mb-2">2. Paste Job Description</label>
                            <textarea
                                value={jdText}
                                onChange={(e) => setJdText(e.target.value)}
                                placeholder="Paste the full job description here..."
                                className="w-full flex-1 min-h-[300px] border border-slate-300 bg-slate-50 p-4 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent custom-scrollbar transition-all resize-y"
                            />
                        </div>

                        {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {error}</div>}

                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                        >
                            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
                            {isAnalyzing ? "Analyzing Fit..." : "Analyze Fit"}
                        </button>
                    </div>

                    {/* Results Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800 border-b border-slate-100 pb-4">
                            Analysis Results
                        </h2>

                        {!result && !isAnalyzing && (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center rounded-xl bg-slate-50 border border-slate-100 border-dashed">
                                <Target className="w-12 h-12 mb-4 text-slate-300" />
                                <p className="font-medium text-slate-500">Paste a JD and click Analyze to see your fit.</p>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="flex-1 flex flex-col items-center justify-center text-blue-500 p-12 text-center">
                                <Loader2 className="w-12 h-12 mb-4 animate-spin" />
                                <p className="font-medium">AI is comparing your profile...</p>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Top Metrics */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-blue-50 opacity-50 pointer-events-none"></div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 relative z-10">Skill Match</p>
                                        <div className="flex items-end gap-2 relative z-10 mb-2">
                                            <span className="text-4xl font-black text-blue-600">{result.skillMatchPercentage}%</span>
                                        </div>
                                        <Progress value={result.skillMatchPercentage} className="h-2 bg-blue-100 [&>div]:bg-blue-600 relative z-10" />
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center relative overflow-hidden">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 relative z-10">Verdict</p>
                                        <div className={`inline-flex px-3 py-1.5 rounded-lg border text-sm font-bold w-fit ${getRecommendationColor(result.recommendation)}`}>
                                            {result.recommendation}
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 text-slate-700 text-sm leading-relaxed">
                                    <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Summary</h4>
                                    {result.summary}
                                </div>

                                {/* Gap Analysis */}
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Gap Analysis</h4>
                                    {result.gapAnalysis && result.gapAnalysis.length > 0 ? (
                                        <div className="space-y-3">
                                            {result.gapAnalysis.map((gap, idx) => (
                                                <div key={idx} className="bg-white border text-sm border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                                                    {/* Importance indicator bar */}
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${gap.importance === "Critical" ? "bg-rose-500" :
                                                        gap.importance === "High" ? "bg-orange-400" :
                                                            gap.importance === "Medium" ? "bg-amber-400" : "bg-emerald-400"
                                                        }`}></div>

                                                    <div className="flex justify-between items-start mb-2 pl-2">
                                                        <span className="font-bold text-slate-800">{gap.missingSkill}</span>
                                                        <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${gap.importance === "Critical" ? "text-rose-700 bg-rose-100" :
                                                            gap.importance === "High" ? "text-orange-700 bg-orange-100" :
                                                                gap.importance === "Medium" ? "text-amber-700 bg-amber-100" : "text-emerald-700 bg-emerald-100"
                                                            }`}>
                                                            {gap.importance}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600 pl-2 leading-relaxed">&quot;{gap.recommendation}&quot;</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center p-6 bg-emerald-50 rounded-xl text-emerald-700 font-medium border border-emerald-100 flex items-center justify-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            No significant skill gaps found!
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
