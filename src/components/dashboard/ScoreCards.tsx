import { AnalysisData } from "@/context/CvContext";
import { MarketReadinessScore } from "./MarketReadinessScore";
import { KeywordHeatmap } from "./KeywordHeatmap";
import { ImpactMeter } from "./ImpactMeter";
import { BenchmarkComparison } from "./BenchmarkComparison";
import { AISuggestions } from "./AISuggestions";

export function ScoreCards({ analysisData }: { analysisData: AnalysisData }) {
    return (
        <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-12">
            <MarketReadinessScore analysisData={analysisData} />
            <KeywordHeatmap categories={analysisData.categories} />
            <ImpactMeter score={Math.max(0, analysisData.score - 13)} />
            <BenchmarkComparison />
            <AISuggestions />
        </div>
    );
}
