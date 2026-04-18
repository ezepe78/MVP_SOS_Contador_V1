import dns from 'dns';

[
  'api.sos-contador.com',
  'api.sos-contador.com.ar',
  'rest.sos-contador.com',
  'ws.sos-contador.com',
  'test.sos-contador.com',
  'sandbox.sos-contador.com',
  'dev.sos-contador.com'
].forEach(domain => {
  dns.resolve(domain, (err, records) => {
    if (!err) console.log(domain, "OK", records);
  });
});
