const https = require('https');
const fs = require('fs');

const url = 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAzMDdlYmUwODk4NTRiZWRiYjhjY2YwMTlmNzg3MGZjEgsSBxC_jMvV_g8YAZIBJAoKcHJvamVjdF9pZBIWQhQxNTI2MjY2Njc0ODcxNTUwNDMxNQ&filename=&opi=96797242';
const dest = 'C:/Users/Lenovo/Documents/Zvision Automation HUB/zvision-crm/stitch-imports/Detalhes_Generated.html';

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        fs.writeFileSync(dest, data);
        console.log('Downloaded new Detalhes HTML');
    });
}).on('error', err => console.error(err));
