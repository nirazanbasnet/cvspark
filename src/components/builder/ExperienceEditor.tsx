"use client";

import { GoldStandardResume } from "@/types/resume";
import { Briefcase, Plus, Trash2, Wand2, Loader2, Sparkles, ChevronDown, ChevronUp, Bot } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ExperienceEditor({
    liveCvData,
    setLiveCvData
}: {
    liveCvData: GoldStandardResume,
    setLiveCvData: (data: GoldStandardResume) => void
}) {
    const [loadingIndices, setLoadingIndices] = useState<Record<string, boolean>>({});
    const [expandedBlocks, setExpandedBlocks] = useState<number[]>([0]); // First block open by default

    const toggleBlock = (index: number) => {
        if (expandedBlocks.includes(index)) {
            setExpandedBlocks(expandedBlocks.filter(i => i !== index));
        } else {
            setExpandedBlocks([...expandedBlocks, index]);
        }
    };

    const handleExpChange = (expIndex: number, field: string, value: string) => {
        const newExp = [...liveCvData.experience];
        newExp[expIndex] = { ...newExp[expIndex], [field]: value };
        setLiveCvData({ ...liveCvData, experience: newExp });
    };

    const addExperience = () => {
        setLiveCvData({
            ...liveCvData,
            experience: [
                { role: "", company: "", duration: "", bullets: [] },
                ...liveCvData.experience
            ]
        });
        setExpandedBlocks([...expandedBlocks.map(i => i + 1), 0]);
    };

    const removeExperience = (index: number) => {
        const newExp = liveCvData.experience.filter((_, i) => i !== index);
        setLiveCvData({ ...liveCvData, experience: newExp });
        setExpandedBlocks(expandedBlocks.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    };

    // --- BULLET LOGIC --- //
    const handleImprove = async (expIndex: number, areaIndex: number | null, bulletIndex: number, text: string) => {
        if (!text || text.length < 5) return;

        const loadingKey = `${expIndex}-${areaIndex}-${bulletIndex}`;
        setLoadingIndices(prev => ({ ...prev, [loadingKey]: true }));

        try {
            const res = await fetch("/api/improve-bullet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            const data = await res.json();

            if (data.suggestion) {
                const newExp = [...liveCvData.experience];
                if (areaIndex !== null && newExp[expIndex].focusAreas) {
                    newExp[expIndex].focusAreas![areaIndex].bullets[bulletIndex] = data.suggestion;
                } else if (newExp[expIndex].bullets) {
                    newExp[expIndex].bullets![bulletIndex] = data.suggestion;
                }
                setLiveCvData({ ...liveCvData, experience: newExp });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingIndices(prev => ({ ...prev, [loadingKey]: false }));
        }
    };

    const handleSuggest = async (expIndex: number, areaIndex: number | null) => {
        const exp = liveCvData.experience[expIndex];
        const role = exp.role || "Professional";
        const taskHeading = areaIndex !== null && exp.focusAreas ? exp.focusAreas[areaIndex].heading : "";

        const existingBullets = areaIndex !== null && exp.focusAreas ? exp.focusAreas[areaIndex].bullets : (exp.bullets || []);

        const loadingKey = `${expIndex}-${areaIndex}-suggest`;
        setLoadingIndices(prev => ({ ...prev, [loadingKey]: true }));

        try {
            const res = await fetch("/api/suggest-bullet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role, taskHeading, existingBullets }),
            });
            const data = await res.json();

            if (data.suggestion) {
                const newExp = [...liveCvData.experience];
                if (areaIndex !== null && newExp[expIndex].focusAreas) {
                    newExp[expIndex].focusAreas![areaIndex].bullets.push(data.suggestion);
                } else {
                    if (!newExp[expIndex].bullets) newExp[expIndex].bullets = [];
                    newExp[expIndex].bullets!.push(data.suggestion);
                }
                setLiveCvData({ ...liveCvData, experience: newExp });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingIndices(prev => ({ ...prev, [loadingKey]: false }));
        }
    };

    const updateBullet = (expIndex: number, areaIndex: number | null, bulletIndex: number, val: string) => {
        const newExp = [...liveCvData.experience];
        if (areaIndex !== null && newExp[expIndex].focusAreas) {
            newExp[expIndex].focusAreas![areaIndex].bullets[bulletIndex] = val;
        } else {
            if (!newExp[expIndex].bullets) newExp[expIndex].bullets = [];
            newExp[expIndex].bullets![bulletIndex] = val;
        }
        setLiveCvData({ ...liveCvData, experience: newExp });
    };

    const addBullet = (expIndex: number, areaIndex: number | null) => {
        const newExp = [...liveCvData.experience];
        if (areaIndex !== null && newExp[expIndex].focusAreas) {
            newExp[expIndex].focusAreas![areaIndex].bullets.push("");
        } else {
            if (!newExp[expIndex].bullets) newExp[expIndex].bullets = [];
            newExp[expIndex].bullets!.push("");
        }
        setLiveCvData({ ...liveCvData, experience: newExp });
    };

    const removeBullet = (expIndex: number, areaIndex: number | null, bulletIndex: number) => {
        const newExp = [...liveCvData.experience];
        if (areaIndex !== null && newExp[expIndex].focusAreas) {
            newExp[expIndex].focusAreas![areaIndex].bullets.splice(bulletIndex, 1);
        } else if (newExp[expIndex].bullets) {
            newExp[expIndex].bullets!.splice(bulletIndex, 1);
        }
        setLiveCvData({ ...liveCvData, experience: newExp });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
                        <Briefcase className="w-6 h-6 text-rose-400" />
                        Professional Experience
                    </h2>
                    <p className="text-neutral-400 text-sm">Add roles and let AI optimize your bullet formatting.</p>
                </div>
                <button
                    onClick={addExperience}
                    className="text-xs font-bold bg-white text-black px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-neutral-200 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add Role
                </button>
            </div>

            <div className="space-y-5">
                {liveCvData.experience.map((exp, expIndex) => {
                    const isExpanded = expandedBlocks.includes(expIndex);

                    return (
                        <div key={expIndex} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300">
                            {/* Accordion Header */}
                            <div
                                className={cn(
                                    "p-5 flex items-center justify-between cursor-pointer transition-colors hover:bg-white/5",
                                    isExpanded ? "bg-white/5 border-b border-white/5" : ""
                                )}
                                onClick={() => toggleBlock(expIndex)}
                            >
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        {exp.role || "Untitled Role"}
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                                            {exp.company || "Company"}
                                        </span>
                                    </h3>
                                    <div className="text-sm text-neutral-400 mt-0.5">{exp.duration || "Duration"}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeExperience(expIndex); }}
                                        className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="p-1 rounded-full bg-white/10">
                                        {isExpanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
                                    </div>
                                </div>
                            </div>

                            {/* Accordion Body */}
                            {isExpanded && (
                                <div className="p-6 space-y-6">
                                    {/* Edit Role Meta */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Job Title</label>
                                            <input
                                                type="text"
                                                value={exp.role}
                                                onChange={(e) => handleExpChange(expIndex, "role", e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Company</label>
                                            <input
                                                type="text"
                                                value={exp.company}
                                                onChange={(e) => handleExpChange(expIndex, "company", e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Duration</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Oct 2022 - Present"
                                                value={exp.duration}
                                                onChange={(e) => handleExpChange(expIndex, "duration", e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Flat Bullets Array */}
                                    {(exp.bullets !== undefined || (!exp.bullets && !exp.focusAreas)) && (
                                        <div className="space-y-3 pt-4 border-t border-white/5">
                                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                                                Accomplishments <Sparkles className="w-3 h-3 text-rose-400" />
                                            </label>

                                            <div className="space-y-3">
                                                {(exp.bullets || []).map((bullet, idx) => {
                                                    const loadingKey = `${expIndex}-null-${idx}`;
                                                    const isLoading = loadingIndices[loadingKey];

                                                    return (
                                                        <div key={`flat-${idx}`} className="flex gap-2 group relative">
                                                            <textarea
                                                                className="flex-1 min-h-[60px] bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 resize-y transition-all placeholder:text-white/20 custom-scrollbar"
                                                                placeholder="e.g. Increased page load speeds..."
                                                                value={bullet}
                                                                onChange={(e) => updateBullet(expIndex, null, idx, e.target.value)}
                                                            />
                                                            <div className="flex flex-col gap-1.5 justify-center">
                                                                <button
                                                                    onClick={() => handleImprove(expIndex, null, idx, bullet)}
                                                                    disabled={isLoading || bullet.length < 5}
                                                                    className="p-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white rounded-lg transition-all disabled:opacity-50 border border-indigo-500/30"
                                                                    title="AI Optimize"
                                                                >
                                                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                                                </button>
                                                                <button
                                                                    onClick={() => removeBullet(expIndex, null, idx)}
                                                                    className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => handleSuggest(expIndex, null)}
                                                    disabled={loadingIndices[`${expIndex}-null-suggest`]}
                                                    className="flex-1 py-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-300 text-sm font-bold hover:bg-indigo-500 hover:text-white transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                                                >
                                                    {loadingIndices[`${expIndex}-null-suggest`] ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Bot className="w-4 h-4" />
                                                    )}
                                                    {(!exp.bullets || exp.bullets.length === 0) ? "AI Suggest Starting Bullet" : "AI Suggest Another Bullet"}
                                                </button>
                                                <button
                                                    onClick={() => addBullet(expIndex, null)}
                                                    className="w-12 flex justify-center items-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-neutral-400"
                                                    title="Add Manual Bullet"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Focus Areas (If the CV uses them) */}
                                    {(exp.focusAreas || []).map((area, areaIndex) => (
                                        <div key={areaIndex} className="space-y-3 pt-4 border-t border-white/5 bg-black/20 p-4 rounded-xl relative group">
                                            <button
                                                onClick={() => {
                                                    const newExp = [...liveCvData.experience];
                                                    newExp[expIndex].focusAreas!.splice(areaIndex, 1);
                                                    setLiveCvData({ ...liveCvData, experience: newExp });
                                                }}
                                                className="absolute top-4 right-4 p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                                title="Remove Task/Project Area"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>

                                            <input
                                                type="text"
                                                value={area.heading}
                                                onChange={(e) => {
                                                    const newExp = [...liveCvData.experience];
                                                    newExp[expIndex].focusAreas![areaIndex].heading = e.target.value;
                                                    setLiveCvData({ ...liveCvData, experience: newExp });
                                                }}
                                                placeholder="Task/Project Title (e.g. Payment API Integration)"
                                                className="w-full pr-8 bg-transparent border-b border-white/10 px-1 py-1 text-sm font-bold text-rose-300 focus:outline-none focus:border-rose-400 mb-2 transition-colors placeholder:text-rose-300/30"
                                            />

                                            <div className="space-y-3">
                                                {area.bullets.map((bullet, idx) => {
                                                    const loadingKey = `${expIndex}-${areaIndex}-${idx}`;
                                                    const isLoading = loadingIndices[loadingKey];

                                                    return (
                                                        <div key={`area-${idx}`} className="flex gap-2 group/bullet relative">
                                                            <textarea
                                                                className="flex-1 min-h-[60px] bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 resize-y transition-all placeholder:text-white/20 custom-scrollbar"
                                                                placeholder="e.g. Managed payment gateways..."
                                                                value={bullet}
                                                                onChange={(e) => updateBullet(expIndex, areaIndex, idx, e.target.value)}
                                                            />
                                                            <div className="flex flex-col gap-1.5 justify-center">
                                                                <button
                                                                    onClick={() => handleImprove(expIndex, areaIndex, idx, bullet)}
                                                                    disabled={isLoading || bullet.length < 5}
                                                                    className="p-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white rounded-lg transition-all disabled:opacity-50 border border-indigo-500/30"
                                                                    title="AI Optimize"
                                                                >
                                                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                                                </button>
                                                                <button
                                                                    onClick={() => removeBullet(expIndex, areaIndex, idx)}
                                                                    className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => handleSuggest(expIndex, areaIndex)}
                                                    disabled={loadingIndices[`${expIndex}-${areaIndex}-suggest`]}
                                                    className="flex-1 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-300 text-sm font-bold hover:bg-indigo-500 hover:text-white transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                                                >
                                                    {loadingIndices[`${expIndex}-${areaIndex}-suggest`] ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Bot className="w-4 h-4" />
                                                    )}
                                                    {(!area.bullets || area.bullets.length === 0) ? "AI Suggest Bullet" : "AI Suggest More"}
                                                </button>
                                                <button
                                                    onClick={() => addBullet(expIndex, areaIndex)}
                                                    className="px-4 flex justify-center items-center rounded-xl bg-black/40 border border-white/10 hover:bg-white/10 transition-all text-neutral-400"
                                                    title="Add Manual Bullet"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => {
                                            const newExp = [...liveCvData.experience];
                                            if (!newExp[expIndex].focusAreas) newExp[expIndex].focusAreas = [];
                                            newExp[expIndex].focusAreas!.push({ heading: "", bullets: [] });
                                            setLiveCvData({ ...liveCvData, experience: newExp });
                                        }}
                                        className="mt-6 w-full py-3 border border-dashed border-rose-500/30 rounded-xl text-rose-400 text-sm font-bold hover:bg-rose-500/10 hover:border-rose-500/50 transition-all flex justify-center items-center gap-2 bg-rose-500/5"
                                    >
                                        <Plus className="w-4 h-4" /> Add Task / Project Area
                                    </button>

                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
