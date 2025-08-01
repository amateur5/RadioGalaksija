document.addEventListener("DOMContentLoaded", function() {
  // Kreiraj div sa obavštenjem
  var div = document.createElement("div");
  div.style.position = "fixed";
  div.style.top = "50%";
  div.style.left = "50%";
  div.style.transform = "translate(-50%, -50%)";  // Centriraj div na ekranu
  div.style.width = "500px";
  div.style.height = "500px";
  div.style.backgroundColor = "black";
  div.style.border = "5px solid #00FF00";  // Neon zelene granice
  div.style.color = "white";
  div.style.textAlign = "center";
  div.style.padding = "20px";
  div.style.fontSize = "20px";
  div.style.zIndex = "1000";
  div.style.borderRadius = "10px";  // Blagi zaobljeni ivice

  // Dodaj tekst u div
  div.innerHTML = "Prihvatate li naše uslove korišćenja i pristajete na deljenje vaše geolokacije? <br>";

  // Dodaj dugme za prihvatanje
  var button = document.createElement("button");
  button.innerHTML = "OK";
  button.style.padding = "10px 20px";
  button.style.backgroundColor = "#4CAF50";
  button.style.color = "white";
  button.style.fontSize = "16px";
  button.style.border = "none";
  button.style.cursor = "pointer";
  button.style.marginTop = "20px";
  button.style.borderRadius = "5px";

  // Dodaj dugme u div
  div.appendChild(button);

  // Dodaj div na početak tela stranice
  document.body.appendChild(div);

  // Kada korisnik klikne na dugme, sakrij div
  button.addEventListener("click", function() {
    // Sakrij div
    div.style.display = "none";

    // Pozovi funkciju za prikupljanje GPS podataka
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        // Pozovi funkciju koja šalje podatke na server
        sendLocationToServer(lat, lon);
      }, function(error) {
        console.error('Greška u geolokaciji:', error);
      });
    } else {
      alert("Geolokacija nije podržana u ovom pregledaču.");
    }
  });
});

// Funkcija koja šalje GPS podatke serveru
function sendLocationToServer(lat, lon) {
  fetch('/save-location', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      latitude: lat,
      longitude: lon
    })
  })
  .then(response => response.json())
  .then(data => console.log('Podaci sačuvani:', data))
  .catch(error => console.error('Greška prilikom slanja podataka:', error));
}
