import https from 'https';

https.get('https://documenter.getpostman.com/api/collections/1566360-SWTD6vnC', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
     console.log("documenter", res.statusCode, typeof data, data.substring(0, 100));
  });
}).on('error', err => console.error(err));
