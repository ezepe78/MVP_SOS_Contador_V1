async function test() {
  const url = 'https://api.sos-contador.com/cuit/listado';
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer asdfghjkl'
      }
    });
    console.log(res.status);
    console.log(await res.text());
  } catch (e) {
    console.log("Error:", e.message);
  }
}
test();
