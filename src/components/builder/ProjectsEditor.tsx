"use client";

import { GoldStandardResume } from "@/types/resume";
import { FileCode2, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProjectsEditor({
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
        const newProjects = [...(liveCvData.openSourceProjects || [])];
        newProjects[index] = { ...newProjects[index], [field]: value };
        setLiveCvData({ ...liveCvData, openSourceProjects: newProjects });
    };

    const addProject = () => {
        setLiveCvData({
            ...liveCvData,
            openSourceProjects: [
                { title: "", link: "", description: "" },
                ...(liveCvData.openSourceProjects || [])
            ]
        });
        setExpandedBlocks([...expandedBlocks.map(i => i + 1), 0]);
    };

    const removeProject = (index: number) => {
        const newProjects = (liveCvData.openSourceProjects || []).filter((_, i) => i !== index);
        setLiveCvData({ ...liveCvData, openSourceProjects: newProjects });
        setExpandedBlocks(expandedBlocks.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
                        <FileCode2 className="w-6 h-6 text-rose-400" />
                        Open Source Projects
                    </h2>
                    <p className="text-neutral-400 text-sm">Highlight your personal projects and contributions.</p>
                </div>
                <button
                    onClick={addProject}
                    className="text-xs font-bold bg-white text-black px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-neutral-200 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add Project
                </button>
            </div>

            <div className="space-y-5">
                {(liveCvData.openSourceProjects || []).map((project, idx) => {
                    const isExpanded = expandedBlocks.includes(idx);

                    return (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300">
                            <div
                                className={cn(
                                    "p-5 flex items-center justify-between cursor-pointer transition-colors hover:bg-white/5",
                                    isExpanded ? "bg-white/5 border-b border-white/5" : ""
                                )}
                                onClick={() => toggleBlock(idx)}
                            >
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        {project.title || "Untitled Project"}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeProject(idx); }}
                                        className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="p-1 rounded-full bg-white/10">
                                        {isExpanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Project Title</label>
                                                <input
                                                    type="text"
                                                    value={project.title || ""}
                                                    onChange={(e) => handleChange(idx, "title", e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                                                />
                                            </div>
                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Project Link (URL)</label>
                                                <input
                                                    type="text"
                                                    value={project.link || ""}
                                                    onChange={(e) => handleChange(idx, "link", e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Description</label>
                                            <textarea
                                                value={project.description || ""}
                                                onChange={(e) => handleChange(idx, "description", e.target.value)}
                                                className="w-full min-h-[100px] bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 resize-y"
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
