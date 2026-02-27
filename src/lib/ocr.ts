import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configure the worker to use the CDN version matching the installed pdfjs-dist
// The .mjs extension is critical for pdfjs-dist v4+
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function extractOcrTextFromPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";

    // Process at most the first 2 pages to keep the OCR time under a minute
    const numPages = Math.min(pdf.numPages, 2);

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 3.0 }); // Increased scale for better Tesseract OCR accuracy on stylized names

        // Render PDF page to a native browser canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext: any = {
            canvasContext: context,
            viewport: viewport,
        };

        await page.render(renderContext).promise;

        // Convert canvas back to a base64 image
        const imgData = canvas.toDataURL("image/png");

        // Run Tesseract OCR natively in the browser
        const { data: { text } } = await Tesseract.recognize(imgData, 'eng');
        fullText += text + "\n\n";
    }

    return fullText;
}
