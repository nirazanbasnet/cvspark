import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const JOBS_FILE = path.join(process.cwd(), 'src/data/jobs.json');

async function scrapeLinkedInJobs(role, location = 'Nepal', limit = 10) {
    if (!role) return [];

    let browser;
    try {
        console.log(`Starting LinkedIn scrape for role: ${role} in ${location}`);
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();

        // Block images and fonts to save bandwidth
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'other'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

        await page.waitForSelector('.base-search-card__info', { timeout: 5000 }).catch(() => console.log('Timeout waiting for job cards, might be no jobs or captcha'));

        const jobs = await page.evaluate((maxLimits) => {
            const results = [];
            document.querySelectorAll('.base-search-card__info').forEach((el, i) => {
                if (results.length >= maxLimits) return;

                const titleEl = el.querySelector('.base-search-card__title');
                const companyEl = el.querySelector('.base-search-card__subtitle');
                const locationEl = el.querySelector('.job-search-card__location');
                const linkEl = el.closest('.base-card')?.querySelector('.base-card__full-link');

                if (titleEl && companyEl) {
                    results.push({
                        id: `li-${Date.now()}-${i}`,
                        title: titleEl.innerText.trim(),
                        company: companyEl.innerText.trim(),
                        location: locationEl ? locationEl.innerText.trim() : 'Nepal',
                        link: linkEl ? linkEl.href : '',
                        description: `LinkedIn Job: ${titleEl.innerText.trim()} at ${companyEl.innerText.trim()}`,
                        source: 'linkedin.com'
                    });
                }
            });
            return results;
        }, limit);

        console.log(`Found ${jobs.length} jobs on LinkedIn for ${role}`);
        return jobs;
    } catch (error) {
        console.error('LinkedIn scraping error:', error.message);
        return [];
    } finally {
        if (browser) {
            await browser.close().catch(console.error);
        }
    }
}

async function main() {
    console.log('Starting standalone LinkedIn scraper...');
    
    // We will scrape a few general software roles to populate the database
    const rolesToScrape = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'React Developer'];
    
    let allNewJobs = [];
    for (const role of rolesToScrape) {
        const jobs = await scrapeLinkedInJobs(role, 'Nepal', 5); // Limit 5 per role to make it fast
        allNewJobs = [...allNewJobs, ...jobs];
        // Short delay between terms
        await new Promise(r => setTimeout(r, 2000));
    }

    // Always overwrite jobs.json structure to clear out the fallback fake data
    fs.mkdirSync(path.dirname(JOBS_FILE), { recursive: true });
    fs.writeFileSync(JOBS_FILE, JSON.stringify(allNewJobs, null, 2), 'utf-8');
    
    if (allNewJobs.length > 0) {
        console.log(`\nScraping complete! Saved ${allNewJobs.length} LinkedIn jobs to ${JOBS_FILE}`);
    } else {
        console.log('\nNo jobs scraped from LinkedIn. jobs.json is now empty (fallback removed).');
    }
}

main().catch(console.error);
