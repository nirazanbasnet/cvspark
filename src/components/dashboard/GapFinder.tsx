import { AlertCircle } from "lucide-react";

export function GapFinder({ missingSkills }: { missingSkills: string[] }) {
    if (!missingSkills || missingSkills.length === 0) {
        return (
            <div className="p-6 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 rounded-2xl shadow-xl flex items-center justify-center h-full">
                <p className="text-emerald-400 font-medium">No critical gaps found! You are perfectly aligned with the standard.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-rose-500/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-lg font-semibold text-white/90 tracking-wide">Identified Gaps</h3>
            </div>

            <p className="text-sm text-white/60 mb-4 leading-relaxed">
                We noticed your CV is missing some critical specific technologies or architectures that top-tier candidates include. Consider adding these if you have experience with them:
            </p>

            <ul className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {missingSkills.map((skill, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 transition-colors hover:bg-white/10">
                        <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]"></span>
                        <span className="text-sm font-medium text-white/80">{skill}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
