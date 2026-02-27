import { GoldStandardResume } from "@/types/resume";

export function ResumePreview({
    cvData,
    activeBullets = []
}: {
    cvData: GoldStandardResume | null,
    activeBullets?: string[]
}) {
    if (!cvData) {
        return (
            <div
                className="p-8 shadow-2xl rounded-sm w-full h-full min-h-[600px] border font-sans mx-auto max-w-[800px] flex items-center justify-center"
                style={{ backgroundColor: '#ffffff', color: '#262626', borderColor: '#e5e5e5' }}
            >
                <p className="font-medium" style={{ color: '#737373' }}>
                    No CV Data found. Please go back to the dashboard and benchmark a resume.
                </p>
            </div>
        );
    }

    // Heuristic for bolding tech terms
    const boldText = (text: string) => {
        const techWords = [
            ...cvData.skills.programming,
            ...cvData.skills.frameworks,
            ...cvData.skills.devOps,
            ...cvData.skills.databases,
            ...cvData.skills.cloud
        ].filter(Boolean);

        let highlightedText = text;
        techWords.forEach(tech => {
            if (tech.length > 2) {
                // Escape special regex chars
                const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\b${escapeRegExp(tech)}\\b`, 'gi');
                highlightedText = highlightedText.replace(regex, `<strong style="color: #000000; font-weight: 600;">$&</strong>`);
            }
        });
        return highlightedText;
    };

    return (
        <div
            className="p-10 shadow-2xl rounded-sm w-full h-full min-h-[1056px] font-sans mx-auto max-w-[816px] flex flex-col relative overflow-hidden text-[13px] leading-relaxed"
            style={{ backgroundColor: '#ffffff', color: '#000000' }}
        >

            {/* --- HEADER --- */}
            <div className="text-center mb-5">
                <h1 className="text-3xl font-bold tracking-tight uppercase mb-1" style={{ color: '#000000' }}>{cvData.basics.name}</h1>
                <div className="flex flex-wrap items-center justify-center gap-2 text-[12px]" style={{ color: '#000000' }}>
                    {cvData.basics.location && <span>{cvData.basics.location}</span>}
                    {(cvData.basics.location && cvData.basics.phone) && <span>|</span>}
                    {cvData.basics.phone && <span>{cvData.basics.phone}</span>}
                    {(cvData.basics.phone && cvData.basics.email) && <span>|</span>}
                    {cvData.basics.email && <span>{cvData.basics.email}</span>}

                    {cvData.basics.links.portfolio && (
                        <><span>|</span><a href={cvData.basics.links.portfolio} className="underline" style={{ color: '#1d4ed8' }}>{cvData.basics.links.portfolio.replace(/^https?:\/\//, '')}</a></>
                    )}
                    {cvData.basics.links.github && (
                        <><span>|</span><a href={cvData.basics.links.github} className="underline" style={{ color: '#1d4ed8' }}>github.com/{cvData.basics.links.github.split('/').pop()}</a></>
                    )}
                    {cvData.basics.links.linkedin && (
                        <><span>|</span><a href={cvData.basics.links.linkedin} className="underline" style={{ color: '#1d4ed8' }}>linkedin.com/in/{cvData.basics.links.linkedin.split('/').pop()}</a></>
                    )}
                </div>
            </div>

            {/* --- SUMMARY --- */}
            {cvData.basics.summary && (
                <div className="mb-4">
                    <h2
                        className="text-[14px] font-bold uppercase border-b pb-0.5 mb-2"
                        style={{ color: '#000000', borderColor: '#000000' }}
                    >Professional Summary</h2>
                    <p className="text-justify">{cvData.basics.summary}</p>
                </div>
            )}

            {/* --- EDUCATION --- */}
            {cvData.education?.length > 0 && (
                <div className="mb-4">
                    <h2
                        className="text-[14px] font-bold uppercase border-b pb-0.5 mb-2"
                        style={{ color: '#000000', borderColor: '#000000' }}
                    >Education</h2>
                    {cvData.education.map((edu, idx) => (
                        <div key={idx} className="flex justify-between items-baseline mb-1">
                            <div>
                                <span className="font-bold">{edu.institution}</span>
                                <span>, {edu.location} — {edu.degree}</span>
                            </div>
                            <span className="shrink-0 font-medium">{edu.duration}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* --- SKILLS --- */}
            <div className="mb-4">
                <h2
                    className="text-[14px] font-bold uppercase border-b pb-0.5 mb-2"
                    style={{ color: '#000000', borderColor: '#000000' }}
                >Technical Skills</h2>
                <div className="flex flex-col gap-1">
                    {cvData.skills.programming?.length > 0 && <div><span className="font-bold">Languages:</span> {cvData.skills.programming.join(", ")}</div>}
                    {cvData.skills.frameworks?.length > 0 && <div><span className="font-bold">Frameworks & Libraries:</span> {cvData.skills.frameworks.join(", ")}</div>}
                    {cvData.skills.databases?.length > 0 && <div><span className="font-bold">Databases:</span> {cvData.skills.databases.join(", ")}</div>}
                    {cvData.skills.devOps?.length > 0 && <div><span className="font-bold">DevTools & CI/CD:</span> {cvData.skills.devOps.join(", ")}</div>}
                    {cvData.skills.cloud?.length > 0 && <div><span className="font-bold">Cloud Technologies:</span> {cvData.skills.cloud.join(", ")}</div>}
                </div>
            </div>

            {/* --- EXPERIENCE --- */}
            <div className="mb-4">
                <h2
                    className="text-[14px] font-bold uppercase border-b pb-0.5 mb-2"
                    style={{ color: '#000000', borderColor: '#000000' }}
                >Professional Experience</h2>
                <div className="space-y-4">
                    {cvData.experience.map((exp, expIdx) => (
                        <div key={expIdx}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-[14px]">{exp.company}</h3>
                                <div className="font-bold">{exp.duration}</div>
                            </div>
                            <div className="italic mb-2">{exp.role}</div>

                            {/* Render unstructured bullets if they exist */}
                            {exp.bullets && exp.bullets.length > 0 && (
                                <ul className="list-disc pl-5 mt-1 space-y-1">
                                    {exp.bullets.filter(b => b.trim().length > 0).map((bullet, idx) => (
                                        <li
                                            key={`bull-${idx}`}
                                            className="pl-1"
                                            dangerouslySetInnerHTML={{ __html: boldText(bullet) }}
                                        />
                                    ))}
                                </ul>
                            )}

                            {/* Render organized focusAreas if they exist */}
                            {exp.focusAreas?.map((area, areaIdx) => {
                                // Live Editing Support
                                const isBeingEdited = expIdx === 0 && areaIdx === 0;
                                const bulletsToRender = isBeingEdited && activeBullets.length > 0 ? activeBullets : area.bullets;

                                return (
                                    <div key={areaIdx} className="mt-3 mb-2">
                                        {area.heading && <h4 className="font-bold text-[13px] mb-1" style={{ color: '#000000' }}>{area.heading}</h4>}
                                        <ul className="list-disc pl-5 space-y-1">
                                            {bulletsToRender.filter(b => b.trim().length > 0).map((bullet, idx) => (
                                                <li
                                                    key={idx}
                                                    className="pl-1"
                                                    dangerouslySetInnerHTML={{ __html: boldText(bullet) }}
                                                />
                                            ))}
                                        </ul>
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* --- OPEN SOURCE PROJECTS --- */}
            {cvData.openSourceProjects && cvData.openSourceProjects.length > 0 && (
                <div className="mb-4">
                    <h2
                        className="text-[14px] font-bold uppercase border-b pb-0.5 mb-2"
                        style={{ color: '#000000', borderColor: '#000000' }}
                    >Open Source Projects</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        {cvData.openSourceProjects.map((project, idx) => (
                            <li key={idx} className="pl-1">
                                <span className="font-bold">{project.title}</span>
                                {project.link && <span> | <a href={project.link} className="underline" style={{ color: '#1d4ed8' }}>{project.link.replace(/^https?:\/\//, '')}</a></span>}
                                <div>{project.description}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* --- CUSTOM SECTIONS --- */}
            {cvData.customSections?.map((section, sectionIdx) => (
                <div key={`customSection-${sectionIdx}`} className="mb-4">
                    <h2
                        className="text-[14px] font-bold uppercase border-b pb-0.5 mb-2"
                        style={{ color: '#000000', borderColor: '#000000' }}
                    >{section.title}</h2>
                    <div className="space-y-3">
                        {section.items.map((item, itemIdx) => (
                            <div key={`customItem-${itemIdx}`}>
                                {(item.heading || item.date) && (
                                    <div className="flex justify-between items-baseline mb-1">
                                        {item.heading && <h3 className="font-bold">{item.heading}</h3>}
                                        {item.date && <div className="font-medium">{item.date}</div>}
                                    </div>
                                )}
                                {item.subheading && <div className="italic mb-1">{item.subheading}</div>}
                                {item.description && (
                                    <div
                                        className="mb-1"
                                        dangerouslySetInnerHTML={{ __html: boldText(item.description) }}
                                    />
                                )}
                                {item.bullets && item.bullets.length > 0 && (
                                    <ul className="list-disc pl-5 space-y-1 mt-1">
                                        {item.bullets.filter(b => b.trim().length > 0).map((bullet, idx) => (
                                            <li
                                                key={`cbull-${idx}`}
                                                className="pl-1"
                                                dangerouslySetInnerHTML={{ __html: boldText(bullet) }}
                                            />
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
