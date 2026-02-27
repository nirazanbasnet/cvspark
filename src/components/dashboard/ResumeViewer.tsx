import { GoldStandardResume } from "@/types/resume";

const commonActionVerbs = [
    "Led", "Implemented", "Architected", "Developed", "Collaborated", "Optimized",
    "Managed", "Directed", "Spearheaded", "Built", "Designed", "Created"
];

function Highlighter({ text, keywords }: { text: string; keywords: string[] }) {
    if (!keywords.length || !text) return <>{text}</>;

    // Escape regex characters in keywords
    const escapedKeywords = keywords
        .filter(k => k.trim().length > 1) // don't highlight single letters
        .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    if (escapedKeywords.length === 0) return <>{text}</>;

    const regex = new RegExp(`\\b(${escapedKeywords.join("|")})\\b`, "gi");

    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) => {
                const isMatch = keywords.some(
                    (k) => k.toLowerCase() === part.toLowerCase()
                );
                return isMatch ? (
                    <span
                        key={i}
                        className="text-emerald-500 px-1 py-0.5 rounded"
                    >
                        {part}
                    </span>
                ) : (
                    <span key={i}>{part}</span>
                );
            })}
        </>
    );
}

export function ResumeViewer({ cvData }: { cvData: GoldStandardResume }) {
    if (!cvData) {
        return (
            <div className="bg-white/5 rounded-xl shadow-sm border border-white/10 p-8 text-neutral-400 font-sans max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
                <p>CV Data is missing or corrupted. Please use the Re-Analyze button above to restore it.</p>
            </div>
        );
    }

    // Collect all skills to use for highlighting
    const allSkills = cvData.skills ? Object.values(cvData.skills).flat() : [];
    const highlights = [...allSkills, ...commonActionVerbs];

    return (
        <div className="bg-white/5 rounded-xl shadow-sm border border-white/10 p-8 text-white font-sans max-w-4xl mx-auto backdrop-blur-md">
            {/* Header / Personal Info */}
            <div className="text-center border-b border-white/10 pb-6 mb-6">
                <h1 className="text-3xl font-bold text-white mb-1">{cvData.basics.name}</h1>
                <p className="text-lg text-rose-400 mb-3 font-medium">{cvData.basics.label}</p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-neutral-400">
                    {cvData.basics.email && <span>{cvData.basics.email}</span>}
                    {cvData.basics.phone && <span>{cvData.basics.phone}</span>}
                    {cvData.basics.links.portfolio && <span>{cvData.basics.links.portfolio}</span>}
                    {cvData.basics.links.github && <span>{cvData.basics.links.github}</span>}
                    {cvData.basics.links.linkedin && <span>{cvData.basics.links.linkedin}</span>}
                </div>
            </div>

            {/* Professional Summary */}
            {cvData.basics.summary && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Professional Summary</h2>
                    <p className="text-neutral-300 leading-relaxed text-sm">
                        <Highlighter
                            text={cvData.basics.summary}
                            keywords={highlights}
                        />
                    </p>
                </div>
            )}

            {/* Work Experience */}
            <div className="mb-8">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Work Experience</h2>
                <div className="flex flex-col gap-6">
                    {cvData.experience.map((exp, idx) => (
                        <div key={idx} className="relative pl-4 border-l-2 border-white/10">
                            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-neutral-900 border-2 border-white/20"></div>
                            <div className="flex justify-between items-baseline mb-2">
                                <h3 className="font-bold text-white text-base">{exp.role}</h3>
                                <span className="text-sm text-neutral-400 font-medium bg-white/5 px-2 py-0.5 rounded-md">{exp.duration}</span>
                            </div>
                            <p className="text-sm text-rose-300 font-medium mb-3">{exp.company}</p>

                            {exp.bullets && exp.bullets.length > 0 && (
                                <ul className="list-none space-y-1 mt-2">
                                    {exp.bullets.map((bullet, bIdx) => (
                                        <li key={`bull-${bIdx}`} className="text-sm text-neutral-300 flex gap-3 leading-relaxed">
                                            <span className="text-rose-500 mt-0.5 opacity-70">▹</span>
                                            <span>
                                                <Highlighter text={bullet} keywords={highlights} />
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {exp.focusAreas?.map((area, aIdx) => (
                                <ul key={`area-${aIdx}`} className="list-none space-y-1 mt-4 bg-black/20 p-4 rounded-xl border border-white/5">
                                    {area.heading && <li className="text-sm font-bold text-rose-200 mb-2">{area.heading}</li>}
                                    {area.bullets.map((bullet, bIdx) => (
                                        <li key={bIdx} className="text-sm text-neutral-300 flex gap-3 leading-relaxed">
                                            <span className="text-rose-500 mt-0.5 opacity-70">▹</span>
                                            <span>
                                                <Highlighter text={bullet} keywords={highlights} />
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Technical Skills */}
            <div className="mb-8">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Technical Skills</h2>
                <div className="flex flex-wrap gap-2">
                    {allSkills.map((skill, idx) => (
                        <span key={idx} className="bg-white/5 border border-white/10 hover:border-rose-500/30 transition-colors text-neutral-300 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            {/* Education */}
            <div className="mb-8">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Education</h2>
                <div className="flex flex-col gap-6">
                    {cvData.education.map((edu, idx) => (
                        <div key={idx} className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-white">{edu.degree}</h3>
                                <p className="text-sm text-neutral-400 mt-1">{edu.institution}, {edu.location}</p>
                            </div>
                            <div className="text-sm text-neutral-500 font-medium bg-white/5 px-3 py-1 rounded-md">{edu.duration}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Dynamic Sections */}
            {cvData.customSections?.map((section, idx) => (
                <div key={`custom-${idx}`} className="mb-8">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> {section.title}</h2>
                    <div className="flex flex-col gap-6">
                        {section.items.map((item, itemIdx) => (
                            <div key={`item-${itemIdx}`} className="bg-black/20 p-5 rounded-xl border border-white/5">
                                {(item.heading || item.date) && (
                                    <div className="flex justify-between items-baseline mb-2">
                                        {item.heading && <h3 className="font-bold text-white">{item.heading}</h3>}
                                        {item.date && <span className="text-sm text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md">{item.date}</span>}
                                    </div>
                                )}
                                {item.subheading && <p className="text-sm text-rose-300 font-medium mb-3">{item.subheading}</p>}
                                {item.description && (
                                    <p className="text-sm text-neutral-300 mb-3 leading-relaxed">
                                        <Highlighter text={item.description} keywords={highlights} />
                                    </p>
                                )}
                                {item.bullets && item.bullets.length > 0 && (
                                    <ul className="list-none space-y-2 mt-2">
                                        {item.bullets.map((bullet, bIdx) => (
                                            <li key={`cbull-${bIdx}`} className="text-sm text-neutral-300 flex gap-3 leading-relaxed">
                                                <span className="text-rose-500 mt-0.5 opacity-70">▹</span>
                                                <span>
                                                    <Highlighter text={bullet} keywords={highlights} />
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
