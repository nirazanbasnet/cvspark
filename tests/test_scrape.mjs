import * as cheerio from 'cheerio';
const headers = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' };

async function getKJ() {
  const res = await fetch('https://www.kumarijob.com/search', { headers });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  let tags = [];
  $('a').each((i, el) => {
     let href = $(el).attr('href');
     if(href && href.includes('job/')) {
        tags.push($(el).text().trim().substring(0, 30));
     }
  });

  console.log(tags.filter(t => t.length > 5).slice(0, 5));
}
getKJ();
