const fs = require('fs');
const pdfParse = require('pdf-parse');

async function parse() {
    const dataBuffer = fs.readFileSync('./sample-cv/bikram-tuladhar-cv.pdf');
    const data = await pdfParse(dataBuffer);
    console.log(data.text);
}
parse();
