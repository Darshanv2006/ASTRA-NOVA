const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./satellite_data.txt', 'utf8'));
console.log('Total satellites in file:', data.length);
console.log('\nFirst 5 satellites:');
data.slice(0, 5).forEach(s => console.log(`  ${s.NORAD_CAT_ID}: ${s.OBJECT_NAME}`));
console.log('\nLast 5 satellites:');
data.slice(-5).forEach(s => console.log(`  ${s.NORAD_CAT_ID}: ${s.OBJECT_NAME}`));
