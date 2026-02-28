import React, { useState } from 'react';
import { Briefcase, Building2, MapPin, Loader2, ExternalLink, ChevronRight, X } from 'lucide-react';

interface JobMatch {
    jobId: string;
    matchPercentage: number;
    reason: string;
    job: {
        id: string;
        title: string;
        company: string;
        location: string;
        link: string;
        description: string;
        source: string;
    };
}

interface JobMatchesProps {
    resumeText: string;
    primaryRole?: string;
}

export const JobMatches: React.FC<JobMatchesProps> = ({ resumeText, primaryRole }) => {
    const [matches, setMatches] = useState<JobMatch[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasScanned, setHasScanned] = useState(false);

    React.useEffect(() => {
        if (resumeText && !hasScanned && !loading) {
            fetchMatches();
        }
    }, [resumeText, hasScanned]);

    const fetchMatches = async () => {
        if (!resumeText) return;

        setLoading(true);
        setError(null);
        setHasScanned(true);

        try {
            const response = await fetch('/api/match-jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText, primaryRole }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch job matches');
            }

            const data = await response.json();
            setMatches(data.matches || []);
        } catch (err: any) {
            setError(err.message || 'An error occurred while finding matches.');
        } finally {
            setLoading(false);
        }
    };

    const getPercentageColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        Job Matches
                    </h2>
                    <p className="text-sm text-slate-500">
                        Find real open positions that match your resume profile.
                    </p>
                </div>

            </div>

            {hasScanned && (
                <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-sm font-medium text-slate-700">
                            {loading ? 'Scanning top job portals...' : `Found ${matches.length} strong matches based on your profile.`}
                        </span>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    {!loading && !error && matches.length === 0 && (
                        <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-200">
                            <Briefcase className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-slate-700">No strong matches right now</h3>
                            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                                We couldn't find available jobs that closely align with your current resume. Check back later or adjust your resume targeting.
                            </p>
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        {matches.map((match, idx) => (
                            <div key={`${match.jobId}-${idx}`} className="flex flex-col overflow-hidden hover:border-primary/50 transition-colors border-slate-200 border rounded-xl bg-white shadow-sm">
                                <div className="p-4 pb-3 border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold leading-tight mb-1 text-slate-800">
                                                {match.job?.title || 'Unknown Position'}
                                            </h3>
                                            <p className="flex items-center gap-1.5 text-slate-600 text-sm">
                                                <Building2 className="h-3.5 w-3.5" />
                                                {match.job?.company || 'Unknown Company'}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getPercentageColor(match.matchPercentage)}`}>
                                            {match.matchPercentage}% Match
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {match.job?.location || 'Nepal'}</span>
                                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium uppercase tracking-wider">{match.job?.source}</span>
                                    </div>
                                </div>

                                <div className="p-4 pt-4 flex-1">
                                    <div className="mb-4">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-500 mb-1.5">Why it's a match</h4>
                                        <p className="text-sm text-slate-700 bg-rose-50 p-3 rounded-md border border-rose-100 leading-relaxed">
                                            {match.reason}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Job Overview</h4>
                                        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                                            {match.job?.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center pt-3 pb-4 px-6 border-t border-slate-100 bg-slate-50/50 mt-auto">
                                    <a
                                        href={match.job?.link || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full text-center flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-medium py-2 rounded-md transition-all text-sm"
                                    >
                                        View Full Details & Apply <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
