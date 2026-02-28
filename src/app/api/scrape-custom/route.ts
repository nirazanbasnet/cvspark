import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const JOBS_FILE = path.join(process.cwd(), 'src/data/jobs.json');

export async function POST(req: Request) {
    let browser;
    try {
        const body = await req.json();
        const { url, cardSelector, titleSelector, companySelector, renderMode = 'html' } = body;

        if (!url || !cardSelector || !titleSelector) {
            return NextResponse.json({ error: 'URL, Card Selector, and Title Selector are required.' }, { status: 400 });
        }

        let jobs = [];
        const domain = new URL(url).hostname;

        if (renderMode === 'puppeteer') {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

            // Optional wait for card selector
            await page.waitForSelector(cardSelector, { timeout: 10000 }).catch(() => console.log('Timeout waiting for card selector. Continuing anyway.'));

            jobs = await page.evaluate((cs, ts, cos, sourceDomain) => {
                const results: any[] = [];
                const cards = document.querySelectorAll(cs);

                cards.forEach((card, index) => {
                    const titleEl = card.querySelector(ts) as HTMLElement;
                    const companyEl = cos ? (card.querySelector(cos) as HTMLElement) : null;
                    const linkEl = card.querySelector('a') as HTMLAnchorElement;

                    const title = titleEl ? titleEl.innerText.trim() : '';
                    if (title) {
                        results.push({
                            id: `custom-${Date.now()}-${index}`,
                            title,
                            company: companyEl ? companyEl.innerText.trim() : 'Unknown Company',
                            location: 'Nepal', // Defaulting for MVP
                            link: linkEl ? linkEl.href : url,
                            description: `Scraped position: ${title}`,
                            source: sourceDomain
                        });
                    }
                });
                return results;
            }, cardSelector, titleSelector, companySelector, domain);

        } else {
            // Fast Cheerio Scrape
            const res = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            if (!res.ok) throw new Error(`Failed to fetch URL. Status: ${res.status}`);

            const html = await res.text();
            const $ = cheerio.load(html);

            $(cardSelector).each((index, element) => {
                const title = $(element).find(titleSelector).text().trim();
                const company = companySelector ? $(element).find(companySelector).text().trim() : 'Unknown Company';
                const href = $(element).find('a').attr('href');
                let link = url;
                if (href) {
                    link = href.startsWith('http') ? href : new URL(href, url).href;
                }

                if (title) {
                    jobs.push({
                        id: `custom-${Date.now()}-${index}`,
                        title,
                        company: company || 'Unknown Company',
                        location: 'Nepal',
                        link: link,
                        description: `Scraped position: ${title}`,
                        source: domain
                    });
                }
            });
        }

        // Save to jobs.json
        if (jobs.length > 0) {
            let existingJobs = [];
            try {
                if (fs.existsSync(JOBS_FILE)) {
                    const fileContent = fs.readFileSync(JOBS_FILE, 'utf-8');
                    existingJobs = JSON.parse(fileContent);
                }
            } catch (e) {
                console.error("Error reading existing jobs.json", e);
            }

            // Deduplicate by title to avoid spamming the same jobs
            const newJobs = jobs.filter((newJob: any) => !existingJobs.find((existing: any) => existing.title === newJob.title && existing.company === newJob.company));

            const allJobs = [...newJobs, ...existingJobs];

            fs.mkdirSync(path.dirname(JOBS_FILE), { recursive: true });
            fs.writeFileSync(JOBS_FILE, JSON.stringify(allJobs, null, 2), 'utf-8');

            return NextResponse.json({
                success: true,
                message: `Successfully scraped ${jobs.length} jobs. Added ${newJobs.length} new jobs to database.`,
                scrapedCount: jobs.length,
                addedCount: newJobs.length
            });
        } else {
            return NextResponse.json({ success: false, message: 'No jobs found matching those selectors.' }, { status: 404 });
        }


    } catch (error: any) {
        console.error('Custom scrape API error:', error);
        return NextResponse.json({ error: error.message || 'Failed to execute custom scrape' }, { status: 500 });
    } finally {
        if (browser) await browser.close().catch(console.error);
    }
}
