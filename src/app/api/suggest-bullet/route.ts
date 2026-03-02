import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";

const SUGGESTION_PROMPT = `
You are an elite Technical Ghostwriter and strict Resume Expert.
The user needs a single, brand new, highly professional resume bullet point. The bullet must be written using the strict "Sample Formula":
[Action Verb] + [Specific Technology/Process] + [Quantifiable Result/Optimization/Impact].

You will be provided with the user's Job Title (and optionally a specific Task/Project Area they are working on), as well as any bullets they already have for this role.
YOUR CRITICAL DIRECTIVE: The generated bullet MUST cover a COMPLETELY DIFFERENT skill, scenario, or angle than the existing bullets. 
If they already have a bullet about "performance optimization", write one about "leadership", "feature development", "bug fixing", "tool integration", or "revenue impact". Do NOT repeat the same theme.
Generate ONE powerful, realistic bullet point that a top-tier candidate in this role would have on their CV. Make up reasonable, impressive metrics (e.g. "reduced latency by 40%", "managed a team of 5", "driving $1.2M in recurring revenue").

Respond ONLY with the generated bullet point in plain text. Do NOT add any extra commentary, introductory phrases, quotation marks, or list formatting. Keep it to one single, powerful sentence.
`;

export async function POST(req: Request) {
    try {
        const { role, taskHeading, existingBullets } = await req.json();

        if (!role) {
            return NextResponse.json({ error: "No role provided" }, { status: 400 });
        }

        let inputContent = `Job Title: "${role}"`;
        if (taskHeading) {
            inputContent += `\nSpecific Task/Focus Area: "${taskHeading}"`;
        }
        if (existingBullets && existingBullets.length > 0) {
            inputContent += `\n\nExisting Bullets (DO NOT REPEAT THESE THEMES):\n${existingBullets.map((b: string) => `- ${b}`).join('\n')}`;
        }

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SUGGESTION_PROMPT },
                { role: "user", content: inputContent }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7, // Higher temp because we are generating net-new creative content
        });

        const suggestion = completion.choices[0]?.message?.content?.trim() || "";

        return NextResponse.json({ suggestion });
    } catch (error) {
        console.error("Error suggesting bullet:", error);
        return NextResponse.json({ error: "Failed to suggest bullet point" }, { status: 500 });
    }
}
