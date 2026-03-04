"use client";

import { useCvContext } from "@/context/CvContext";
import { useRouter } from "next/navigation";
import { Database, FileText, Trash2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
    const { cvs, deleteCv, isLoaded } = useCvContext();
    const router = useRouter();

    return (
        <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-500/30">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.push('/')} className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-slate-800 border border-slate-200">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Database className="w-8 h-8 text-blue-500" />
                            Your Dashboard
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">Manage and review your CV analysis reports.</p>
                    </div>
                </div>

                {!isLoaded ? (
                    <div className="text-center p-12 text-slate-500">Loading your documents...</div>
                ) : cvs.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                        <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No documents found</h3>
                        <p className="text-slate-500 mb-6 font-medium">You haven&apos;t uploaded any resumes yet.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-full transition-colors inline-block"
                        >
                            Upload a Resume
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {cvs.map(cv => (
                            <div key={cv.id} className="group bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 rounded-2xl p-6 transition-all flex flex-col relative overflow-hidden cursor-pointer" onClick={() => router.push(`/score/${cv.id}`)}>
                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className="flex items-center gap-4 w-full pr-8">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100/50">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-800 line-clamp-2 text-sm leading-tight">{cv.fileName}</h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10 mt-auto pt-4">
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Date</span>
                                        <span className="text-xs font-semibold text-slate-700">
                                            {new Date(cv.uploadDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>

                                    {cv.analysisData?.score ? (
                                        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-center justify-between">
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">Score</span>
                                            <span className="text-sm font-black text-emerald-700">
                                                {cv.analysisData.score} / 100
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 flex items-center justify-between">
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600">Status</span>
                                            <span className="text-sm font-black text-amber-700">Pending</span>
                                        </div>
                                    )}
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Are you sure you want to permanently delete this document and its associated analysis?')) {
                                            deleteCv(cv.id);
                                        }
                                    }}
                                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-20"
                                    title="Delete Report"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
