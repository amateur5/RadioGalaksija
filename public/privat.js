let isPrivateChatEnabled = false; // Status privatnog chata
let selectedGuest = null; // Selekcija gosta

document.getElementById('privateMessage').addEventListener('click', () => {
    isPrivateChatEnabled = !isPrivateChatEnabled;
    const statusText = isPrivateChatEnabled ? `Privatni chat je uključen` : `Privatni chat je isključen`;

    // Emitovanje događaja za server
    socket.emit('toggle_private_chat', isPrivateChatEnabled);
    console.log('Emitovanje događaja na server sa statusom privatnog chata:', isPrivateChatEnabled);

    // Omogućavanje ili onemogućavanje selekcije gostiju
    document.querySelectorAll('.guest').forEach(guest => {
        guest.style.pointerEvents = isPrivateChatEnabled ? 'auto' : 'none';
        console.log(`Selekcija gosta ${guest.textContent} ${isPrivateChatEnabled ? 'dozvoljena' : 'onemogućena'}`);
    });

    if (!isPrivateChatEnabled) {
        // Ako se isključi privatni chat, ukloni selektovanog gosta i traku
        if (selectedGuest) {
            if (selectedGuest.classList.contains('use-gradient')) {
                selectedGuest.classList.remove('selected-overlay');
            } else {
                selectedGuest.style.backgroundColor = '';
            }
            selectedGuest = null;
        }

        // Resetuj unos u chat inputu
        chatInput.value = '';

        // Emituj događaj serveru da resetuje selektovanog gosta
        socket.emit('resetSelectedGuest');
    }

    console.log(statusText);
    alert(statusText);
});

// Kada drugi korisnici prime događaj za resetovanje
socket.on('resetSelectedGuest', () => {
    if (selectedGuest) {
        if (selectedGuest.classList.contains('use-gradient')) {
            selectedGuest.classList.remove('selected-overlay');
        } else {
            selectedGuest.style.backgroundColor = '';
        }
        selectedGuest = null;
    }

    if (chatInput) {
        chatInput.value = ''; // Resetuj chat input
    }
});

// Prilagodba selekcije gostiju kada server šalje status privatnog chata
socket.on('private_chat_status', (status) => {
    isPrivateChatEnabled = status; // Ažuriraj status privatnog chata
    document.querySelectorAll('.guest').forEach(guest => {
        guest.style.pointerEvents = status ? 'auto' : 'none'; // Omogući ili onemogući selekciju
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const guestList = document.getElementById('guestList');
    const chatInput = document.getElementById('chatInput');

  guestList.addEventListener('contextmenu', (event) => {
    event.preventDefault(); // spreči browser meni
    if (isPrivateChatEnabled && event.target.classList.contains('guest')) {
        if (selectedGuest === event.target) {
            if (selectedGuest.classList.contains('use-gradient')) {
                selectedGuest.classList.remove('selected-overlay');
            } else {
                selectedGuest.style.backgroundColor = '';
            }
            selectedGuest = null;
            chatInput.value = '';
            console.log("Privatni chat isključen.");
            return;
        }

         if (selectedGuest) {
                if (selectedGuest.classList.contains('use-gradient')) {
                    selectedGuest.classList.remove('selected-overlay');
                } else {
                    selectedGuest.style.backgroundColor = '';
                }
            }

            selectedGuest = event.target;

            if (selectedGuest.classList.contains('use-gradient')) {
                selectedGuest.classList.add('selected-overlay');
            } else {
                selectedGuest.style.backgroundColor = 'rgba(128,128,128,0.3)'; // siva prozirna boja
            }

            chatInput.value = `---->>> ${selectedGuest.textContent} : `;
            console.log("Privatni chat sa:", selectedGuest.textContent);
        }
    });

    chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            let message = chatInput.value;

            if (isPrivateChatEnabled && selectedGuest) {
                // Emisija privatne poruke
                const recipient = selectedGuest.textContent;
                const time = new Date().toLocaleTimeString();

                socket.emit('private_message', {
                    to: recipient,
                    message,
                    time,
                    bold: isBold,
                    italic: isItalic,
                    color: currentColor,
                    gradient: currentGradient,
                    underline: isUnderline,
                    overline: isOverline
                });

                chatInput.value = `---->>> ${recipient} : `;
            } else {
                // Emisija obične poruke
                socket.emit('chatMessage', {
                    text: message,
                    bold: isBold,
                    italic: isItalic,
                    color: currentColor,
                    gradient: currentGradient,
                    underline: isUnderline,
                    overline: isOverline
                });

                chatInput.value = ''; // Resetuje unos samo za obične poruke
            }
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
  // HTML sadržaj kao stringovi
  const commandTableHTML = `
    <div class="command-table">
      <label>Tekst: <input type="text" id="textInput" value="TEXT"></label>
      <label>Boja: <input type="color" id="textColor" value="#ffffff"></label>
    <label>Font: 
  <select id="fontSelect">
    <option value="Arial">Arial</option>
    <option value="Verdana">Verdana</option>
    <option value="Courier New">Courier New</option>
    <option value="Georgia">Georgia</option>
    <option value="Times New Roman">Times New Roman</option>
    <option value="Trebuchet MS">Trebuchet MS</option>
    <option value="Tahoma">Tahoma</option>
    <option value="Impact">Impact</option>
    <option value="Comic Sans MS">Comic Sans MS</option>
    <option value="Lucida Console">Lucida Console</option>
    <option value="Lucida Sans Unicode">Lucida Sans Unicode</option>
    <option value="Consolas">Consolas</option>
    <option value="Palatino Linotype">Palatino Linotype</option>
    <option value="Garamond">Garamond</option>
    <option value="Bookman Old Style">Bookman Old Style</option>
    <option value="Arial Black">Arial Black</option>
    <option value="Segoe UI">Segoe UI</option>
    <option value="Calibri">Calibri</option>
    <option value="Candara">Candara</option>
    <option value="Franklin Gothic Medium">Franklin Gothic Medium</option>
    <option value="Gill Sans">Gill Sans</option>
    <option value="Constantia">Constantia</option>
    <option value="Corbel">Corbel</option>
    <option value="Cambria">Cambria</option>
  </select>
</label>

<label>Animacija: 
  <select id="animationSelect">
    <option value="bounce">Bounce</option>
    <option value="fadeIn">Fade In</option>
    <option value="zoom">Zoom</option>
    <option value="shake">Shake</option>
    <option value="slideUp">Slide Up</option>
    <option value="rotateX">RotateX</option>
    <option value="rotateY">RotateY</option>
    <option value="rotateZ">RotateZ</option>
    <option value="rotate3D">Rotate3D</option>
    <option value="marquee">Marquee</option>
    <option value="animateLetter">Animate Letter</option>
    <option value="float">Float</option>
    <option value="flipIn">Flip In</option>
    <option value="swirl">Swirl</option>
    <option value="bounceInLeft">Bounce In Left</option>
    <option value="jelly">Jelly</option>
  </select>
</label>

      <label>Brzina:
        <input type="range" id="speedRange" min="1" max="20" value="1">
      </label>
      <label>Veličina:
        <input type="range" id="fontSize" min="10" max="100" value="50">
      </label>
      <button id="generateBtn">Generiši</button>
      <button id="clearBtn">Obriši</button>
      <button id="showListBtn">Ukloni</button>
     <button id="gradiani">Gradijent</button>
      <div id="textCounter">Broj tekstova: 0</div>
    </div>
  `;

  const textContainerHTML = `
    <div id="textContainer"></div>
  `;

const popupOverlayHTML = `
  <div id="poptxtOverlay" class="popup-overlay"></div>
`;

const popupHTML = `
  <div id="poptxt" class="popup">
    <h2>Lista Tekstova</h2>
    <ul id="textList" class="text-list"></ul>
    <button id="closePoptxtBtn">Zatvori</button>
  </div>
`;

// Dodavanje HTML sadržaja u body
const body = document.body;
body.insertAdjacentHTML('beforeend', commandTableHTML);
body.insertAdjacentHTML('beforeend', textContainerHTML);
body.insertAdjacentHTML('beforeend', popupOverlayHTML);
body.insertAdjacentHTML('beforeend', popupHTML);

// Pronaći dugme za otvaranje/zatvaranje command table
const anitextButton = document.getElementById("anitext");
const commandTable = document.querySelector(".command-table");

// Početno stanje: command table je skriven
commandTable.style.display = "none";

  // Funkcija za otvaranje/zatvaranje command table
  anitextButton.addEventListener("click", function() {
    if (commandTable.style.display === "none" || commandTable.style.display === "") {
      commandTable.style.display = "block"; // Otvori command table
    } else {
      commandTable.style.display = "none"; // Zatvori command table
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const textInput = document.getElementById("textInput");
  const textColorInput = document.getElementById("textColor");
  const fontSelect = document.getElementById("fontSelect");
  const animationSelect = document.getElementById("animationSelect");
  const speedRange = document.getElementById("speedRange");
  const fontSizeRange = document.getElementById("fontSize");
  const generateBtn = document.getElementById("generateBtn");
  const clearBtn = document.getElementById("clearBtn");
  const textContainer = document.getElementById("textContainer");
  const textCounter = document.getElementById("textCounter");
  const textList = document.getElementById("textList");
  const showListBtn = document.getElementById("showListBtn");
 const popup = document.getElementById("poptxt");
const popupOverlay = document.getElementById("poptxtOverlay");
const closePopupBtn = document.getElementById("closePoptxtBtn");
const gradiani = document.getElementById('gradiani');

    let isAuthenticated = false;
  let textElements = []; // Svi tekstovi će biti pohranjeni u ovom nizu
  let selectedTextElement = null; // Trenutno selektovan tekst


  // Funkcija za ažuriranje liste teksta
  function updateTextList() {
    textList.innerHTML = ''; // Očisti listu
    textElements.forEach((element, index) => {
      const listItem = document.createElement('li');
      listItem.innerText = `Text ${index + 1}`;
      listItem.dataset.index = index;

      // Dodaj event listener za selektovanje teksta
      listItem.addEventListener('click', function () {
        if (selectedTextElement) {
          selectedTextElement.classList.remove("selected");
        }
        selectedTextElement = element;
        element.classList.add("selected");
      });

      textList.appendChild(listItem);
    });
  }

document.getElementById('gradiani').addEventListener('click', function () {
  const gradijentDiv = document.getElementById('gradijent');
  gradijentOpen = !gradijentOpen;
  gradijentDiv.style.display = gradijentOpen ? 'grid' : 'none';
});

document.querySelectorAll('#gradijent .gradijent-box').forEach(box => {
  box.addEventListener('click', () => {
    document.querySelectorAll('#gradijent .gradijent-box').forEach(b => b.classList.remove('selected'));
    box.classList.add('selected');
    textColorInput.value = "#ffffff";
  });
});
textColorInput.addEventListener('input', () => {
  document.querySelectorAll('#gradijent .gradijent-box').forEach(b => b.classList.remove('selected'));
});

generateBtn.addEventListener("click", function () {
  const text = textInput.value;
  const color = textColorInput.value;
  const font = fontSelect.value;
  const animation = animationSelect.value;
  const speed = 20 - speedRange.value;
  const fontSize = fontSizeRange.value + "px";

  const selectedGradient = document.querySelector('#gradijent .gradijent-box.selected');
  const gradientStyle = selectedGradient ? getComputedStyle(selectedGradient).backgroundImage : null;

  const textElement = document.createElement("div");
  textElement.classList.add("text-display");
  textElement.innerText = text;
  textElement.style.fontFamily = font;
  textElement.style.fontSize = fontSize;
  textElement.style.animation = `${animation} ${speed}s ease infinite`;

  if (gradientStyle) {
    textElement.style.backgroundImage = gradientStyle;
    textElement.style.webkitBackgroundClip = "text";
    textElement.style.webkitTextFillColor = "transparent";
  } else {
    textElement.style.color = color;
    textElement.style.backgroundImage = "none";
    textElement.style.webkitTextFillColor = "initial";
  }
if (!authorizedUsers.has(currentUser)) {
    textElement.style.pointerEvents = "none";
  }
  socket.emit('newText', {
    text,
    color,
    font,
    animation,
    speed,
    fontSize,
    gradientStyle,
    x: 0,
    y: 0
  });
   // Dodavanje drag funkcionalnosti
    let isDragging = false;
    let offsetX, offsetY;

   textElement.addEventListener("mousedown", function (e) {
  if (!authorizedUsers.has(currentUser)) return;

  if (selectedTextElement === textElement) {
    textElement.classList.remove("selected");
    selectedTextElement = null;
  } else {
    if (selectedTextElement) {
      selectedTextElement.classList.remove("selected");
    }
    textElement.classList.add("selected");
    selectedTextElement = textElement;
  }

  isDragging = true;
  offsetX = e.clientX - textElement.getBoundingClientRect().left;
  offsetY = e.clientY - textElement.getBoundingClientRect().top;
  textElement.style.cursor = "grabbing";
});


    document.addEventListener("mousemove", function (e) {
      if (!isDragging) return;
      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;
      textElement.style.left = `${x}px`;
      textElement.style.top = `${y}px`;

      // Emituj promenu pozicije svim drugim korisnicima
      socket.emit('positionChange', {
        index: textElements.indexOf(textElement),
        x,
        y
      });
    });

    document.addEventListener("mouseup", function () {
      isDragging = false;
      textElement.style.cursor = "grab";
    });

    // Dodaj element na ekran
    textContainer.appendChild(textElement);
    textElements.push(textElement);
    updateTextList(); // Ažuriraj listu
    textCounter.innerText = `Trenutni broj tekstova: ${textElements.length}`;
  });

  // Brisanje selektovanog teksta
  clearBtn.addEventListener("click", function () {
    if (selectedTextElement) {
      const index = textElements.indexOf(selectedTextElement);
      selectedTextElement.remove();
      textElements = textElements.filter(element => element !== selectedTextElement); // Ukloni iz niza
      selectedTextElement = null;
      updateTextList(); // Ažuriraj listu
      textCounter.innerText = `Trenutni broj tekstova: ${textElements.length}`;

      // Emituj brisanje teksta svim drugim korisnicima
      socket.emit('deleteText', {
        index
      });
    }
  });

 // Prikazivanje popup-a sa listom
showListBtn.addEventListener("click", function () {
  poptxt.style.display = "block";
  poptxtOverlay.style.display = "block";
});

// Zatvaranje popup-a
closePoptxtBtn.addEventListener("click", function () {
  poptxt.style.display = "none";
  poptxtOverlay.style.display = "none";
});

// Zatvori popup ako klikneš van njega
poptxtOverlay.addEventListener("click", function () {
  poptxt.style.display = "none";
  poptxtOverlay.style.display = "none";
});

  // Prijem trenutnog stanja od servera
socket.on('currentState', function (data) {
  textElements = data;
  textElements.forEach((elementData, index) => {
    const textElement = document.createElement("div");
    textElement.classList.add("text-display");
    textElement.innerText = elementData.text;
    textElement.style.fontFamily = elementData.font;
    textElement.style.fontSize = elementData.fontSize;
    textElement.style.animation = `${elementData.animation} ${elementData.speed}s ease infinite`;
    textElement.style.left = `${elementData.x}px`;
    textElement.style.top = `${elementData.y}px`;

   if (elementData.gradientStyle) {
  textElement.style.backgroundImage = elementData.gradientStyle;
  textElement.style.webkitBackgroundClip = "text";
  textElement.style.webkitTextFillColor = "transparent";
} else {
  textElement.style.color = elementData.color;
  textElement.style.backgroundImage = "none";
  textElement.style.webkitTextFillColor = "initial";
}
  if (!authorizedUsers.has(currentUser)) {
      textElement.style.pointerEvents = "none";
    }

  // Dodavanje drag funkcionalnosti
      let isDragging = false;
      let offsetX, offsetY;

      textElement.addEventListener("mousedown", function (e) {
        if (selectedTextElement === textElement) {
          textElement.classList.remove("selected");
          selectedTextElement = null;
        } else {
          if (selectedTextElement) {
            selectedTextElement.classList.remove("selected");
          }
          textElement.classList.add("selected");
          selectedTextElement = textElement;
        }

        isDragging = true;
        offsetX = e.clientX - textElement.getBoundingClientRect().left;
        offsetY = e.clientY - textElement.getBoundingClientRect().top;
        textElement.style.cursor = "grabbing";
      });

      document.addEventListener("mousemove", function (e) {
        if (!isDragging) return;
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;
        textElement.style.left = `${x}px`;
        textElement.style.top = `${y}px`;

        socket.emit('positionChange', {
          index,
          x,
          y
        });
      });

      document.addEventListener("mouseup", function () {
        isDragging = false;
        textElement.style.cursor = "grab";
      });

      textContainer.appendChild(textElement);
      textElements[index] = textElement;
    });
    updateTextList();
    textCounter.innerText = `Trenutni broj tekstova: ${textElements.length}`;
  });

  // Prijem događaja od drugih korisnika
socket.on('newText', function (data) {
  const textElement = document.createElement("div");
  textElement.classList.add("text-display");
  textElement.innerText = data.text;
  textElement.style.fontFamily = data.font;
  textElement.style.fontSize = data.fontSize;
  textElement.style.animation = `${data.animation} ${data.speed}s ease infinite`;
  textElement.style.left = `${data.x}px`;
  textElement.style.top = `${data.y}px`;

  if (data.gradientStyle) {
    textElement.style.backgroundImage = data.gradientStyle;
    textElement.style.webkitBackgroundClip = "text";
    textElement.style.webkitTextFillColor = "transparent";
  } else {
    textElement.style.color = data.color;
    textElement.style.backgroundImage = "none";
    textElement.style.webkitTextFillColor = "initial";
  }

  textContainer.appendChild(textElement);
  textElements.push(textElement);
  updateTextList();
  textCounter.innerText = `Trenutni broj tekstova: ${textElements.length}`;
});


  socket.on('deleteText', function (data) {
    const textElement = textElements[data.index];
    if (textElement) {
      textElement.remove();
      textElements.splice(data.index, 1);
      updateTextList();
      textCounter.innerText = `Trenutni broj tekstova: ${textElements.length}`;
    }
  });

  socket.on('positionChange', function (data) {
    const textElement = textElements[data.index];
    if (textElement) {
      textElement.style.left = `${data.x}px`;
      textElement.style.top = `${data.y}px`;
    }
  });
});
