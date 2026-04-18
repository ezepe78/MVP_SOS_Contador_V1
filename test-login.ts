async function test() {
  const url = 'https://api.sos-contador.com/api/login';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({
          "usuario": "maria.rodriguez1987.mr@gmail.com",
          "password": "cs.eco.05"
      })
    });
    console.log(res.status, await res.text());
  } catch(e) {
      console.log(e);
  }
}
test();
