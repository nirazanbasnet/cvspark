import { Lightbulb } from "lucide-react";

export function ActionableAdvice({ advice }: { advice: string[] }) {
    if (!advice || advice.length === 0) return null;

    return (
        <div className="flex flex-col p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl h-full col-span-1 md:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white/90 tracking-wide">AI-Generated Level Up Tips</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {advice.map((tip, index) => (
                    <div key={index} className="p-5 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400/50 transform origin-left transition-transform group-hover:scale-y-110"></div>
                        <p className="text-sm text-white/80 leading-relaxed font-medium">
                            "{tip}"
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
