async function test() {
  const loginUrl = 'https://api.sos-contador.com/login';
  
  try {
    const res = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          "usuario": "maria.rodriguez1987.mr@gmail.com",
          "password": "cs.eco.05"
      })
    });
    const loginData = await res.json();
    
    if (loginData.jwt && loginData.cuits && loginData.cuits.length > 0) {
        const firstCuit = loginData.cuits[0];
        console.log("Testing with cuit id:", firstCuit.id, "cuit num:", firstCuit.cuit);
        
        const credUrl = `https://api.sos-contador.com/cuit/credentials/${firstCuit.id}`;
        const res2 = await fetch(credUrl, {
           method: 'GET',
           headers: {
               'Authorization': 'Bearer ' + loginData.jwt
           }
        });
        console.log(`Credentials /cuit/credentials/${firstCuit.id} status:`, res2.status);
        console.log("Credentials response:", await res2.text());
        
        // Let's also try with the cuit number
        const credUrl2 = `https://api.sos-contador.com/cuit/credentials/${firstCuit.cuit}`;
        const res3 = await fetch(credUrl2, {
           method: 'GET',
           headers: {
               'Authorization': 'Bearer ' + loginData.jwt
           }
        });
        console.log(`Credentials /cuit/credentials/${firstCuit.cuit} status:`, res3.status);
        console.log("Credentials response:", await res3.text());

    } else {
        console.log("No JWT in response!");
        console.log(loginData);
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
}
test();
