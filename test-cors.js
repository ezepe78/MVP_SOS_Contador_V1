async function testCors() {
  const url = 'https://api.sos-contador.com/api/login';
  try {
    const res = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log(res.status);
    console.log(res.headers);
  } catch (e) {
    console.log("Error:", e.message);
  }
}
testCors();
