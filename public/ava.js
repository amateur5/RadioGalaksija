// CSS direktno iz JS
const style = document.createElement('style');
style.textContent = `
  #avatar {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 250px;
    height: 250px;
    border: 5px solid;
    border-image: linear-gradient(45deg, #ff00ff, #00ffff, #ff00ff) 1;
    background: #111;
    padding: 10px;
    box-sizing: border-box;
    z-index: 999;
    overflow-y: auto;
  }
  #avatar img {
    width: 50px;
    height: 50px;
    margin: 5px;
    cursor: pointer;
  }
  .inline-avatar {
    width: 30px;
    height: 30px;
    margin-left: 5px;
    vertical-align: middle;
  }
  #clear-avatar {
    margin-top: 10px;
    padding: 5px 10px;
    background-color: #f44336;
    color: white;
    border: none;
    cursor: pointer;
  }
`;
document.head.appendChild(style);

// Interni objekat za čuvanje avatara
let avatars = {};

// Funkcija za sačuvavanje avatara u sessionStorage i localStorage
function saveAvatarsToStorage() {
  sessionStorage.setItem('avatars', JSON.stringify(avatars));
  localStorage.setItem('avatars', JSON.stringify(avatars));
}

// Funkcija za učitavanje avatara iz sessionStorage ili localStorage
function loadAvatarsFromStorage() {
  const storedAvatars = sessionStorage.getItem('avatars') || localStorage.getItem('avatars');
  return storedAvatars ? JSON.parse(storedAvatars) : {};
}

// Pomoćna funkcija za kreiranje avatara
function createAvatarImg(src) {
  const img = document.createElement('img');
  img.src = src;
  img.className = 'inline-avatar';
  return img;
}

// Kada se lista gostiju ažurira (kada korisnik diskonektuje ili se povezuje)
socket.on('updateGuestList', guests => {
  // Ažuriraj avatar listu iz objekta (ako su podaci prethodno sačuvani)
  for (const username of guests) {
    const avatar = avatars[username];

    // Ako avatar postoji, prikaži ga
    if (avatar) {
      const guestDiv = document.getElementById(`guest-${username}`);
      if (guestDiv) {
        guestDiv.querySelector('.inline-avatar')?.remove(); // Ukloni stari avatar (ako postoji)
        guestDiv.appendChild(createAvatarImg(avatar)); // Dodaj novi avatar
      }
    }
  }
});

// Primi sve postojeće avatare kada se korisnici prvi put povežu
socket.on('initialAvatars', avatarsFromServer => {
  avatars = avatarsFromServer || loadAvatarsFromStorage(); // Učitaj iz skladišta ako nema u memoriji

  // Sačuvaj učitane avatare
  saveAvatarsToStorage();

  // Prikazivanje svih avatara na interfejsu
  for (const username in avatars) {
    const avatar = avatars[username];
    (function tryAppend() {
      const guestDiv = document.getElementById(`guest-${username}`);
      if (guestDiv) guestDiv.appendChild(createAvatarImg(avatar));
      else setTimeout(tryAppend, 100);
    })();
  }
});

// Primi promenu avatara
socket.on('avatarChange', data => {
  avatars[data.username] = data.avatar; // Ažuriraj avatar u memoriji
  saveAvatarsToStorage(); // Spremi novu promenu u storage

  const guestDiv = document.getElementById(`guest-${data.username}`);
  if (guestDiv) {
    guestDiv.querySelector('.inline-avatar')?.remove();
    guestDiv.appendChild(createAvatarImg(data.avatar));
  }
});

// Prikazivanje avatara za trenutnog korisnika kada klikne na avatar div
document.getElementById('sl').addEventListener('click', () => {
  const avatarDiv = document.getElementById('avatar');
  if (!avatarDiv) return;

  avatarDiv.style.display = avatarDiv.style.display === 'block' ? 'none' : 'block';
  if (avatarDiv.style.display === 'none' || !window.currentUser?.username) return;

  const username = window.currentUser.username;

  // Ovde nemoj brisati ceo innerHTML, samo dodaj slike za avatar
  for (let i = 1; i <= 12; i++) {
    const img = document.createElement('img');
    img.src = `nik/sl${i}.webp`;
    img.alt = `Slika ${i}`;

    img.addEventListener('click', () => {
      const guestDiv = document.getElementById(`guest-${username}`);
      if (guestDiv) {
        guestDiv.querySelector('.inline-avatar')?.remove();
        guestDiv.appendChild(createAvatarImg(img.src));
      }
      avatars[username] = img.src; // Ažuriraj avatar u memoriji
      saveAvatarsToStorage(); // Sačuvaj promenu u storage
      socket.emit('avatarChange', { username, avatar: img.src });
    });

    avatarDiv.appendChild(img);  // Dodaj slike za avatar
  }

  // Dodajemo dugme za brisanje avatara
  const clearButton = document.createElement('button');
  clearButton.id = 'clear-avatar';
  clearButton.textContent = 'Obriši Avatar';
  clearButton.addEventListener('click', () => {
    // Brisanje avatar slike korisnika
    const guestDiv = document.getElementById(`guest-${username}`);
    if (guestDiv) {
      guestDiv.querySelector('.inline-avatar')?.remove();  // Ukloni avatar
    }
    
    // Opcionalno: briši avatar u memoriji (ako želiš da izbrišeš avatar iz objekta)
    delete avatars[username];  
    saveAvatarsToStorage(); // Spremi promene u storage
    socket.emit('avatarChange', { username, avatar: '' });  // Pošaljite praznu vrednost serveru
  });

  avatarDiv.appendChild(clearButton);  // Dodaj dugme za brisanje avatara
});

// Registracija korisnika sa početnim avatarom
socket.emit('register', { username: 'mojUsername', avatar: 'putanja/slike.webp' });

//  ZA GOSTE -XXXX(SA BROJEVIMA)
// Kad server javi da je gost bio neaktivan 15 min → prikaži avatar na 1 minut
socket.on('guestInactiveShowAvatar', function(username) {
    const guestDiv = document.getElementById(`guest-${username}`);
    if (guestDiv) {
        // Ukloni stari avatar ako postoji
        const oldAvatar = guestDiv.querySelector('.inline-avatar');
        if (oldAvatar) oldAvatar.remove();

        // Dodaj avatar sl4.webp
        const img = document.createElement('img');
        img.src = 'nik/sl4.webp';
        img.className = 'inline-avatar';
        guestDiv.appendChild(img);

        // Posle 1 minut ukloni avatar
        setTimeout(() => {
            const avatarToRemove = guestDiv.querySelector('.inline-avatar');
            if (avatarToRemove) avatarToRemove.remove();
        }, 60 * 1000); // 1 minut
    }
});

