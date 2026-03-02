import puppeteer from 'puppeteer';

async function testMero() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto('https://merojob.com', { waitUntil: 'networkidle2' });
  
  const content = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => a.href).filter(h => h.includes('job') || h.includes('career'));
  });
  console.log("Mero Links:", content.slice(0, 10));

  await page.goto('https://www.kumarijob.com/search', { waitUntil: 'networkidle2' });
  const kcontent = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.job-title, h1, h2, h3, h4, h5, h6')).map(el => el.innerText).filter(t => t.length > 5);
  });
  console.log("Kumari Titles:", kcontent.slice(0, 10));

  await browser.close();
}
testMero().catch(console.error);
