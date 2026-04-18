import https from 'https';
import fs from 'fs';

https.get('https://documenter.getpostman.com/view/1566360/SWTD6vnC', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('postman_docs.html', data);
    console.log("Written HTML to postman_docs.html");
  });
}).on('error', err => console.error(err));
