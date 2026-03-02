import cron from 'node-cron';
import { exec } from 'child_process';

console.log('Starting AI Job Scraping Scheduler Service...');
console.log('Cron configured to run scrapers every 12 hours (0 */12 * * *).');

// Schedule tasks to be run on the server
cron.schedule('0 */12 * * *', () => {
    console.log(`\n[${new Date().toISOString()}] Running scheduled job scrapers...`);
    
    // Disabled Nepali portals temporarily for testing LinkedIn
    /*
    exec('node scripts/scrape_jobs.mjs', (error, stdout, stderr) => {
        if (error) console.error(`Error executing scrape_jobs.mjs: ${error.message}`);
        if (stderr) console.error(`stderr: ${stderr}`);
        console.log(stdout);
    });
    */

    exec('node scripts/scrape_linkedin.mjs', (error, stdout, stderr) => {
        if (error) console.error(`Error executing scrape_linkedin.mjs: ${error.message}`);
        if (stderr) console.error(`stderr: ${stderr}`);
        console.log(stdout);
    });
});

console.log('Executing initial scrape on startup...');
exec('node scripts/scrape_linkedin.mjs', (error, stdout, stderr) => {
    if (error) console.error(`Error executing scrape_linkedin.mjs: ${error.message}`);
    if (stderr) console.error(`stderr: ${stderr}`);
    console.log(stdout);
});
