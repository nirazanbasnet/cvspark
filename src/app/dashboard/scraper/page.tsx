"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Database, Globe, Layers, Loader2, Play, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ScraperDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<{ total: number; sources: Record<string, any[]> } | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [expandedSource, setExpandedSource] = useState<string | null>(null);

    const [scrapeForm, setScrapeForm] = useState({
        url: "",
        cardSelector: "",
        titleSelector: "",
        companySelector: "",
        renderMode: "html" // 'html' or 'puppeteer'
    });
    const [isScraping, setIsScraping] = useState(false);
    const [scrapeResult, setScrapeResult] = useState<{ success: boolean; message: string } | null>(null);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const res = await fetch("/api/jobs-stats");
            const data = await res.json();
            setStats(data);
        } catch (e) {
            console.error("Failed to fetch stats", e);
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleScrapeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsScraping(true);
        setScrapeResult(null);

        try {
            const res = await fetch("/api/scrape-custom", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(scrapeForm)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to scrape");

            setScrapeResult({ success: true, message: data.message });
            fetchStats(); // refresh counts
        } catch (err: any) {
            setScrapeResult({ success: false, message: err.message });
        } finally {
            setIsScraping(false);
        }
    };

    return (
        <main className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="flex-none h-16 border-b border-white/5 bg-neutral-900/50 px-6 flex items-center justify-between z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/")}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-neutral-400"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold flex items-center gap-2">
                        <Database className="w-5 h-5 text-rose-500" />
                        Scraping Status Dashboard
                    </h1>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar flex flex-col lg:flex-row gap-8">

                {/* Left Pane - Stats Overview */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl -z-10 rounded-full"></div>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-rose-400" />
                            Database Status
                        </h2>

                        {loadingStats ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm text-neutral-400 uppercase tracking-wide font-medium mb-1">Total Indexed Jobs</p>
                                    <p className="text-4xl font-extrabold text-white">{stats?.total || 0}</p>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-sm text-neutral-400 uppercase tracking-wide font-medium mb-2">Sources Overview</p>
                                    {stats?.sources && Object.entries(stats.sources).map(([source, jobsArray]) => (
                                        <div key={source} className="flex flex-col bg-black/20 rounded-lg border border-white/5 overflow-hidden">
                                            <button
                                                onClick={() => setExpandedSource(expandedSource === source ? null : source)}
                                                className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors text-left"
                                            >
                                                <span className="flex items-center gap-2 text-sm font-medium">
                                                    <Globe className="w-4 h-4 text-neutral-500" />
                                                    {source}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-rose-500/20 text-rose-400 px-2.5 py-1 rounded-md text-xs font-bold">
                                                        {jobsArray.length}
                                                    </span>
                                                </div>
                                            </button>

                                            {expandedSource === source && (
                                                <div className="p-3 border-t border-white/5 bg-black/40 max-h-64 overflow-y-auto custom-scrollbar">
                                                    <ul className="space-y-2">
                                                        {jobsArray.map((job: any, idx: number) => (
                                                            <li key={idx} className="text-xs text-neutral-300 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                                                <a href={job.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-rose-400 hover:underline block mb-0.5">
                                                                    {job.title}
                                                                </a>
                                                                <span className="text-neutral-500">{job.company}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(!stats?.sources || Object.keys(stats.sources).length === 0) && (
                                        <div className="text-sm text-neutral-500 italic">No job sources found in the database.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Pane - Custom Scraper */}
                <div className="w-full lg:w-2/3 flex flex-col gap-6">
                    <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-xl">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white mb-2">Custom Dynamic Scraper</h2>
                            <p className="text-sm text-neutral-400">Target a specific URL and extract job details dynamically without touching code.</p>
                        </div>

                        <form onSubmit={handleScrapeSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Target URL</label>
                                <input
                                    type="url" required
                                    value={scrapeForm.url}
                                    onChange={(e) => setScrapeForm({ ...scrapeForm, url: e.target.value })}
                                    placeholder="https://examplejobboard.com/tech-jobs"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1.5 flex justify-between">
                                        Job Card Wrapper Selector
                                        <span className="text-[10px] bg-white/10 uppercase px-1.5 py-0.5 rounded text-neutral-400">Required</span>
                                    </label>
                                    <input
                                        type="text" required
                                        value={scrapeForm.cardSelector}
                                        onChange={(e) => setScrapeForm({ ...scrapeForm, cardSelector: e.target.value })}
                                        placeholder=".job-list-item, article.job"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1.5 flex justify-between">
                                        Job Title Selector
                                        <span className="text-[10px] bg-white/10 uppercase px-1.5 py-0.5 rounded text-neutral-400">Required</span>
                                    </label>
                                    <input
                                        type="text" required
                                        value={scrapeForm.titleSelector}
                                        onChange={(e) => setScrapeForm({ ...scrapeForm, titleSelector: e.target.value })}
                                        placeholder="h2.title a, .job-title"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors font-mono text-sm"
                                    />
                                    <p className="text-[11px] text-neutral-500 mt-1 italic">Relative to Job Card Wrapper</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1.5 flex justify-between">
                                        Company Selector
                                        <span className="text-[10px] bg-white/5 uppercase px-1.5 py-0.5 rounded text-neutral-500">Optional</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={scrapeForm.companySelector}
                                        onChange={(e) => setScrapeForm({ ...scrapeForm, companySelector: e.target.value })}
                                        placeholder=".company-name, span.employer"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Rendering Mode</label>
                                    <select
                                        value={scrapeForm.renderMode}
                                        onChange={(e) => setScrapeForm({ ...scrapeForm, renderMode: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 transition-colors appearance-none"
                                    >
                                        <option value="html">Fast HTML (Cheerio) - Best for static sites</option>
                                        <option value="puppeteer">Full Browser (Puppeteer) - For Anti-Bot/SPA</option>
                                    </select>
                                </div>
                            </div>

                            {scrapeResult && (
                                <div className={`p-4 rounded-lg flex items-start gap-3 border ${scrapeResult.success ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                    {scrapeResult.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                                    <p className="text-sm font-medium leading-relaxed">{scrapeResult.message}</p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-white/10">
                                <button
                                    type="submit"
                                    disabled={isScraping || !scrapeForm.url || !scrapeForm.cardSelector || !scrapeForm.titleSelector}
                                    className="bg-rose-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                                >
                                    {isScraping ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Executing Scrape...</>
                                    ) : (
                                        <><Play className="w-4 h-4" /> Start Custom Scrape</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-5">
                        <h4 className="text-sm font-bold text-rose-400 mb-2">Pro Tip</h4>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                            If the target website shows a Cloudflare screen or requires javascript to render the job cards, make sure to switch the Rendering Mode to <strong>Full Browser (Puppeteer)</strong>. This will run an actual headless browser to bypass protections before grabbing your mapped CSS selectors.
                        </p>
                    </div>
                </div>

            </div>
        </main>
    );
}
