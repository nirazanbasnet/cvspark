"use client";

import { GoldStandardResume } from "@/types/resume";
import { GraduationCap, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function EducationEditor({
    liveCvData,
    setLiveCvData
}: {
    liveCvData: GoldStandardResume,
    setLiveCvData: (data: GoldStandardResume) => void
}) {
    const [expandedBlocks, setExpandedBlocks] = useState<number[]>([0]);

    const toggleBlock = (index: number) => {
        if (expandedBlocks.includes(index)) {
            setExpandedBlocks(expandedBlocks.filter(i => i !== index));
        } else {
            setExpandedBlocks([...expandedBlocks, index]);
        }
    };

    const handleChange = (index: number, field: string, value: string) => {
        const newEdu = [...(liveCvData.education || [])];
        newEdu[index] = { ...newEdu[index], [field]: value };
        setLiveCvData({ ...liveCvData, education: newEdu });
    };

    const addEducation = () => {
        setLiveCvData({
            ...liveCvData,
            education: [
                { institution: "", degree: "", location: "", duration: "" },
                ...(liveCvData.education || [])
            ]
        });
        setExpandedBlocks([...expandedBlocks.map(i => i + 1), 0]);
    };

    const removeEducation = (index: number) => {
        const newEdu = (liveCvData.education || []).filter((_, i) => i !== index);
        setLiveCvData({ ...liveCvData, education: newEdu });
        setExpandedBlocks(expandedBlocks.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
                        <GraduationCap className="w-6 h-6 text-rose-400" />
                        Education
                    </h2>
                    <p className="text-slate-500 text-sm">List your academic achievements and degrees.</p>
                </div>
                <button
                    onClick={addEducation}
                    className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add Degree
                </button>
            </div>

            <div className="space-y-5">
                {(liveCvData.education || []).map((edu, idx) => {
                    const isExpanded = expandedBlocks.includes(idx);

                    return (
                        <div key={idx} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300">
                            <div
                                className={cn(
                                    "p-5 flex items-center justify-between cursor-pointer transition-colors hover:bg-slate-50",
                                    isExpanded ? "bg-white shadow-sm border-b border-slate-200" : ""
                                )}
                                onClick={() => toggleBlock(idx)}
                            >
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        {edu.degree || "Untitled Degree"}
                                    </h3>
                                    <div className="text-sm text-slate-500 mt-0.5">{edu.institution || "Institution"}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeEducation(idx); }}
                                        className="p-2 text-slate-500 hover:text-slate-700 hover:text-rose-400 hover:bg-rose-100 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="p-1 rounded-full bg-slate-100">
                                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-900" /> : <ChevronDown className="w-5 h-5 text-slate-900" />}
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Degree / Major</label>
                                            <input
                                                type="text"
                                                value={edu.degree || ""}
                                                onChange={(e) => handleChange(idx, "degree", e.target.value)}
                                                className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none "
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Institution</label>
                                            <input
                                                type="text"
                                                value={edu.institution || ""}
                                                onChange={(e) => handleChange(idx, "institution", e.target.value)}
                                                className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none "
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Location</label>
                                            <input
                                                type="text"
                                                value={edu.location || ""}
                                                onChange={(e) => handleChange(idx, "location", e.target.value)}
                                                className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none "
                                            />
                                        </div>
                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Dates / Duration</label>
                                            <input
                                                type="text"
                                                value={edu.duration || ""}
                                                onChange={(e) => handleChange(idx, "duration", e.target.value)}
                                                className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none "
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
