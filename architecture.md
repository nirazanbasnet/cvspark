# CV Spark (Score Builder) - Project Architecture

## 1. Overview
CV Spark is an AI-powered Resume Analyzer, Score Builder, and Job Matching SaaS application. 
It analyzes a user's uploaded CV (PDF format) against a "Gold Standard" benchmark, calculates readiness and market scores, suggests AI-generated actionable improvements, and automatically matches the profile with real-world scraped jobs.

---

## 2. Tech Stack
*   **Framework:** Next.js 16.1 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4
*   **Authentication:** Clerk (`@clerk/nextjs`)
*   **AI/LLM:** Groq SDK (`llama-3.3-70b-versatile`)
*   **PDF Extraction:** `pdf-parse`, `pdfjs-dist`, `tesseract.js` (for OCR on image-based PDFs)
*   **Web Scraping:** `puppeteer`, `cheerio`
*   **PDF Generation:** `html2pdf.js`
*   **State Management:** React Context API (`CvContext.tsx`)
*   **Local Storage:** `localforage`
*   **Package Manager:** Bun / npm

---

## 3. Directory Structure

```text
cv-score-builder/
├── src/
│   ├── app/                 # Next.js App Router (Pages, Layouts, API Routes)
│   │   ├── api/             # Backend endpoints (analyze, generate-summary, match-jobs, scrape-custom, suggest-bullet)
│   │   ├── builder/         # CV Builder/Editor interface
│   │   ├── dashboard/       # Scraper and admin dashboards
│   │   ├── score/[id]/      # Dynamic CV scoring and breakdown page
│   │   ├── layout.tsx       # Root layout with Clerk Auth Provider
│   │   ├── page.tsx         # Landing page / Document upload
│   │   └── globals.css      # Global Tailwind configuration
│   ├── components/          # Reusable UI components
│   │   ├── builder/         # Components specific to CV editing (ExperienceEditor, etc.)
│   │   ├── dashboard/       # Dashboard components (MarketReadinessScore, ResumeViewer, JobMatches)
│   │   └── ui/              # Generic UI elements (Buttons, Modals, Forms)
│   ├── context/             # Global Application State (CvContext)
│   ├── data/                # Static/Scraped Data (e.g., jobs.json)
│   ├── lib/                 # Utility functions, AI Clients, PDF Parsing 
│   │   ├── groq.ts          # Groq configuration and Prompts
│   │   ├── ocr.ts           # Tesseract.js Image-to-Text extraction
│   │   └── utils.ts         # Tailwind/clsx class merging
│   ├── types/               # TypeScript interfaces (GoldStandardResume, AnalysisData)
│   └── proxy.ts             # Clerk Next.js Middleware configuration
├── scripts/                 # Standalone backend scripts 
│   ├── scrape_jobs.mjs      # Cheerio-based scraper
│   └── scrape_linkedin.mjs  # Puppeteer-based dynamic scraper
├── tests/                   # Ad-hoc test scripts for parsing, API generation, etc.
├── sample-cv/               # Reference benchmarks (e.g., sample-cv.pdf)
└── public/                  # Static assets
```

---

## 4. Key Workflows

### A. CV Upload & Extracted Analysis
1. User uploads a PDF on the homepage.
2. The `/api/analyze` route receives the file.
3. `pdf-parse` extracts text. If text is sparse, `tesseract.js` (OCR) runs on the client to extract text from images.
4. The extracted text is mapped to a strict JSON structure via Groq LLM (prompted by the Gold Standard `parsed_gold_cv.txt`).
5. Context state (`CvContext`) saves the parsed data, and the user routes to `/score/[id]`.

### B. Scoring & Feedback Generation
1. Inside the analysis step, the AI calculates a `score` out of 100 based on the sample benchmark.
2. It assigns an `averageMarketScore` for perspective.
3. An `improvements` array maps specific text inside the CV (`originalText`) to AI-generated rewrites (`recommendedText`) applying the Gold Standard syntax.

### C. The Editor ("CV Spark Builder")
1. Editing state lives entirely in the browser for speed.
2. The `/api/suggest-bullet` and `/api/generate-summary` routes help combat writer's block by using Groq to build professional content from scratch.
3. `html2pdf.js` bundles the DOM and exports a highly-parseable PDF on "Download".

### D. Job Matching & Scraping
1. Real jobs are periodically scraped into `src/data/jobs.json` via Node scripts inside `/scripts`.
2. Dynamic scraping via Puppeteer happens on the `/api/match-jobs` and `/api/scrape-custom` endpoints.
3. The LLM compares the parsed `GoldStandardResume` against the available jobs to formulate Match Percentages and reasoning.

---

## 5. Development Commands

### Installation
Ensure dependencies are installed (works with `bun` or `npm`):
```bash
bun install
# or
npm install
```

### Running the Application
To run the local development server (with Turbopack caching):
```bash
bun run dev
# or 
npm run dev
```

### Production Build
To create an optimized production build:
```bash
bun run build
# or
npm run build
```

### Running Scrapers
To execute the background web scrapers and update the `jobs.json` local database:
```bash
node scripts/scrape_jobs.mjs
# or
node scripts/scrape_linkedin.mjs
```

---

## 6. Environment Variables (`.env.local`)
Required environments for the application to function correctly:

```env
# Groq API for Fast LLM Inference (llama-3.3-70b-versatile)
GROQ_API_KEY=your_groq_api_key

# Clerk Authentication Keys (used for the /builder route)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```
