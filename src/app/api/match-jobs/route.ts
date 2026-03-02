import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import fs from 'fs';
import path from 'path';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { resumeText, primaryRole } = await req.json();

        if (!resumeText) {
            return NextResponse.json(
                { error: 'Resume text is required' },
                { status: 400 }
            );
        }

        if (!process.env.GROQ_API_KEY) {
            return NextResponse.json(
                { error: 'Server configuration error: GROQ API Key missing' },
                { status: 500 }
            );
        }

        // Dynamically read the jobs database to get the freshest background-scraped data
        let allJobs = [];
        try {
            const JOBS_FILE = path.join(process.cwd(), 'src/data/jobs.json');
            allJobs = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf-8'));
        } catch (e) {
            console.error("Failed to read jobs.json:", e);
        }

        // Prepare a concise version of the jobs for the prompt
        // We only send id, title, company, and description to reduce token usage
        const promptJobs = allJobs.map((job: any) => ({
            id: job.id,
            title: job.title,
            company: job.company,
            description: job.description,
        }));

        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an expert technical recruiter and AI job matching assistant. Your task is to evaluate a candidate's resume against a list of open job positions.
          
Compare the provided resume against the provided jobs. Calculate a match percentage (0-100) based on skills, experience, and role alignment.
Return a valid JSON array of all matching jobs, sorted highest percentage to lowest.
Include ONLY jobs with a match percentage > 0%. (No arbitrary limit, return as many as possible).

The JSON MUST follow this exact schema:
{
  "matches": [
    {
      "jobId": "the_job_id_from_provided_list",
      "matchPercentage": 85,
      "reason": "1-2 short sentences explaining why the candidate is a strong fit based on their specific skills."
    }
  ]
}
No markdown wrapping, just raw JSON.`,
                },
                {
                    role: 'user',
                    content: `CANDIDATE RESUME TEXT:
${resumeText.substring(0, 4000)} // Truncate to save tokens

AVAILABLE JOBS:
${JSON.stringify(promptJobs)}

Return ONLY the JSON.`,
                },
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.1, // Keep it deterministic
            response_format: { type: "json_object" },
        });

        const aiContent = response.choices[0]?.message?.content;
        let matches = [];

        try {
            // Handle cases where the model returns `{ "matches": [...] }` instead of just `[...]`
            const parsed = JSON.parse(aiContent || '[]');
            matches = Array.isArray(parsed) ? parsed : (parsed.matches || Object.values(parsed)[0] || []);
        } catch (e) {
            console.error("Failed to parse Groq response:", aiContent);
            throw new Error("Failed to parse AI response");
        }

        // Hydrate the matches with the full job data
        const enrichedMatches = matches.map((match: any) => {
            const fullJobData = allJobs.find((j: any) => j.id === match.jobId);
            return {
                ...match,
                job: fullJobData,
            };
        }).filter((m: any) => m.job != null); // Remove if the LLM hallucinates an ID

        return NextResponse.json({ matches: enrichedMatches });

    } catch (error: any) {
        console.error('Error matching jobs:', error);
        return NextResponse.json(
            { error: 'Failed to find job matches', details: error.message },
            { status: 500 }
        );
    }
}
