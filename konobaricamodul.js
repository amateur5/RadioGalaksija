const mongoose = require('mongoose');

module.exports = (io) => {
  let chatContainerState = { x: 300, y: 100, width: 900, height: 550 };
  const blockedIPs = new Set(); // Lokalna lista blokiranih IP adresa
  const stanje = {}; //  BORDERI ELEMENATA 
  let allUserAnimations = {}; 
let fullLayoutData = null;   // BEZ MASKE 
 const sirinaStanje = {};
 
   // **Šema i model za banovane IP adrese**
    const baniraniSchema = new mongoose.Schema({
        ipAddress: { type: String, required: true, unique: true }
    });

    const Banirani = mongoose.model('Banirani', baniraniSchema);

const GuestSchema = new mongoose.Schema({
    ipAddress: String,
    info: String  // Tekst koji admin upisuje
});

const Guest = mongoose.model('Guest', GuestSchema);

  io.on('connection', (socket) => {
   socket.on('requestInitialChatContainerData', () => {
    socket.emit('initialChatContainerData', chatContainerState);
  });
socket.on('new_guest', () => {
 const greetingMessage = `Dobro došli, osećajte se kao kod kuće. Vaše muzičke želje potrudiće se da vam ispune DJ LiLi, DJ Sandra i DJ *__X__*.
Kada nismo na smeni, tu je uvek naš Auto DJ. Uživajte!`;
 io.emit('message', {
    username: '<span class="konobarica">Konobarica</span>',
    message: greetingMessage,
    isSystemMessage: true
  });
});
    socket.on('moveChatContainer', (data) => {
    if (typeof data.x === 'number' && typeof data.y === 'number') {
      chatContainerState.x = data.x;
      chatContainerState.y = data.y;
      // Emituj svim ostalim klijentima
      socket.broadcast.emit('updateChatContainer', { x: data.x, y: data.y });
    }
  });
   socket.on('resizeChatContainer', (data) => {
    if (
      typeof data.width === 'number' && typeof data.height === 'number' &&
      typeof data.x === 'number' && typeof data.y === 'number'
    ) {
      chatContainerState.width = data.width;
      chatContainerState.height = data.height;
      chatContainerState.x = data.x;
      chatContainerState.y = data.y;
      // Emituj svim ostalim klijentima
      socket.broadcast.emit('updateChatContainer', {
        width: data.width,
        height: data.height,
        x: data.x,
        y: data.y
      });
    }
  });

     // **BANIRANJE IP ADRESE**
        let ipAddress = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
        if (ipAddress.includes(',')) {
            ipAddress = ipAddress.split(',')[0].trim(); // Uzimamo prvi IP ako ih ima više
        }

            // **Provera da li je IP banovan iz baze**
        Banirani.findOne({ ipAddress })
            .then((isBanned) => {
                if (isBanned) {
                    console.log(`Blokiran korisnik pokušao da se poveže: ${ipAddress}`);
                    socket.emit('banMessage', 'Vaša IP adresa je banovana!');
                    socket.disconnect(); // Prekidamo vezu
                }
            })
            .catch(err => console.error("❌ Greška pri proveri banovane IP adrese:", err));

        // **Banovanje korisnika**
        socket.on('banUser', (ip) => {
            if (ip) {
                Banirani.create({ ipAddress: ip })
                    .then(() => {
                        console.log(`IP adresa ${ip} je banovana!`);
                        io.emit('userBanned', ip); // Obaveštavamo klijente
                    })
                    .catch(err => {
                        if (err.code === 11000) {
                            console.error(`❌ IP ${ip} je već banovan!`);
                        } else {
                            console.error("❌ Greška pri banovanju:", err);
                        }
                    });
            }
        });
//   ZA UNOS TEXTA U MODALU UUID
 // Proveri da li već postoji unos za ovu IP adresu
    Guest.findOne({ ipAddress }).then(existingGuest => {
        if (existingGuest) {
            io.emit('logMessage', `IP adresa: ${ipAddress} (Info: ${existingGuest.info})`);
        } else {
            io.emit('logMessage', `IP adresa: ${ipAddress} (Nema dodatnog info)`);
        }
    });

    // Kada admin doda info u polje
    socket.on('saveUserNote', ({ ipAddress, note }) => {
        Guest.findOneAndUpdate(
            { ipAddress },
            { info: note },
            { upsert: true, new: true }
        ).then(() => {
            console.log(`Info sačuvan za ${ipAddress}: ${note}`);
        });
    });

   socket.emit('currentAnimations', allUserAnimations);
  socket.on('animationChange', (data) => {
    const { nickname, animation, speed } = data;
 allUserAnimations[nickname] = { animation, speed };
  io.emit('animationChange', data);
  });

     socket.emit("pocetnoStanje", stanje);
socket.on("promeniGradijent", (data) => {
 socket.broadcast.emit("promeniGradijent", data);
  stanje[data.id] = { gradijent: data.gradijent };
});

 if (fullLayoutData) {
    socket.emit('full-layout-load', fullLayoutData);
  }

  // Kad klijent pošalje novi layout
  socket.on('full-layout-load', data => {
    fullLayoutData = data;
    socket.broadcast.emit('full-layout-load', data);
  });

  // Reset layout
  socket.on('full-layout-reset', () => {
    fullLayoutData = null;
    socket.broadcast.emit('full-layout-reset');
  });

     socket.emit("pocetnoStanjeSirina", sirinaStanje);

  // Kada korisnik menja širinu
  socket.on("promeniSirinu", (data) => {
   sirinaStanje[data.id] = data.borderWidth;

socket.broadcast.emit("promeniSirinu", data);
  });

        socket.on('disconnect', () => {});
    });
};
