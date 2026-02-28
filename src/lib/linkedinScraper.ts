import puppeteer from 'puppeteer';

export async function scrapeLinkedInJobs(role: string, location: string = 'Nepal', limit: number = 10) {
    if (!role) return [];

    let browser;
    try {
        console.log(`Starting LinkedIn scrape for role: ${role} in ${location}`);
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();

        // Block images and fonts to speed up scraping
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
            const results: any[] = [];
            document.querySelectorAll('.base-search-card__info').forEach((el, i) => {
                if (results.length >= maxLimits) return;

                const titleEl = el.querySelector('.base-search-card__title') as HTMLElement;
                const companyEl = el.querySelector('.base-search-card__subtitle') as HTMLElement;
                const locationEl = el.querySelector('.job-search-card__location') as HTMLElement;
                const linkEl = el.closest('.base-card')?.querySelector('.base-card__full-link') as HTMLAnchorElement;

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
    } catch (error: any) {
        console.error('LinkedIn scraping error:', error.message);
        return [];
    } finally {
        if (browser) {
            await browser.close().catch(console.error);
        }
    }
}
