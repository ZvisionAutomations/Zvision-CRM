const fs = require('fs');
const https = require('https');
const path = require('path');

const outputTxtPath = 'C:/Users/Lenovo/.gemini/antigravity/brain/58f74254-5be2-4951-a06a-46a05bdebd9c/.system_generated/steps/30/output.txt';
const outputDir = path.join(__dirname, 'stitch-imports');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const data = fs.readFileSync(outputTxtPath, 'utf-8');
const json = JSON.parse(data);

json.screens.forEach(screen => {
    if (screen.htmlCode && screen.htmlCode.downloadUrl) {
        const title = screen.title.replace(/[\/\?<>\\:\*\|":]/g, '-');
        const dest = path.join(outputDir, `${title}.html`);
        console.log(`Downloading ${title}...`);

        https.get(screen.htmlCode.downloadUrl, (res) => {
            const fileStream = fs.createWriteStream(dest);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                console.log(`Saved ${title} to ${dest}`);
            });
        }).on('error', (err) => {
            console.error(`Error downloading ${title}: ${err.message}`);
        });
    }
});
