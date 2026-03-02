import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";

const GHOSTWRITER_PROMPT = `
You are an elite Technical Ghostwriter and strict Resume Expert.
Your task is to rewrite the user's job experience bullet point using the strict "Sample Formula":
[Action Verb] + [Specific Technology] + [Quantifiable Result/Optimization].

Example 1:
Input: "I made the website faster."
Output: Improved Webpack build times by leveraging caching and optimizing the inclusion of only necessary files and folders.

Example 2:
Input: "I set up a database."
Output: Managed the migration of file-based sessions to Redis via a database intermediary, improving system performance and scalability.

Respond ONLY with the rewritten, highly professional bullet point in plain text. Do NOT add any extra commentary, introductory phrases, quotation marks, or list formatting. Keep it to one single, powerful sentence.
`;

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: GHOSTWRITER_PROMPT },
                { role: "user", content: `Input: "${text}"` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
        });

        const suggestion = completion.choices[0]?.message?.content?.trim() || text;

        return NextResponse.json({ suggestion });
    } catch (error) {
        console.error("Error improving bullet:", error);
        return NextResponse.json({ error: "Failed to improve bullet point" }, { status: 500 });
    }
}
