import { AnalysisData } from "@/context/CvContext";

export function KeywordHeatmap({ categories }: { categories: AnalysisData["categories"] }) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex flex-col gap-4">
            <div>
                <h3 className="text-lg font-bold text-neutral-900">Keyword Heatmap</h3>
                <p className="text-xs text-neutral-500">Your keywords vs. top 10% of job descriptions</p>
            </div>

            <div className="flex flex-col gap-6 mt-4">
                {categories.slice(0, 5).map((category, idx) => {
                    // Mocking target values slightly above current for visual effect 
                    // (in a real app this would come from the API/Gold Standard)
                    const targetScore = Math.min(10, category.score + Math.floor(Math.random() * 3) + 1);
                    const diff = targetScore - category.score;

                    return (
                        <div key={idx} className="flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-semibold text-neutral-700">{category.name}</span>
                                {diff > 0 ? (
                                    <span className="text-[10px] font-bold text-orange-500">+{diff} needed</span>
                                ) : (
                                    <span className="text-[10px] font-bold text-green-500">Optimal</span>
                                )}
                            </div>

                            {/* "You" Bar */}
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-neutral-400 w-8">You</span>
                                <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${diff > 2 ? 'bg-orange-400' : 'bg-green-500'
                                            }`}
                                        style={{ width: `${(category.score / 10) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs font-medium text-neutral-700 w-4 text-right">{category.score}</span>
                            </div>

                            {/* "Top 10%" Bar */}
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-neutral-400 w-8">Top<br />10%</span>
                                <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-blue-600 transition-all duration-1000"
                                        style={{ width: `${(targetScore / 10) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs font-medium text-neutral-700 w-4 text-right">{targetScore}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
