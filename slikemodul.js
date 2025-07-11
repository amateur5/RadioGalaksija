let io;
let newImage = [];
let userImages = {}; // Mapa korisničkih slika

// Funkcija za setovanje io objekta
function setSocket(serverIo) {
    io = serverIo;

    io.on('connection', (socket) => {
        userImages[socket.id] = []; // Inicializacija korisničkih slika

        socket.emit('initial-images', newImage);

        socket.on('add-image', (imageSource, position, dimensions) => {
            if (!imageSource || !position || !dimensions) return;

            const image = {
                imageUrl: imageSource,
                position: position,
                dimensions: dimensions
            };

            newImage.push(image);
            userImages[socket.id].push(image);

            io.emit('display-image', {
                imageUrl: imageSource,
                position: position,
                dimensions: dimensions
            });
        });

        socket.on('update-image', (data) => {
            const image = newImage.find(img => img.imageUrl === data.imageUrl);
            if (image) {
                image.position = data.position;
                image.dimensions = data.dimensions;
            }
            io.emit('sync-image', data);
        });

        socket.on('remove-image', (imageUrl) => {
            const index = newImage.findIndex(img => img.imageUrl === imageUrl);
            if (index !== -1) {
                newImage.splice(index, 1);
                userImages[socket.id] = userImages[socket.id].filter(img => img.imageUrl !== imageUrl);
            }
            io.emit('update-images', newImage);
        });

       socket.on('delete-all', (username) => {
    // Provera da li je korisnik u autorizovanoj grupi
    if (authorizedUsers.has(username)) { 
        newImage = []; // Briše sve slike
        userImages = {}; // Briše sve korisničke slike
        io.emit('update-images', newImage); // Obavesti sve klijente o brisanju slika
    } else {
        socket.emit('error', 'Nemate privilegije da obrišete slike!'); // Ako korisnik nije privilegovan
      }
        });
    });
}

// Izvoz funkcije setSocket
module.exports = { setSocket };
