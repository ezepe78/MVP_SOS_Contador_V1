async function test() {
  const loginUrl = 'https://api.sos-contador.com/api/login';
  const listadoUrl = 'https://api.sos-contador.com/api/cuit/listado';
  
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
    console.log("Login HTTP status:", res.status);
    console.log("Login keys:", Object.keys(loginData));
    
    if (loginData.jwt) {
        const res2 = await fetch(listadoUrl, {
           method: 'GET',
           headers: {
               'Authorization': 'Bearer ' + loginData.jwt
           }
        });
        console.log("Listado HTTP status:", res2.status);
        const listText = await res2.text();
        try {
            const listData = JSON.parse(listText);
            console.log("Listado structure:", Array.isArray(listData) ? "Array with " + listData.length + " items" : Object.keys(listData));
            if (Array.isArray(listData) && listData.length > 0) {
                console.log("First item:", listData[0]);
            } else if (listData.data) {
                 console.log("Data field:", typeof listData.data);
            } else {
                 console.log("Data:", listData);
            }
        } catch (err) {
            console.log("Not JSON:", listText.substring(0, 100));
        }
    } else {
        console.log("No JWT in response!");
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
}
test();
