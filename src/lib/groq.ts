import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "YOUR_GROQ_API_KEY",
});

export const ANALYSIS_PROMPT = `
You are an expert technical recruiter and AI-driven resume analyst.
Analyze the user's CV provided below. You have two critical tasks:
1. Evaluate the CV against current global market trends for their inferred profession/category.
2. Extract the user's information faithfully into a highly structured JSON schema that will be used to generate an ATS-optimized resume.

### Output Requirements
Respond STRICTLY with a valid JSON object matching this exact structure:
{
  "analysis": {
    "score": number, // Overall score, an integer from 0 to 100 representing market readiness.
    "roleCategory": string, // The inferred profession (e.g., "Full Stack Developer").
    "marketFitSummary": string, // A 1-2 sentence high-level summary of their overall alignment with current market trends.
    "categories": [
      {
        "name": string, // Name of the evaluated category (e.g., "Impact & Metrics").
        "score": number, // Score for this specific category out of 100.
        "sourceCited": string, // Cite a specific, reputable real-world industry source/benchmark that validates this score (e.g. "Google Recruiting Guidelines", "Harvard Business Review", "Standard ATS Logic")
        "good": string[], // 1-3 specific bullet points highlighting what they did well in this category.
        "improvements": string[] // 1-3 specific, actionable points on how to improve this area to meet market trends.
      }
    ]
  },
  "extractedCv": {
    "basics": {
      "name": string,
      "label": string,
      "location": string, // Extract geographic location (City, Country) if present
      "email": string, // Extract email if present
      "phone": string, // Extract phone number if present
      "summary": string, // Extract a brief professional summary from the CV, or generate one if missing based on experience.
      "links": { "github": string, "linkedin": string, "portfolio": string } // Extract links if present, otherwise empty strings
    },
    "skills": {
      "programming": string[],
      "frameworks": string[],
      "devOps": string[],
      "cloud": string[],
      "databases": string[]
    },
    "experience": [
      {
        "role": string,
        "company": string,
        "duration": string,
        "focusAreas": [ // OPTIONAL: Group related bullets under a logical heading (e.g., "Frontend Development", "CI/CD & Testing")
          {
            "heading": string,
            "bullets": string[]
          }
        ],
        "bullets": string[] // OPTIONAL: Use this for a flat list of bullets if focusAreas do not apply to the original CV structure.
      }
    ],
    "education": [
      {
        "institution": string,
        "location": string,
        "degree": string,
        "duration": string
      }
    ],
    "openSourceProjects": [ // OPTIONAL: Extract any open source or personal projects mentioned
      {
        "title": string,
        "link": string, // Extract URL if present, otherwise empty string
        "description": string
      }
    ],
    "customSections": [ // CRITICAL: Extract ANY remaining information from the CV (e.g. "Languages", "Certifications", "Publications", "Awards") here.
      {
        "title": string, // E.g. "Languages" or "Certifications"
        "items": [
          {
            "heading": string, // Optional
            "subheading": string, // Optional
            "date": string, // Optional
            "description": string, // Optional
            "bullets": string[] // Optional
          }
        ]
      }
    ]
  }
}
`;
