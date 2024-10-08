const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serviraj statičke datoteke iz 'public' foldera
app.use(express.static('public'));

// Rute ili logika za WebSocket
// ...

http.listen(3000, () => {
    console.log('Server je pokrenut na http://localhost:3000');
});
