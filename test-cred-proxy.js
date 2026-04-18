async function test() {
  const loginUrl = 'http://localhost:3000/api/login';
  
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
        
        let credUrl = `http://localhost:3000/api/cuit/credentials/${firstCuit.id}`;
        let res2 = await fetch(credUrl, {
           method: 'GET',
           headers: { 'Authorization': 'Bearer ' + loginData.jwt }
        });
        console.log(`Credentials ${credUrl} status:`, res2.status);
        console.log("Response:", await res2.text());
        
        // Let's also try with cuit number as it was seen in screenshot maybe?
        let credUrl2 = `http://localhost:3000/api/cuit/credentials/${firstCuit.cuit}`;
        let res3 = await fetch(credUrl2, {
           method: 'GET',
           headers: { 'Authorization': 'Bearer ' + loginData.jwt }
        });
        console.log(`Credentials ${credUrl2} status:`, res3.status);
        console.log("Response:", await res3.text());

    } else {
        console.log("No JWT in response!");
        console.log(loginData);
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
}
test();
