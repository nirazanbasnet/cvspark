import { NextResponse } from "next/server";
// @ts-expect-error - pdf-parse typings are inconsistent across environments
import pdfParse from "pdf-parse";
import { groq, ANALYSIS_PROMPT } from "@/lib/groq";

// Polyfill for pdf-parse "DOMMatrix is not defined" error in Next.js Node environment
if (typeof global !== "undefined" && !global.DOMMatrix) {
    (global as any).DOMMatrix = class DOMMatrix {
        constructor() { }
    };
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        let userCvText = formData.get("text") as string | null;

        if (!file && !userCvText) {
            return NextResponse.json({ error: "No file or text provided" }, { status: 400 });
        }

        // Try standard text extraction from file first if text is not directly provided
        if (file && !userCvText) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const pdfData = await pdfParse(buffer);
            userCvText = pdfData.text;

            // OCR FALLBACK: If extracted text is suspiciously short, it might be an image-based PDF
            if (!userCvText || userCvText.trim().length < 100) {
                console.log("Empty or short PDF text detected. Signaling frontend to OCR.");
                // Return immediately so the frontend knows to perform client-side OCR
                return NextResponse.json({ requiresOcr: true });
            }
        }

        // Call Groq API to analyze the CV against Market Trends
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: ANALYSIS_PROMPT },
                {
                    role: "user",
                    content: `User CV Transcript:\n${userCvText || ""}`
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const resultString = completion.choices[0]?.message?.content || "{}";
        const result = JSON.parse(resultString);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error analyzing CV:", error);
        return NextResponse.json({ error: error.message || "Failed to analyze CV" }, { status: 500 });
    }
}
