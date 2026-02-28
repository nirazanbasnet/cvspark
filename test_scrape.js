const https = require('https');
const cheerio = require('cheerio');

https.get('https://www.kumarijob.com/search', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const $ = cheerio.load(data);
    const jobs = [];
    $('.job-list-item').each((i, el) => {
      const title = $(el).find('h5.job-title a').text().trim();
      const company = $(el).find('div.sub-title h6 a').text().trim();
      if (title) jobs.push({title, company});
    });
    console.log(jobs.slice(0, 5));
  });
});

https.get('https://jobaxle.com/', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const $ = cheerio.load(data);
    const jobs = [];
    $('.job-title').each((i, el) => {
      jobs.push($(el).text().trim());
    });
    console.log("JobAxle titles:", jobs.slice(0, 5));
  });
});
