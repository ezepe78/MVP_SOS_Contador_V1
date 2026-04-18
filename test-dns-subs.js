import dns from 'dns';
const subdomains = ['api', 'app', 'beta', 'test', 'www', 'rest', 'ws', 'qa', 'login', 'auth'];
const promises = subdomains.map(sub => {
    return new Promise(resolve => {
        dns.resolve(`${sub}.sos-contador.com`, (err, rec) => {
            if (!err) resolve(`${sub}.sos-contador.com: ${rec}`);
            else resolve(null);
        });
    });
});
Promise.all(promises).then(res => console.log(res.filter(r => r)));
