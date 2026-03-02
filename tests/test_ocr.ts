import fs from 'fs';
const pdfImgConvert = require("pdf-img-convert");
import Tesseract from "tesseract.js";

async function testOCR() {
    console.log("Reading Raju Tamang's CV for OCR Debug...");
    const dataBuffer = fs.readFileSync('sample-cv/raju-tamang-resume.pdf');

    console.log("Converting PDF to Images...");
    const imageArrays = await pdfImgConvert.convert(dataBuffer, {
        page_numbers: [1, 2],
        base64: false
    });

    console.log(`Converted ${imageArrays.length} pages.`);

    for (let i = 0; i < imageArrays.length; i++) {
        console.log(`\n--- Running OCR on Page ${i + 1} ---`);
        const imgBuffer = Buffer.from(imageArrays[i]);
        const { data: { text } } = await Tesseract.recognize(imgBuffer, "eng");

        console.log(`\nExtracted Text length: ${text.length}`);
        console.log(text.substring(0, 1000));
    }
}

testOCR();
