const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./satellite_data.txt', 'utf8'));
process.stdout.write(String(data.length));
