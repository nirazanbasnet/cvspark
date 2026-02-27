"use client";

import { GoldStandardResume } from "@/types/resume";
import { User, Sparkles, Loader2, Link as LinkIcon, MapPin, Mail, Phone } from "lucide-react";
import { useState } from "react";

export function BasicsEditor({
    liveCvData,
    setLiveCvData
}: {
    liveCvData: GoldStandardResume,
    setLiveCvData: (data: GoldStandardResume) => void
}) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleChange = (field: string, value: string) => {
        setLiveCvData({
            ...liveCvData,
            basics: {
                ...liveCvData.basics,
                [field]: value
            }
        });
    };

    const handleLinkChange = (field: string, value: string) => {
        setLiveCvData({
            ...liveCvData,
            basics: {
                ...liveCvData.basics,
                links: {
                    ...liveCvData.basics.links,
                    [field]: value
                }
            }
        });
    };

    const handleGenerateSummary = async () => {
        if (!liveCvData.experience || liveCvData.experience.length === 0) {
            alert("You need to add some Experience first before generating a summary!");
            return;
        }

        try {
            setIsGenerating(true);
            const res = await fetch("/api/generate-summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ experience: liveCvData.experience })
            });

            const data = await res.json();
            if (data.summary) {
                handleChange("summary", data.summary);
            } else if (data.error) {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to generate summary. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
                    <User className="w-6 h-6 text-rose-400" />
                    Basics & Summary
                </h2>
                <p className="text-neutral-400 text-sm">Update your core identity and professional pitch.</p>
            </div>

            {/* AI Summary Generator Box */}
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-3 relative z-10">
                    <label className="text-sm font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                        Professional Summary
                    </label>
                    <button
                        onClick={handleGenerateSummary}
                        disabled={isGenerating}
                        className="text-xs font-bold bg-rose-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-rose-400 transition-colors disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                        Auto-Generate
                    </button>
                </div>
                <textarea
                    value={liveCvData.basics.summary || ""}
                    onChange={(e) => handleChange("summary", e.target.value)}
                    placeholder="Write a compelling summary of your career..."
                    className="w-full min-h-[140px] bg-black/40 border border-black/50 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 resize-y relative z-10"
                />
            </div>

            {/* Core Identity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">Full Name</label>
                    <input
                        type="text"
                        value={liveCvData.basics.name || ""}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">Professional Title</label>
                    <input
                        type="text"
                        value={liveCvData.basics.label || ""}
                        onChange={(e) => handleChange("label", e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                    />
                </div>
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
                    <input
                        type="email"
                        value={liveCvData.basics.email || ""}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</label>
                    <input
                        type="text"
                        value={liveCvData.basics.phone || ""}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                    />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location</label>
                    <input
                        type="text"
                        value={liveCvData.basics.location || ""}
                        onChange={(e) => handleChange("location", e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                    />
                </div>
            </div>

            {/* Links / Social */}
            <div className="grid grid-cols-1 gap-5 border-t border-white/5 pt-6">
                <h3 className="text-sm font-bold text-white mb-2">Social / Portfolio Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 focus-within:border-rose-400 focus-within:ring-1 focus-within:ring-rose-400 transition-all">
                        <LinkIcon className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
                        <input
                            type="text"
                            placeholder="LinkedIn URL"
                            value={liveCvData.basics.links?.linkedin || ""}
                            onChange={(e) => handleLinkChange("linkedin", e.target.value)}
                            className="w-full bg-transparent py-2 text-sm text-white focus:outline-none placeholder:text-neutral-600"
                        />
                    </div>
                    <div className="space-y-1.5 flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 focus-within:border-rose-400 focus-within:ring-1 focus-within:ring-rose-400 transition-all">
                        <LinkIcon className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
                        <input
                            type="text"
                            placeholder="GitHub URL"
                            value={liveCvData.basics.links?.github || ""}
                            onChange={(e) => handleLinkChange("github", e.target.value)}
                            className="w-full bg-transparent py-2 text-sm text-white focus:outline-none placeholder:text-neutral-600"
                        />
                    </div>
                    <div className="space-y-1.5 flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 focus-within:border-rose-400 focus-within:ring-1 focus-within:ring-rose-400 transition-all md:col-span-2">
                        <LinkIcon className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
                        <input
                            type="text"
                            placeholder="Personal Portfolio URL"
                            value={liveCvData.basics.links?.portfolio || ""}
                            onChange={(e) => handleLinkChange("portfolio", e.target.value)}
                            className="w-full bg-transparent py-2 text-sm text-white focus:outline-none placeholder:text-neutral-600"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
