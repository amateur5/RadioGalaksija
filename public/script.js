const socket = io(); // Učitaj Socket.IO

// Dodatne funkcionalnosti
document.getElementById('start-stream').addEventListener('click', () => {
    console.log('Strim je počeo!');
    socket.emit('start-stream'); // Emitujte događaj za pokretanje strima
});

document.getElementById('stop-stream').addEventListener('click', () => {
    console.log('Strim je završen!');
    socket.emit('stop-stream'); // Emitujte događaj za zaustavljanje strima
});

// Odlazna poruka
document.getElementById('send-message').addEventListener('click', () => {
    const message = document.getElementById('message-input').value;
    socket.emit('send-message', message); // Emituj poruku
});

// Prijem poruka
socket.on('receive-message', (message) => {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML += `<p>${message}</p>`; // Dodaj poruku u chat
});
// Možeš dodati funkcionalnosti za index.html ovde, ako bude potrebno

