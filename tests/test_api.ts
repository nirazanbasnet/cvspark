import fs from 'fs';

async function runTest() {
    try {
        console.log("Reading Raju Tamang's CV...");
        const fileBuffer = fs.readFileSync('sample-cv/raju-tamang-resume.pdf');
        const blob = new Blob([fileBuffer], { type: 'application/pdf' });

        const formData = new FormData();
        formData.append('file', blob, 'raju-tamang-resume.pdf');

        console.log("Sending POST request to http://localhost:3005/api/analyze...");
        const res = await fetch('http://localhost:3005/api/analyze', {
            method: 'POST',
            body: formData as any,
        });

        const text = await res.text();
        console.log("Raw response:")
        console.log(text.substring(0, 500));

        const data = JSON.parse(text);

        if (data.error) {
            console.error("API returned error:", data.error);
            return;
        }

        console.log("\n--- EXTRACTED CV DATA ---");
        console.log(JSON.stringify(data.extractedCv, null, 2));

        console.log("\n--- DUMMY CHECK ---");
        console.log(`Extracted Name: ${data.extractedCv?.basics?.name}`);
        console.log("Is it Raju Tamang? ", data.extractedCv?.basics?.name?.toLowerCase().includes("raju"));

    } catch (e) {
        console.error("Test failed", e);
    }
}

runTest();
