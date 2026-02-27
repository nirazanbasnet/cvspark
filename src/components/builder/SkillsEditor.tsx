"use client";

import { GoldStandardResume } from "@/types/resume";
import { Wrench } from "lucide-react";

export function SkillsEditor({
    liveCvData,
    setLiveCvData
}: {
    liveCvData: GoldStandardResume,
    setLiveCvData: (data: GoldStandardResume) => void
}) {
    // Helper to genericize CSV string management
    const parseCsv = (val: string) => val.split(',').map(s => s.trim()).filter(Boolean);

    const handleChange = (category: keyof GoldStandardResume['skills'], value: string) => {
        setLiveCvData({
            ...liveCvData,
            skills: {
                ...liveCvData.skills,
                [category]: parseCsv(value)
            }
        });
    };

    const categories: { key: keyof GoldStandardResume['skills'], label: string, placeholder: string }[] = [
        { key: "programming", label: "Programming Languages", placeholder: "e.g. JavaScript, Python, Go" },
        { key: "frameworks", label: "Frameworks & Libraries", placeholder: "e.g. React, Next.js, Django" },
        { key: "devOps", label: "DevOps & Tools", placeholder: "e.g. Git, Docker, Kubernetes" },
        { key: "cloud", label: "Cloud Platforms", placeholder: "e.g. AWS, GCP, Azure" },
        { key: "databases", label: "Databases", placeholder: "e.g. PostgreSQL, MongoDB, Redis" },
        { key: "testing", label: "Testing", placeholder: "e.g. Jest, Cypress, JUnit" },
        { key: "security", label: "Security", placeholder: "e.g. OWASP, SonarQube" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
                    <Wrench className="w-6 h-6 text-rose-400" />
                    Technical Skills
                </h2>
                <p className="text-neutral-400 text-sm">Categorize your technical proficiencies (comma separated).</p>
            </div>

            <div className="space-y-4">
                {categories.map(({ key, label, placeholder }) => (
                    <div key={key} className="space-y-1.5">
                        <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest pl-1">{label}</label>
                        <textarea
                            value={liveCvData.skills[key]?.join(", ") || ""}
                            onChange={(e) => handleChange(key, e.target.value)}
                            placeholder={placeholder}
                            className="w-full min-h-[60px] bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 resize-y"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
