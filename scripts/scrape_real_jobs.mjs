import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const JOBS_FILE = path.join(process.cwd(), 'src/data/jobs.json');

async function scrapeMeroJob(browser) {
  try {
    console.log('Fetching from merojob.com...');
    const page = await browser.newPage();
    await page.goto('https://merojob.com/search/?q=', { waitUntil: 'networkidle2' });
    
    // Wait for job cards to load
    await page.waitForSelector('.job-card, .card', { timeout: 8000 }).catch(() => console.log('Timeout waiting for .job-card on merojob'));

    const jobs = await page.evaluate(() => {
      const results = [];
      const links = Array.from(document.querySelectorAll('a')).filter(a => a.href.includes('/job/'));
      links.forEach((linkEl, i) => {
        const title = linkEl.innerText.trim();
        if(title.length > 5 && !title.toLowerCase().includes('view') && !title.toLowerCase().includes('apply')) {
          results.push({
            id: `mj-${Date.now()}-${i}`,
            title,
            company: 'MeroJob Company',
            location: 'Nepal',
            link: linkEl.href,
            description: `Open position for ${title}`,
            source: 'merojob.com'
          });
        }
      });
      return results;
    });

    console.log(`Scraped ${jobs.length} jobs from merojob.com`);
    await page.close();
    return jobs;
  } catch (error) {
    console.error('Merojob scraping failed:', error.message);
    return [];
  }
}

async function scrapeKumariJob(browser) {
  try {
    console.log('Fetching from kumarijob.com...');
    const page = await browser.newPage();
    await page.goto('https://www.kumarijob.com/search', { waitUntil: 'networkidle2' });
    
    await page.waitForSelector('.job-title, h1, h2, h3, h4, h5, h6', { timeout: 8000 }).catch(() => console.log('Timeout waiting for jobs on kumarijob'));

    const jobs = await page.evaluate(() => {
      const results = [];
      const cards = Array.from(document.querySelectorAll('.job-title, h1, h2, h3, h4, h5, h6'));
      
      cards.forEach((el, i) => {
        const text = el.innerText.trim();
        if(text.includes('\n') && text.length > 10) {
           const parts = text.split('\n');
           const title = parts[0].trim();
           const company = parts[1].trim();
           const parentLink = el.closest('a') || el.querySelector('a');
           const link = parentLink ? parentLink.href : 'https://www.kumarijob.com/search';
           
           if(title && !results.find(j => j.title === title) && !title.includes('Search Your Dream')) {
             results.push({
               id: `kj-${Date.now()}-${i}`,
               title,
               company,
               location: 'Nepal',
               link,
               description: `Open position for ${title} at ${company}.`,
               source: 'kumarijob.com'
             });
           }
        }
      });
      return results;
    });

    console.log(`Scraped ${jobs.length} jobs from kumarijob.com`);
    await page.close();
    return jobs;
  } catch (error) {
    console.error('Kumarijob scraping failed:', error.message);
    return [];
  }
}

async function scrapeJobAxle(browser) {
  try {
    console.log('Fetching from jobaxle.com...');
    const page = await browser.newPage();
    await page.goto('https://jobaxle.com/', { waitUntil: 'networkidle2' });
    
    await page.waitForSelector('a[href*="/jobs/"]', { timeout: 10000 }).catch(() => console.log('Timeout waiting for jobs on jobaxle'));

    const jobs = await page.evaluate(() => {
      const results = [];
      // JobAxle typically uses specific cards, let's broad match 'a' tags with '/jobs/' since we saw titles there
      const cards = document.querySelectorAll('.job-wrapper, .job-item, article');
      
      if (cards.length > 0) {
        cards.forEach((el, i) => {
          const titleEl = el.querySelector('.job-title, h2, h3');
          const companyEl = el.querySelector('.company, h4');
          
          const title = titleEl ? titleEl.innerText.trim() : '';
          const link = titleEl && titleEl.querySelector('a') ? titleEl.querySelector('a').href : (el.querySelector('a[href*="/jobs/"]') ? el.querySelector('a[href*="/jobs/"]').href : '');
          const company = companyEl ? companyEl.innerText.trim() : 'Unknown Company';
          
          if (title && link && !results.find(j => j.title === title)) {
            results.push({
              id: `ja-${Date.now()}-${i}`,
              title,
              company,
              location: 'Nepal',
              link,
              description: `Open ${title} position at ${company}.`,
              source: 'jobaxle.com'
            });
          }
        });
      }

      // If cards fail, try a broader search
      if(results.length === 0) {
        document.querySelectorAll('a[href*="/jobs/"]').forEach((el, i) => {
           const text = el.innerText.trim();
           if(text.length > 5 && !text.toLowerCase().includes('view') && !results.find(j => j.title === text)) {
               results.push({
                  id: `ja-${Date.now()}-${i}`,
                  title: text,
                  company: 'Unknown Company',
                  location: 'Nepal',
                  link: el.href,
                  description: `Open position for ${text}`,
                  source: 'jobaxle.com'
               });
           }
        });
      }

      return results;
    });

    console.log(`Scraped ${jobs.length} jobs from jobaxle.com`);
    await page.close();
    return jobs;
  } catch (error) {
    console.error('Jobaxle scraping failed:', error.message);
    return [];
  }
}


async function main() {
  console.log('Starting Puppeteer job scraper...');
  
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });

  let allJobs = [];

  const mjJobs = await scrapeMeroJob(browser);
  const kjJobs = await scrapeKumariJob(browser);
  const jaJobs = await scrapeJobAxle(browser);

  allJobs = [...mjJobs, ...kjJobs, ...jaJobs];

  if (allJobs.length > 0) {
    fs.mkdirSync(path.dirname(JOBS_FILE), { recursive: true });
    
    // Read existing jobs to merge or replace. Let's replace for a fresh scrape, but keep fallbacks if we got very few.
    if (allJobs.length < 5) {
        console.log("Scraped very few jobs, might be hitting a captcha. Appending to existing jobs instead of replacing.");
        try {
            const existing = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf-8'));
            // simple merge, avoid exact title duplicates
            allJobs.forEach(job => {
                if(!existing.find(e => e.title === job.title)) {
                    existing.push(job);
                }
            });
            allJobs = existing;
        } catch(e) {
            // ignore
        }
    }
    
    fs.writeFileSync(JOBS_FILE, JSON.stringify(allJobs, null, 2), 'utf-8');
    console.log(`\nScraping complete! Saved ${allJobs.length} jobs to ${JOBS_FILE}`);
  } else {
    console.log('Scraping failed to find any jobs. Keeping existing data in jobs.json.');
  }

  await browser.close();
}

main().catch(console.error);
