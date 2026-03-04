"use client";

import { GoldStandardResume } from "@/types/resume";
import { FilePlus2, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CustomSectionsEditor({
    liveCvData,
    setLiveCvData
}: {
    liveCvData: GoldStandardResume,
    setLiveCvData: (data: GoldStandardResume) => void
}) {
    const [expandedSections, setExpandedSections] = useState<number[]>([0]);

    const toggleSection = (index: number) => {
        if (expandedSections.includes(index)) {
            setExpandedSections(expandedSections.filter(i => i !== index));
        } else {
            setExpandedSections([...expandedSections, index]);
        }
    };

    const addSection = () => {
        setLiveCvData({
            ...liveCvData,
            customSections: [
                { title: "New Custom Section", items: [{ heading: "", subheading: "", date: "", description: "", bullets: [""] }] },
                ...(liveCvData.customSections || [])
            ]
        });
        setExpandedSections([...expandedSections.map(i => i + 1), 0]);
    };

    const removeSection = (index: number) => {
        const newSections = (liveCvData.customSections || []).filter((_, i) => i !== index);
        setLiveCvData({ ...liveCvData, customSections: newSections });
        setExpandedSections(expandedSections.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    };

    const updateSectionTitle = (index: number, val: string) => {
        const newSections = [...(liveCvData.customSections || [])];
        newSections[index].title = val;
        setLiveCvData({ ...liveCvData, customSections: newSections });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
                        <FilePlus2 className="w-6 h-6 text-rose-400" />
                        Custom Sections
                    </h2>
                    <p className="text-slate-500 text-sm">Add bespoke categories like Certifications or Languages.</p>
                </div>
                <button
                    onClick={addSection}
                    className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add Section
                </button>
            </div>

            <div className="space-y-5">
                {(liveCvData.customSections || []).map((section, secIdx) => {
                    const isExpanded = expandedSections.includes(secIdx);

                    return (
                        <div key={secIdx} className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300">
                            <div
                                className={cn(
                                    "p-5 flex items-center justify-between cursor-pointer transition-colors hover:bg-slate-50",
                                    isExpanded ? "bg-white shadow-sm border-b border-slate-200" : ""
                                )}
                                onClick={() => toggleSection(secIdx)}
                            >
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        {section.title || "Untitled Section"}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeSection(secIdx); }}
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
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Section Title</label>
                                        <input
                                            type="text"
                                            value={section.title || ""}
                                            onChange={(e) => updateSectionTitle(secIdx, e.target.value)}
                                            className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none "
                                        />
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-slate-200">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                                            Section Items
                                        </label>
                                        {section.items.map((item, itemIdx) => (
                                            <div key={itemIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative group">
                                                <button
                                                    onClick={() => {
                                                        const newSections = [...(liveCvData.customSections || [])];
                                                        newSections[secIdx].items.splice(itemIdx, 1);
                                                        setLiveCvData({ ...liveCvData, customSections: newSections });
                                                    }}
                                                    className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-slate-700 hover:text-rose-400 hover:bg-rose-100 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Remove Item"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Heading / Title</label>
                                                        <input
                                                            type="text"
                                                            value={item.heading || ""}
                                                            onChange={(e) => {
                                                                const newSections = [...(liveCvData.customSections || [])];
                                                                newSections[secIdx].items[itemIdx].heading = e.target.value;
                                                                setLiveCvData({ ...liveCvData, customSections: newSections });
                                                            }}
                                                            className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none "
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Date / Duration</label>
                                                        <input
                                                            type="text"
                                                            value={item.date || ""}
                                                            onChange={(e) => {
                                                                const newSections = [...(liveCvData.customSections || [])];
                                                                newSections[secIdx].items[itemIdx].date = e.target.value;
                                                                setLiveCvData({ ...liveCvData, customSections: newSections });
                                                            }}
                                                            className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none "
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5 md:col-span-2">
                                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Subheading</label>
                                                        <input
                                                            type="text"
                                                            value={item.subheading || ""}
                                                            onChange={(e) => {
                                                                const newSections = [...(liveCvData.customSections || [])];
                                                                newSections[secIdx].items[itemIdx].subheading = e.target.value;
                                                                setLiveCvData({ ...liveCvData, customSections: newSections });
                                                            }}
                                                            className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none "
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5 md:col-span-2">
                                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Description (Inline Info)</label>
                                                        <textarea
                                                            value={item.description || ""}
                                                            onChange={(e) => {
                                                                const newSections = [...(liveCvData.customSections || [])];
                                                                newSections[secIdx].items[itemIdx].description = e.target.value;
                                                                setLiveCvData({ ...liveCvData, customSections: newSections });
                                                            }}
                                                            className="w-full min-h-[60px] bg-white shadow-sm border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none  resize-y"
                                                        />
                                                    </div>
                                                </div>

                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-2 block">Bullet Points</label>
                                                <div className="space-y-2">
                                                    {(item.bullets || []).map((bullet, bIdx) => (
                                                        <div key={bIdx} className="flex gap-2 group/bullet relative">
                                                            <textarea
                                                                className="flex-1 min-h-[40px] bg-white shadow-sm border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none  resize-y"
                                                                value={bullet}
                                                                onChange={(e) => {
                                                                    const newSections = [...(liveCvData.customSections || [])];
                                                                    if (!newSections[secIdx].items[itemIdx].bullets) newSections[secIdx].items[itemIdx].bullets = [];
                                                                    newSections[secIdx].items[itemIdx].bullets![bIdx] = e.target.value;
                                                                    setLiveCvData({ ...liveCvData, customSections: newSections });
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newSections = [...(liveCvData.customSections || [])];
                                                                    newSections[secIdx].items[itemIdx].bullets!.splice(bIdx, 1);
                                                                    setLiveCvData({ ...liveCvData, customSections: newSections });
                                                                }}
                                                                className="p-2 text-slate-500 hover:text-slate-700 hover:text-rose-400 hover:bg-rose-100 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => {
                                                            const newSections = [...(liveCvData.customSections || [])];
                                                            if (!newSections[secIdx].items[itemIdx].bullets) newSections[secIdx].items[itemIdx].bullets = [];
                                                            newSections[secIdx].items[itemIdx].bullets!.push("");
                                                            setLiveCvData({ ...liveCvData, customSections: newSections });
                                                        }}
                                                        className="mt-2 w-full py-2 border border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 text-sm font-medium hover:border-white/30 hover:text-slate-600 transition-all flex justify-center items-center gap-2"
                                                    >
                                                        <Plus className="w-4 h-4" /> Add Bullet Message
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => {
                                                const newSections = [...(liveCvData.customSections || [])];
                                                newSections[secIdx].items.push({ heading: "", subheading: "", date: "", description: "", bullets: [""] });
                                                setLiveCvData({ ...liveCvData, customSections: newSections });
                                            }}
                                            className="mt-4 w-full py-3 border border-dashed border-rose-200 rounded-xl text-rose-400 text-sm font-bold hover:bg-rose-100 hover:border-rose-300 transition-all flex justify-center items-center gap-2 bg-rose-50"
                                        >
                                            <Plus className="w-4 h-4" /> Add Item to {section.title || "Section"}
                                        </button>
                                    </div>                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
