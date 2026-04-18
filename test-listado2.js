async function test() {
  const url = 'https://api.sos-contador.com/api/cuit/listado';
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer asdf.asdf.asdf'
      }
    });
    console.log("api/cuit/listado", res.status);
    console.log(await res.text());
  } catch (e) {
    console.log("Error:", e.message);
  }
}
test();
