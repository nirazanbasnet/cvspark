import { CheckCircle2, TrendingUp, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type SuggestionType = "success" | "info" | "warning" | "error";

interface Suggestion {
    type: SuggestionType;
    title: string;
    description: string;
}

const defaultSuggestions: Suggestion[] = [
    {
        type: "success",
        title: "Strong Technical Skills",
        description: "Your technical skills section is comprehensive and includes in-demand technologies like React, Docker, and Kubernetes."
    },
    {
        type: "info",
        title: "Add Quantifiable Metrics",
        description: "Include more specific numbers and percentages. For example, 'Reduced deployment time by 60%' is stronger than 'Improved deployment process'."
    },
    {
        type: "warning",
        title: "Missing Cloud Certifications",
        description: "Consider adding AWS or Azure certifications to strengthen your cloud computing credentials for senior roles."
    },
    {
        type: "info",
        title: "Highlight Leadership Experience",
        description: "Emphasize your team leadership and mentorship experiences more prominently, especially for senior positions."
    }
];

export function AISuggestions({ suggestions = defaultSuggestions }: { suggestions?: Suggestion[] }) {
    const getTypeStyles = (type: SuggestionType) => {
        switch (type) {
            case "success":
                return {
                    bg: "bg-green-50/50",
                    border: "border-green-200",
                    iconColor: "text-green-500",
                    titleColor: "text-green-900",
                    Icon: CheckCircle2
                };
            case "warning":
                return {
                    bg: "bg-orange-50/50",
                    border: "border-orange-200",
                    iconColor: "text-orange-500",
                    titleColor: "text-orange-900",
                    Icon: AlertTriangle
                };
            case "error":
                return {
                    bg: "bg-red-50/50",
                    border: "border-red-200",
                    iconColor: "text-red-500",
                    titleColor: "text-red-900",
                    Icon: AlertCircle
                };
            case "info":
            default:
                return {
                    bg: "bg-blue-50/50",
                    border: "border-blue-200",
                    iconColor: "text-blue-500",
                    titleColor: "text-blue-900",
                    Icon: TrendingUp
                };
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-1">
                <span className="text-amber-500">💡</span>
                <h3 className="text-lg font-bold text-neutral-900">AI Suggestions</h3>
            </div>

            <div className="flex flex-col gap-3">
                {suggestions.map((suggestion, idx) => {
                    const styles = getTypeStyles(suggestion.type);
                    const Icon = styles.Icon;

                    return (
                        <div
                            key={idx}
                            className={cn(
                                "flex gap-3 p-4 rounded-xl border",
                                styles.bg,
                                styles.border
                            )}
                        >
                            <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", styles.iconColor)} />
                            <div className="flex flex-col gap-1">
                                <h4 className={cn("text-sm font-bold", styles.titleColor)}>
                                    {suggestion.title}
                                </h4>
                                <p className="text-xs text-neutral-600 leading-relaxed">
                                    {suggestion.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
