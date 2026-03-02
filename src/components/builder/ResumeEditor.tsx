"use client";

import { useState } from "react";
import { Wand2, Loader2, Sparkles, Plus, Trash2 } from "lucide-react";

export function ResumeEditor({ bullets, setBullets }: { bullets: string[], setBullets: (b: string[]) => void }) {
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

    const handleImprove = async (index: number) => {
        const text = bullets[index];
        if (!text || text.length < 5) return;

        setLoadingIndex(index);
        try {
            const res = await fetch("/api/improve-bullet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            const data = await res.json();

            if (data.suggestion) {
                const newBullets = [...bullets];
                newBullets[index] = data.suggestion;
                setBullets(newBullets);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingIndex(null);
        }
    };

    const updateBullet = (index: number, val: string) => {
        const newBullets = [...bullets];
        newBullets[index] = val;
        setBullets(newBullets);
    };

    const addBullet = () => setBullets([...bullets, ""]);
    const removeBullet = (index: number) => setBullets(bullets.filter((_, i) => i !== index));

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl w-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        Impact-First Experience Builder
                    </h2>
                    <p className="text-sm text-neutral-400 mt-1">Draft your accomplishments. We'll optimize them into the "Sample Formula".</p>
                </div>
            </div>

            <div className="space-y-4">
                {bullets.map((bullet, idx) => (
                    <div key={idx} className="flex gap-3 group relative">
                        <textarea
                            className="flex-1 min-h-[80px] bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 resize-none transition-all placeholder:text-white/20 custom-scrollbar"
                            placeholder="e.g. I made the website faster."
                            value={bullet}
                            onChange={(e) => updateBullet(idx, e.target.value)}
                        />

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => handleImprove(idx)}
                                disabled={loadingIndex === idx || bullet.length < 5}
                                className="p-3 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white rounded-xl transition-all disabled:opacity-50 border border-indigo-500/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                title="AI Improve (Sample Formula)"
                            >
                                {loadingIndex === idx ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                            </button>

                            <button
                                onClick={() => removeBullet(idx)}
                                className="p-3 bg-white/5 text-neutral-400 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-white/5 hover:border-rose-500/30"
                                title="Remove bullet"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={addBullet}
                className="mt-4 w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-neutral-400 font-medium hover:border-white/30 hover:text-white transition-all flex justify-center items-center gap-2"
            >
                <Plus className="w-5 h-5" /> Add New Bullet
            </button>
        </div>
    );
}
