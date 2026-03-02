import puppeteer from 'puppeteer';

async function testLinkedIn() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    const role = "React Developer";
    const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(role)}&location=Nepal`;
    console.log("Fetching:", url);
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Wait for jobs to load
    await page.waitForSelector('.base-search-card__info', { timeout: 10000 }).catch(() => console.log('Timeout waiting for job cards'));

    const jobs = await page.evaluate(() => {
        const results = [];
        document.querySelectorAll('.base-search-card__info').forEach((el, i) => {
            const titleEl = el.querySelector('.base-search-card__title');
            const companyEl = el.querySelector('.base-search-card__subtitle');
            // The link is actually on the parent 'a' tag outside __info usually
            const linkEl = el.closest('.base-card')?.querySelector('.base-card__full-link');
            
            if (titleEl && companyEl) {
                results.push({
                    title: titleEl.innerText.trim(),
                    company: companyEl.innerText.trim(),
                    link: linkEl ? linkEl.href : ''
                });
            }
        });
        return results;
    });

    console.log("Found jobs:", jobs.slice(0, 5));
    await browser.close();
}

testLinkedIn().catch(console.error);
