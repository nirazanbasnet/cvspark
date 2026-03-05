"use client";

import { useCvContext } from "@/context/CvContext";
import { useRouter } from "next/navigation";
import { Database, FileText, Trash2, ArrowLeft, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

                    <div className="ml-auto">
                        <button
                            onClick={() => router.push('/jd-analyzer')}
                            className="bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-3 hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition-all group"
                        >
                            <Target className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            Use JD Analyzer
                        </button>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {cvs.map(cv => {
                            const name = cv.cvData?.basics?.name || cv.fileName.replace(/\\.[^/.]+$/, "");
                            const role = cv.cvData?.basics?.label || cv.analysisData?.roleCategory || 'Role Unknown';
                            const title = `${name} - ${role}`;
                            const isLatest = !!cv.lastUpdated;

                            return (
                                <div key={cv.id} className="group bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 rounded-2xl p-6 transition-all flex flex-col relative overflow-hidden cursor-pointer" onClick={() => router.push(`/score/${cv.id}`)}>
                                    <div className="flex items-start justify-between mb-4 relative z-10">
                                        <div className="flex items-start gap-4 w-full pr-8">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100/50 mt-1">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-800 line-clamp-2 text-base leading-tight mb-2" title={title}>{title}</h3>
                                                <div className="flex items-center gap-2">
                                                    {isLatest ? (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-blue-100 text-blue-700">Latest</span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-600">Draft</span>
                                                    )}
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        Updated {new Date(cv.lastUpdated || cv.uploadDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 relative z-10 mt-auto pt-4 border-t border-slate-100">
                                        {cv.analysisData?.score ? (
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-slate-500">Readiness Score</span>
                                                <span className="text-sm font-black text-emerald-600">
                                                    {cv.analysisData.score} / 100
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-slate-500">Analysis Status</span>
                                                <span className="text-sm font-black text-amber-600">Pending</span>
                                            </div>
                                        )}

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/builder?id=${cv.id}`);
                                            }}
                                            className="cursor-pointer w-full mt-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold py-2.5 rounded-xl transition-colors border border-slate-200 hover:border-blue-200 text-sm flex items-center justify-center gap-2"
                                        >
                                            Edit CV
                                        </button>
                                    </div>

                                    {/* Delete Button */}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                className="cursor-pointer absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-20"
                                                title="Delete Report"
                                            >
                                                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-black">Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete this document and its associated analysis.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="cursor-pointer text-black" onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteCv(cv.id);
                                                    }}
                                                    className="cursor-pointer bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
