import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";

export const maxDuration = 60;

const JD_ANALYSIS_PROMPT = `
You are an expert technical recruiter and ATS specialist.
Your task is to compare a candidate's CV against a specific Job Description (JD).

Inputs:
1. Candidate CV Text
2. Job Description Text

You must analyze the match and provide an objective assessment in JSON format:
{
  "skillMatchPercentage": number, // 0-100 indicating how well the CV skills align with JD requirements
  "gapAnalysis": [
    {
      "missingSkill": string, // Explicit skill or requirement missing from CV
      "importance": "Critical" | "High" | "Medium" | "Low", // Importance of this gap based on JD
      "recommendation": string // Actionable advice to address this gap (e.g. "Add project X to emphasize Y")
    }
  ],
  "recommendation": "Strong Apply" | "Apply" | "Stretch" | "Do Not Apply", // Final verdict
  "summary": string // 2-3 sentence summary of the fit
}

Be brutally honest but constructive. DO NOT HALUCINATE skills that aren't in the CV.
`;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { cvText, jdText } = body;

        if (!cvText || !jdText) {
            return NextResponse.json({ error: "Missing CV text or JD text" }, { status: 400 });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: JD_ANALYSIS_PROMPT },
                {
                    role: "user",
                    content: `Target Job Description:\n${jdText}\n\n---\n\nCandidate CV:\n${cvText}`
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            max_tokens: 4000,
            response_format: { type: "json_object" }
        });

        const resultString = completion.choices[0]?.message?.content || "{}";
        const result = JSON.parse(resultString);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error analyzing JD fit:", error);
        return NextResponse.json({ error: error.message || "Failed to analyze JD fit" }, { status: 500 });
    }
}
