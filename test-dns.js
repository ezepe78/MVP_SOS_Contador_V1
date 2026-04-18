import dns from 'dns';

['beta.sos-contador.com', 'api.sos-contador.com', 'cuit.sos-contador.com', 'app.sos-contador.com', 'server.sos-contador.com', 'www.sos-contador.com'].forEach(domain => {
  dns.resolve(domain, (err, records) => {
    if (err) console.log(domain, "ERROR", err.code);
    else console.log(domain, "OK", records);
  });
});
