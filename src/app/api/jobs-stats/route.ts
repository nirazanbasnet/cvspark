import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const file = path.join(process.cwd(), 'src/data/jobs.json');
        if (!fs.existsSync(file)) return NextResponse.json({ total: 0, sources: {} });

        const jobs = JSON.parse(fs.readFileSync(file, 'utf-8'));
        const sources: Record<string, any[]> = {};

        jobs.forEach((j: any) => {
            const src = j.source || 'Unknown';
            if (!sources[src]) {
                sources[src] = [];
            }
            sources[src].push(j);
        });

        return NextResponse.json({ total: jobs.length, sources });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
