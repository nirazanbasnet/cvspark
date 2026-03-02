import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const JOBS_FILE = path.join(process.cwd(), 'src/data/jobs.json');

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

// Fallback jobs in case of anti-scraping blocks
const fallbackJobs = [
  {
    id: 'fb-1',
    title: 'Frontend Developer (React/Next.js)',
    company: 'TechNepal Solutions',
    location: 'Kathmandu',
    link: 'https://example.com/job/1',
    description: 'We are looking for a skilled Frontend Developer proficient in React, Next.js, and Tailwind CSS. The ideal candidate will have 2+ years of experience building scalable web applications. Knowledge of state management and API integration is required.',
    source: 'Fallback Data'
  },
  {
    id: 'fb-2',
    title: 'Backend Engineer (Node.js/PostgreSQL)',
    company: 'Everest Innovations',
    location: 'Lalitpur, Nepal',
    link: 'https://example.com/job/2',
    description: 'Seeking a strong Backend Engineer with expertise in Node.js, Express, and PostgreSQL. Experience with cloud platforms (AWS/GCP) and microservices architecture is a plus. You will be responsible for designing and optimizing RESTful APIs.',
    source: 'Fallback Data'
  },
  {
    id: 'fb-3',
    title: 'UI/UX Designer',
    company: 'Creative Yeti',
    location: 'Kathmandu (Remote)',
    link: 'https://example.com/job/3',
    description: 'Join our design team to create stunning user interfaces and seamless experiences. Must be proficient in Figma and Adobe Creative Suite. A strong portfolio demonstrating modern web and mobile application design is required.',
    source: 'Fallback Data'
  },
  {
    id: 'fb-4',
    title: 'Full Stack Developer',
    company: 'Gurkha Tech',
    location: 'Pokhara',
    link: 'https://example.com/job/4',
    description: 'We need a Full Stack Developer capable of handling both frontend and backend tasks. Required skills: React, Node.js, MongoDB. Experience with Docker and CI/CD pipelines is preferred. Strong problem-solving abilities are a must.',
    source: 'Fallback Data'
  },
  {
    id: 'fb-5',
    title: 'Digital Marketing Executive',
    company: 'Kathmandu Digitals',
    location: 'Kathmandu',
    link: 'https://example.com/job/5',
    description: 'Looking for a data-driven Digital Marketing Executive. Responsibilities include SEO optimization, managing Google Ads and social media campaigns, and analyzing traffic metrics using Google Analytics.',
    source: 'Fallback Data'
  },
  {
    id: 'fb-6',
    title: 'QA Engineer (Automation)',
    company: 'QA Nepal',
    location: 'Kathmandu',
    link: 'https://example.com/job/6',
    description: 'We are hiring a QA Engineer focusing on test automation using Selenium, Cypress, or Playwright. Must have attention to detail and ability to write robust automated test scripts.',
    source: 'Fallback Data'
  }
];

async function scrapeMeroJob() {
  try {
    console.log('Fetching jobs from merojob.com...');
    const res = await fetch('https://merojob.com/search/?q=', { headers });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const jobs = [];

    $('.job-card').each((i, el) => {
      const titleEl = $(el).find('h1 a, h2 a, h3 a, .job-title a').first();
      const companyEl = $(el).find('h3 a, h4 a, .company-name a').first();
      const locationEl = $(el).find('.location, .job-location').first();
      const descEl = $(el).find('.job-description, .text-muted').first();
      
      const title = titleEl.text().trim();
      const link = titleEl.attr('href') ? `https://merojob.com${titleEl.attr('href')}` : '';
      const company = companyEl.text().trim() || 'Unknown Company';
      let location = locationEl.text().trim().replace(/\s+/g, ' ') || 'Nepal';
      let description = descEl.text().trim().replace(/\s+/g, ' ') || 'No description available in preview.';
      
      if (title && link) {
        jobs.push({
          id: `mj-${i}-${Date.now()}`,
          title,
          company,
          location,
          link,
          description: `${title} position at ${company}. ${description}`,
          source: 'merojob.com'
        });
      }
    });

    console.log(`Successfully scraped ${jobs.length} jobs from merojob.`);
    return jobs;
  } catch (error) {
    console.error('Failed to scrape merojob:', error.message);
    return [];
  }
}

async function scrapeKumariJob() {
  try {
    console.log('Fetching jobs from kumarijob.com...');
    const res = await fetch('https://www.kumarijob.com/search', { headers });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const jobs = [];

    $('.job-list-item, .job-card, .list-job').each((i, el) => {
      const titleEl = $(el).find('h2 a, h3 a').first();
      const companyEl = $(el).find('.company-name').first();
      const title = titleEl.text().trim();
      const link = titleEl.attr('href') ? `${titleEl.attr('href')}` : '';
      const company = companyEl.text().trim() || 'Unknown Company';
      
      if (title && link) {
        jobs.push({
          id: `kj-${i}-${Date.now()}`,
          title,
          company,
          location: 'Nepal',
          link: link.startsWith('http') ? link : `https://www.kumarijob.com${link}`,
          description: `Open ${title} position. Apply at ${company}.`, 
          source: 'kumarijob.com'
        });
      }
    });
    console.log(`Successfully scraped ${jobs.length} jobs from kumarijob.`);
    return jobs;
  } catch (error) {
    console.error('Failed to scrape kumarijob:', error.message);
    return [];
  }
}

async function main() {
  console.log('Starting job scraper...');
  let allJobs = [];

  const mjJobs = await scrapeMeroJob();
  const kjJobs = await scrapeKumariJob();

  allJobs = [...mjJobs, ...kjJobs];

  if (allJobs.length === 0) {
    console.log('\nScraping failed or yielded 0 jobs. jobs.json will reflect an empty array.');
  }

  fs.mkdirSync(path.dirname(JOBS_FILE), { recursive: true });
  fs.writeFileSync(JOBS_FILE, JSON.stringify(allJobs, null, 2), 'utf-8');
  console.log(`\nScraping complete! Saved ${allJobs.length} jobs to ${JOBS_FILE}`);
}

main().catch(console.error);
