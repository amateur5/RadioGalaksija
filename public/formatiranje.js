let myNickname = ''; // biće postavljen od servera

socket.on('yourNickname', function(nick) {
    myNickname = nick;
});

let isBold = false;
let isItalic = false;
let currentColor = 'rgba(200, 200, 200, 0.5)';
let isUnderline = false;
let isOverline = false;
const guestsData = {};
window.guestsData = guestsData;
let currentGuestId = ''; 
let gradijentOpen = false; // Definiši promenljivu
let currentGradient = null;

document.getElementById('boldBtn').addEventListener('click', function() {
    isBold = !isBold;
    updateInputStyle();
});

document.getElementById('italicBtn').addEventListener('click', function() {
    isItalic = !isItalic;
    updateInputStyle();
});

document.getElementById('linijadoleBtn').addEventListener('click', function() {
    isUnderline = !isUnderline;
    updateInputStyle();
});

document.getElementById('linijagoreBtn').addEventListener('click', function() {
    isOverline = !isOverline;
    updateInputStyle();
});

function updateInputStyle() {
    let inputField = document.getElementById('chatInput');
    inputField.style.fontWeight = isBold ? 'bold' : 'normal';
    inputField.style.fontStyle = isItalic ? 'italic' : 'normal';
    inputField.style.textDecoration = (isUnderline ? 'underline ' : '') + (isOverline ? 'overline' : '');

    if (currentGradient) {
        inputField.style.backgroundClip = 'text';
        inputField.style.webkitBackgroundClip = 'text';
        inputField.style.color = 'transparent'; // važno za rad na FireFox
        inputField.style.webkitTextFillColor = 'transparent';
        inputField.style.backgroundImage = getComputedStyle(document.querySelector(`.${currentGradient}`)).backgroundImage;
    } else {
        inputField.style.backgroundImage = '';
        inputField.style.backgroundClip = '';
        inputField.style.webkitBackgroundClip = '';
        inputField.style.webkitTextFillColor = '';
        inputField.style.color = currentColor;
    }
}


let lastMessages = {}; // Objekt koji prati poslednju poruku svakog korisnika

socket.on('chatMessage', function(data) {
    if (!myNickname) return;

    const myName = currentUser ? currentUser : myNickname;
    let text = data.text.replace(/#n/g, myName);
    if (lastMessages[data.nickname] === text) return;
    lastMessages[data.nickname] = text;

    const messageArea = document.getElementById('messageArea');
    const newMessage = document.createElement('div');
    newMessage.classList.add('message');

    // Stilovi za font
    newMessage.style.fontWeight = data.bold ? 'bold' : 'normal';
    newMessage.style.fontStyle = data.italic ? 'italic' : 'normal';
    newMessage.style.textDecoration = (data.underline ? 'underline ' : '') + (data.overline ? 'overline' : '');

    // Ako je boja postavljena, postavi je
if (data.color) {
    newMessage.style.backgroundImage = '';
    newMessage.style.backgroundClip = '';
    newMessage.style.webkitBackgroundClip = '';
    newMessage.style.webkitTextFillColor = '';
    newMessage.style.color = data.color;
} else if (data.gradient) {
    newMessage.style.backgroundClip = 'text';
    newMessage.style.webkitBackgroundClip = 'text';
    newMessage.style.webkitTextFillColor = 'transparent';
    newMessage.style.backgroundImage = getComputedStyle(document.querySelector(`.${data.gradient}`)).backgroundImage;
}

    // Dodavanje sadržaja poruke
    newMessage.innerHTML = `<strong>${data.nickname}:</strong> ${text.replace(/\n/g, '<br>').replace(/ {2}/g, '&nbsp;&nbsp;')} <span style="font-size: 0.8em; color: gray;">(${data.time})</span>`;
    messageArea.prepend(newMessage);
  const isNearTop = messageArea.scrollTop < 50;

if (isNearTop) {
    messageArea.scrollTop = 0;
}
});

socket.on('private_message', function(data) {
    if (!myNickname) return;

    const myName = currentUser ? currentUser : myNickname;
    let text = data.message.replace(/#n/g, myName);
    if (lastMessages[data.from] === text) return;
    lastMessages[data.from] = text;

    let messageArea = document.getElementById('messageArea');
    let newMessage = document.createElement('div');
    newMessage.classList.add('message');

    newMessage.style.fontWeight = data.bold ? 'bold' : 'normal';
    newMessage.style.fontStyle = data.italic ? 'italic' : 'normal';
    newMessage.style.textDecoration = (data.underline ? 'underline ' : '') + (data.overline ? 'overline' : '');

    if (data.color) {
        newMessage.style.backgroundImage = '';
        newMessage.style.backgroundClip = '';
        newMessage.style.webkitBackgroundClip = '';
        newMessage.style.webkitTextFillColor = '';
        newMessage.style.color = data.color;
    } else if (data.gradient) {
        newMessage.style.backgroundClip = 'text';
        newMessage.style.webkitBackgroundClip = 'text';
        newMessage.style.webkitTextFillColor = 'transparent';
        newMessage.style.backgroundImage = getComputedStyle(document.querySelector(`.${data.gradient}`)).backgroundImage;
    }

   newMessage.innerHTML = `<strong>${data.from}:</strong> ${text.replace(/\n/g, '<br>').replace(/ {2}/g, '&nbsp;&nbsp;')} <span style="font-size: 0.8em; color: gray;">(${data.time})</span>`;
 messageArea.prepend(newMessage);

 const isNearTop = messageArea.scrollTop < 50;
    if (isNearTop) {
        messageArea.scrollTop = 0;
    }
});

// Kada nov gost dođe
socket.on('newGuest', function (nickname) {
    const guestId = `guest-${nickname}`;
    const guestList = document.getElementById('guestList');
    const newGuest = document.createElement('div');
    newGuest.classList.add('guest');
    newGuest.id = guestId;
    newGuest.textContent = nickname;

    if (!guestsData[guestId]) {
        guestsData[guestId] = { nickname, color: '' };
    }

    guestList.appendChild(newGuest);
});

// Ažuriranje liste gostiju bez resetovanja stilova
socket.on('updateGuestList', function (users) {
    const guestList = document.getElementById('guestList');
    const currentGuests = Array.from(guestList.children).map(guest => guest.textContent);

    // Ukloni goste koji više nisu u listi
    currentGuests.forEach(nickname => {
        if (!users.includes(nickname)) {
            delete guestsData[`guest-${nickname}`];
            const guestElement = Array.from(guestList.children).find(guest => guest.textContent === nickname);
            if (guestElement) {
                guestList.removeChild(guestElement);
            }
        }
    });

    // Reorder: "Radio Galaksija" na vrhu
    if (users.includes("Radio Galaksija")) {
        users = ["Radio Galaksija", ...users.filter(n => n !== "Radio Galaksija")];

        // Ulogovani korisnik na drugo mesto ako nije Galaksija
        if (myNickname !== "Radio Galaksija") {
            users = users.filter(n => n !== myNickname);
            users.splice(1, 0, myNickname);
        }
    } else {
        // Ako nema Galaksije, korisnik ide na prvo mesto
        users = users.filter(n => n !== myNickname);
        users.unshift(myNickname);
    }

    // Dodaj nove goste
    users.forEach(nickname => {
        const guestId = `guest-${nickname}`;
        if (!guestsData[guestId]) {
            const newGuest = document.createElement('div');
            newGuest.className = 'guest';
            newGuest.id = guestId;
            newGuest.textContent = nickname;
            newGuest.style.color = '';

            guestsData[guestId] = { nickname, color: newGuest.style.color };

            newGuest.setAttribute('data-guest-id', guestId);
            guestList.appendChild(newGuest);
        }
    });

    // Poređaj DOM elemente po redosledu iz `users`
    users.forEach(nickname => {
        const guestId = `guest-${nickname}`;
        const guestElement = document.getElementById(guestId);
        if (guestElement) {
            guestList.appendChild(guestElement);
        }
    });
});

//  COLOR PICKER -OBICNE BOJE
document.getElementById('colorBtn').addEventListener('click', function() {
    document.getElementById('colorPicker').click();
});

document.getElementById('colorPicker').addEventListener('input', function() {
    currentColor = this.value;
    currentGradient = null; // Resetovanje gradijenta

    // Uklanjanje svih gradijenata sa div-a
    const myDivId = `guest-${myNickname}`;
    const myDiv = document.getElementById(myDivId);
    if (myDiv) {
        // Ukloni sve gradijente sa div-a
        myDiv.classList.forEach(cls => {
            if (cls.startsWith('gradient-')) {
                myDiv.classList.remove(cls);
            }
        });
        // Ukloni gradijent i pozadinsku sliku
        myDiv.classList.remove('use-gradient');
        myDiv.style.backgroundImage = ''; 
    }

    // Resetuj input stilove, očisti gradijent i postavi boju
    updateInputStyle();

    // Postavljanje boje teksta u div-u i emitovanje boje
    setTimeout(() => {
        if (myDiv) {
            myDiv.style.color = currentColor; // Postavljanje boje teksta
        }
        socket.emit('colorChange', { nickname: myNickname, color: currentColor });
    }, 300);
});

// Slušanje svih boja pri povezivanju
socket.on('allColors', (colors) => {
    // Primena boja za sve korisnike
    for (const nickname in colors) {
        const color = colors[nickname];
        const myDivId = `guest-${nickname}`;
        const myDiv = document.getElementById(myDivId);
        if (myDiv) {
            myDiv.style.color = color;
        }
    }
});

socket.on('colorChange', (data) => {
    const myDivId = `guest-${data.nickname}`;
    const myDiv = document.getElementById(myDivId);
    if (myDiv) {
        // Ukloni sve gradijente
        myDiv.classList.forEach(cls => {
            if (cls.startsWith('gradient-')) {
                myDiv.classList.remove(cls);
            }
        });
        myDiv.classList.remove('use-gradient');
        myDiv.style.backgroundImage = ''; 

        // Postavi boju
        myDiv.style.color = data.color;
    }
});
// ZA GRADIJENTE
document.getElementById('farbe').addEventListener('click', function () {
    const gradijentDiv = document.getElementById('gradijent');
    gradijentOpen = !gradijentOpen;
    gradijentDiv.style.display = gradijentOpen ? 'grid' : 'none';

    if (gradijentOpen) {
        setTimeout(() => {
            const boxes = document.querySelectorAll('.gradijent-box');
            boxes.forEach(box => {
                box.onclick = function () {
                    currentGradient = this.classList[1];
                    currentColor = ''; // Resetuj boju kada izabereš gradijent

                    const myDivId = `guest-${myNickname}`;
                    const myDiv = document.getElementById(myDivId);
                    if (myDiv) {
                        // Uklanjanje stare boje i gradijenata
                        myDiv.classList.forEach(cls => {
                            if (cls.startsWith('gradient-')) {
                                myDiv.classList.remove(cls);
                            }
                        });
                        myDiv.classList.remove('use-gradient');
                        myDiv.classList.remove('gradient-user'); // <- ukloni staru klasu
                        myDiv.style.color = '';
                        myDiv.style.backgroundImage = '';

                        // Dodavanje novog gradijenta
                        myDiv.classList.add(currentGradient);
                        myDiv.classList.add('use-gradient');
                        myDiv.classList.add('gradient-user'); // <- nova klasa
                        myDiv.style.backgroundImage = getComputedStyle(this).backgroundImage;
                    }

                    updateInputStyle();

                    socket.emit('gradientChange', { nickname: myNickname, gradient: currentGradient });
                };
            });
        }, 300);
    }
});

socket.on('gradientChange', function (data) {
    const myDivId = `guest-${data.nickname}`;
    const myDiv = document.getElementById(myDivId);
    if (myDiv) {
        myDiv.classList.forEach(cls => {
            if (cls.startsWith('gradient-')) {
                myDiv.classList.remove(cls);
            }
        });
        myDiv.classList.remove('use-gradient');
        myDiv.classList.remove('gradient-user'); // <- ukloni staru klasu
        myDiv.style.color = '';
        myDiv.style.backgroundImage = '';

        myDiv.classList.add(data.gradient);
        myDiv.classList.add('use-gradient');
        myDiv.classList.add('gradient-user'); // <- nova klasa
        myDiv.style.backgroundImage = getComputedStyle(document.querySelector(`.${data.gradient}`)).backgroundImage;
    }
});

// Slušanje svih gradijenata pri povezivanju novih korisnika
socket.on('allGradients', (gradients) => {
    for (const nickname in gradients) {
        const div = document.getElementById(`guest-${nickname}`);
        if (div) {
            div.classList.add(gradients[nickname]);
            div.classList.add('use-gradient');
            div.classList.add('gradient-user'); // <- nova klasa
            div.style.backgroundImage = getComputedStyle(document.querySelector(`.${gradients[nickname]}`)).backgroundImage;
        }
    }
});
