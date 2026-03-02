import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { experience } = body;

        if (!experience || !Array.isArray(experience)) {
            return NextResponse.json({ error: "Invalid experience data provided." }, { status: 400 });
        }

        const prompt = `
You are an expert executive resume writer.
The user has provided their professional experience background below in JSON form.
Your task is to write a highly compelling, ATS-optimized "Professional Summary" paragraph.
CRITICAL CONSTRAINT: The summary MUST be strictly between 50 and 80 words long. This is a hard limit.
It should perfectly capture their career trajectory, key skills, and greatest impacts based *only* on the provided experience.
Do not use generic buzzwords; focus on concrete achievements, leadership qualities, and core technologies mentioned.

Return ONLY the plain text summary. Do not include quotes, prefixes, or conversational text.

USER EXPERIENCE LOG:
${JSON.stringify(experience, null, 2)}
`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are an expert ATS resume writer." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 400,
        });

        const summary = completion.choices[0]?.message?.content?.trim();

        if (!summary) {
            throw new Error("Failed to generate summary.");
        }

        return NextResponse.json({ summary });
    } catch (error: any) {
        console.error("Error generating summary:", error);
        return NextResponse.json({ error: error.message || "Failed to generate summary" }, { status: 500 });
    }
}
