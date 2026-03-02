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

        // --- BACKGROUND SCRAPER (Fire-and-forget) ---
        // Pre-warm the jobs database with 20 relevant jobs for this specific user's role
        const role = result.analysis?.roleCategory;
        if (role) {
            void (async () => {
                try {
                    console.log(`[Background] Initiating async scrape for 20 jobs matching role: ${role}`);

                    const { scrapeLinkedInJobs } = await import("@/lib/linkedinScraper");
                    const fs = await import("fs");
                    const path = await import("path");

                    // Scrape 20 jobs
                    const scrapedJobs = await scrapeLinkedInJobs(role, 'Nepal', 20);

                    if (scrapedJobs.length > 0) {
                        const JOBS_FILE = path.join(process.cwd(), 'src/data/jobs.json');
                        let existingJobs: any[] = [];

                        try {
                            if (fs.existsSync(JOBS_FILE)) {
                                existingJobs = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf-8'));
                            }
                        } catch (e) {
                            console.error("[Background] Failed to read existing jobs:", e);
                        }

                        // Merge scraped jobs with existing, removing duplicates by ID
                        const allJobs = [...scrapedJobs, ...existingJobs];
                        const uniqueJobs = Array.from(new Map(allJobs.map(j => [j.id, j])).values());

                        // Ensure directory exists
                        fs.mkdirSync(path.dirname(JOBS_FILE), { recursive: true });
                        fs.writeFileSync(JOBS_FILE, JSON.stringify(uniqueJobs, null, 2), 'utf-8');

                        console.log(`[Background] Successfully injected ${scrapedJobs.length} new jobs into jobs.json for role: ${role}`);
                    }
                } catch (e) {
                    console.error("[Background] Async scrape failed:", e);
                }
            })();
        }
        // --------------------------------------------

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error analyzing CV:", error);
        return NextResponse.json({ error: error.message || "Failed to analyze CV" }, { status: 500 });
    }
}
