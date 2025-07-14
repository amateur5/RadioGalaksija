const popup = document.createElement('div');
popup.id = 'popup';
popup.style.display = 'none';
popup.style.position = 'fixed';
popup.style.bottom = '5%';
popup.style.left = '2%';
popup.style.width = '200px';
popup.style.height = '250px';
popup.style.padding = '5px';
popup.style.background = 'black';
popup.style.border = '5px solid #fff';
popup.style.zIndex = '1000';
popup.innerHTML = `
  <button id="startstop">Start - Stop</button>
    <button id="chatsl">Slike</button>
   <button id="chatpoz">Maska</button>
  <button id="save">Save</button>
   <button id="load">Ucitaj</button>
  <button id="reset">Reset</button>
`;
document.body.appendChild(popup);

 document.getElementById('maska').addEventListener('click', () => {
    popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
  });

const allDraggables = [
  '#openModal',
  '#sound',
  '#smilesBtn',
  '#GBtn',
  '#messageArea',
  '#guestList',
  '#chatInput'
 ];
function dodajSliku() {
  const url = prompt("Unesi URL slike:");
  if (!url) return;
  const img = document.createElement('img');
  img.src = url;
  img.id = 'img-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  img.style.position = 'absolute';
  img.style.top = '10px';
  img.style.left = '10px';
  img.style.width = '150px';
  img.style.height = '150px';
  img.style.zIndex = '1600';
  img.style.cursor = 'move';
  img.style.userSelect = 'none';
  img.addEventListener('contextmenu', e => {
    e.preventDefault();
    if (confirm('Da li želite da izbrišete ovu sliku?')) {
      img.remove();
      const index = allDraggables.indexOf(`#${img.id}`);
      if (index !== -1) allDraggables.splice(index, 1);
    }
  });
  document.body.appendChild(img);
  allDraggables.push(`#${img.id}`);
  setupInteract(img);
}
document.getElementById('chatsl').onclick = dodajSliku;

let editMode = false;

function setupInteract(el) {
  if (!authorizedUsers.has(currentUser)) return;

  el.style.position = 'absolute';
  el.style.touchAction = 'none';

  // Precizan DRAG
  interact(el).draggable({
    allowFrom: el,
    modifiers: [
      interact.modifiers.snap({
        targets: [interact.snappers.grid({ x: 1, y: 1 })],
        range: Infinity,
        relativePoints: [{ x: 0, y: 0 }]
      }),
      interact.modifiers.restrict({ restriction: 'body', endOnly: true })
    ],
    listeners: {
      move(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        target.style.cursor = 'move';
      }
    }
  });

  // Precizan RESIZE
  interact(el).resizable({
    edges: { top: true, left: true, bottom: true, right: true },
    modifiers: [
      interact.modifiers.snapSize({
        targets: [interact.snappers.grid({ x: 1, y: 1 })]
      })
    ],
    listeners: {
      move(event) {
        let x = parseFloat(event.target.getAttribute('data-x')) || 0;
        let y = parseFloat(event.target.getAttribute('data-y')) || 0;
        event.target.style.width = event.rect.width + 'px';
        event.target.style.height = event.rect.height + 'px';
        x += event.deltaRect.left;
        y += event.deltaRect.top;
        event.target.style.transform = `translate(${x}px, ${y}px)`;
        event.target.setAttribute('data-x', x);
        event.target.setAttribute('data-y', y);
      }
    }
  });
}
document.getElementById('chatpoz').addEventListener('click', () => {
  let imageSource = prompt("Unesi URL slike:");
  if (!imageSource) {
    imageSource = 'putanja/do/default-slike.jpg'; // postavi ovde default URL
  }
  const chat = document.getElementById('chatContainer');
  if (chat) {
    chat.style.backgroundImage = `url('${imageSource}')`;
    chat.style.backgroundSize = 'cover';
    chat.style.backgroundPosition = 'center';
    chat.style.backgroundRepeat = 'no-repeat';
  }
});

const originalButtonText = new Map();

allDraggables.forEach(sel => {
  const el = document.querySelector(sel);
  if (el && el.tagName.toUpperCase() === 'BUTTON') {
    originalButtonText.set(sel, el.innerText);
  }
});

function startEditMode() {
  editMode = true;

  const toolbar = document.getElementById('toolbar');
  if (toolbar) {
    while (toolbar.firstChild) {
     toolbar.parentNode.insertBefore(toolbar.firstChild, toolbar.nextSibling);
  }
    toolbar.remove();
  }

  let style = document.getElementById('remove-guest-borders');
  if (!style) {
    style = document.createElement('style');
    style.id = 'remove-guest-borders';
    document.head.appendChild(style);
  }
  style.textContent = `
    .guest, .virtual-guest {
      border-bottom: none !important;
    }
  `;

let hideScrollbarStyle = document.getElementById('hide-scrollbar-style');
if (!hideScrollbarStyle) {
  hideScrollbarStyle = document.createElement('style');
  hideScrollbarStyle.id = 'hide-scrollbar-style';
  hideScrollbarStyle.textContent = `
    #messageArea {
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none;  /* IE 10+ */
    }
    #messageArea::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
  `;
  document.head.appendChild(hideScrollbarStyle);
}


  const chatContainer = document.getElementById('chatContainer');
  if (chatContainer) {
    chatContainer.style.zIndex = '0';
    chatContainer.style.border = 'none';
  }

  allDraggables.forEach((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;

    // Spreči širenje dimenzija
    el.style.boxSizing = 'border-box';

    // Zakucaj trenutne dimenzije samo prvi put
    if (!el.style.width) el.style.width = `${el.offsetWidth}px`;
    if (!el.style.height) el.style.height = `${el.offsetHeight}px`;

    el.style.position = 'absolute';
    el.style.margin = '0';
    el.style.boxShadow = '0 0 3px 1px #0ff';
    el.style.border = '1px solid #0ff';
    el.style.userSelect = 'none';
    el.style.zIndex = '1000';
    el.style.pointerEvents = 'auto';

    if (el.id === 'messageArea' || el.id === 'guestList' || el.id === 'chatInput') {
      el.style.background = 'transparent';
      el.style.color = '';
    }

    if (el.tagName.toUpperCase() === 'BUTTON') {
      if (!originalButtonText.has(sel)) {
        originalButtonText.set(sel, el.innerText);
      }
      el.innerText = originalButtonText.get(sel);
      el.style.color = '';
      el.style.background = '';
      el.style.border = '';

      el.dataset.disabled = 'true';
      const blockClick = e => {
        e.stopImmediatePropagation();
        e.preventDefault();
      };
      el._blockClickHandler = blockClick;
      el.addEventListener('click', blockClick, true);
    }

    setupInteract(el);
  });
}
function stopEditMode() {
  editMode = false;

  const chatContainer = document.getElementById('chatContainer');
  if (chatContainer) chatContainer.style.zIndex = '1000';

  const bg = document.getElementById('chat-bg-img');
  if (bg) {
    bg.style.zIndex = '1600';
    bg.style.pointerEvents = 'none';
  }

  allDraggables.forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;

    // Dobijamo prethodno pomeranje iz translate transformacije
    const dataX = parseFloat(el.getAttribute('data-x')) || 0;
    const dataY = parseFloat(el.getAttribute('data-y')) || 0;

    // Pozicija roditelja
    const parentRect = el.offsetParent?.getBoundingClientRect() || { top: 0, left: 0 };

    // Pozicija elementa relativno na roditelja + transformacija
    el.style.position = 'absolute';
    el.style.top = `${el.offsetTop + dataY}px`;
    el.style.left = `${el.offsetLeft + dataX}px`;
    el.style.transform = 'none'; // uklanjamo transform
    el.removeAttribute('data-x');
    el.removeAttribute('data-y');

    // Veličina
    el.style.width = `${el.offsetWidth}px`;
    el.style.height = `${el.offsetHeight}px`;

    // Ostali stilovi
    el.style.boxShadow = '';
    el.style.border = 'none';
    el.style.userSelect = '';
    el.style.padding = '';
    el.style.margin = '';
    el.style.zIndex = '1400';
    el.style.pointerEvents = 'auto';

    if (el.tagName.toUpperCase() === 'BUTTON') {
      el.style.position = 'absolute';
      el.style.background = 'transparent';
      el.style.color = 'transparent';
      el.style.border = 'none';
      el.innerText = '';

      if (el._blockClickHandler) {
        el.dataset.disabled = 'false';
        el.removeEventListener('click', el._blockClickHandler, true);
        delete el._blockClickHandler;
      }
    }

    try { interact(el).unset(); } catch (e) {}
  });
}

document.getElementById('startstop').addEventListener('click', () => {
  if (!editMode) {
    startEditMode();
  } else {
    stopEditMode();
  }
});
 // SAVE dugme
document.getElementById('save').addEventListener('click', () => {
  const chatContainer = document.getElementById('chatContainer');

  // Pozadina chatContainer-a
  const bg = {
    image: chatContainer.style.backgroundImage || '',
    size: chatContainer.style.backgroundSize || '',
    position: chatContainer.style.backgroundPosition || '',
    repeat: chatContainer.style.backgroundRepeat || '',
    width: chatContainer.style.width || chatContainer.offsetWidth + 'px',
    height: chatContainer.style.height || chatContainer.offsetHeight + 'px'
  };


  // Spremi sve draggable elemente
  const elements = allDraggables.map(sel => {
    const el = document.querySelector(sel);
    if (!el) return null;

    return {
      id: el.id,
      top: el.style.top || el.offsetTop + 'px',
      left: el.style.left || el.offsetLeft + 'px',
      width: el.style.width || el.offsetWidth + 'px',
      height: el.style.height || el.offsetHeight + 'px'
    };
  }).filter(Boolean);

 
 const saveData = { background: bg, elements };
  const json = JSON.stringify(saveData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'chat-layout.json';
  a.click();
  URL.revokeObjectURL(url);
});

function applyEditModeStyles() {
  // Sakrij bordere
  const chatContainer = document.getElementById('chatContainer');
  if (chatContainer) chatContainer.style.border = 'none';

  const chatInput = document.getElementById('chatInput');
  if (chatInput) chatInput.style.border = 'none';

  const guestList = document.getElementById('guestList');
  if (guestList) guestList.style.borderBottom = 'none';

  // Spusti dugmice ispod background-a
  ['openModal', 'sound', 'smilesBtn', 'GBtn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.zIndex = '1000';
  });
}
// Funkcija za renderovanje layouta
function renderLayout(data) {
   // Očisti draggable elemente koji nisu deo nove verzije
  allDraggables.forEach(sel => {
    const el = document.querySelector(sel);
    if (el && el.id && !data.elements.find(e => e.id === el.id)) {
      el.remove();
    }
  });
  allDraggables.length = 0;

  // Postavi pozadinu
  const chatContainer = document.getElementById('chatContainer');
  if (chatContainer) {
    chatContainer.style.backgroundImage = data.background?.image || '';
    chatContainer.style.backgroundSize = data.background?.size || '';
    chatContainer.style.backgroundPosition = data.background?.position || '';
    chatContainer.style.backgroundRepeat = data.background?.repeat || '';
    chatContainer.style.border = 'none';

    if (data.background) {
      chatContainer.style.width = data.background.width;
      chatContainer.style.height = data.background.height;
    }
  }

  // Postavi elemente
  data.elements.forEach(item => {
    const el = document.getElementById(item.id);
    if (!el) return;
    el.style.position = 'absolute';
    el.style.top = item.top;
    el.style.left = item.left;
    el.style.width = item.width;
    el.style.height = item.height;

    if (!allDraggables.includes(`#${item.id}`)) {
      allDraggables.push(`#${item.id}`);
    }
  });

  // Ukloni toolbar
  const toolbar = document.getElementById('toolbar');
  if (toolbar && toolbar.parentNode) {
    while (toolbar.firstChild) {
      toolbar.parentNode.insertBefore(toolbar.firstChild, toolbar);
    }
    toolbar.remove();
  }

  // Ukloni border bottom kod guest elemenata
  let style = document.getElementById('remove-guest-borders');
  if (!style) {
    style = document.createElement('style');
    style.id = 'remove-guest-borders';
    document.head.appendChild(style);
  }
  style.textContent = `
    .guest, .virtual-guest {
      border-bottom: none !important;
    }
  `;

  // Sakrij scrollbar u messageArea
  let hideScrollbarStyle = document.getElementById('hide-scrollbar-style');
  if (!hideScrollbarStyle) {
    hideScrollbarStyle = document.createElement('style');
    hideScrollbarStyle.id = 'hide-scrollbar-style';
    hideScrollbarStyle.textContent = `
      #messageArea {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      #messageArea::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(hideScrollbarStyle);
  }

  // Stilizuj draggable elemente
  allDraggables.forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;

    el.style.zIndex = '1400';
    el.style.border = 'none';
    el.style.boxShadow = 'none';
    el.style.userSelect = 'none';
    el.style.margin = '0';
    el.style.padding = '0';
    el.style.pointerEvents = 'auto';

    if (el.id === 'chatInput' || el.id === 'messageArea' || el.id === 'guestList') {
      el.style.background = 'transparent';
    }

    if (el.tagName.toUpperCase() === 'BUTTON') {
      el.style.position = 'absolute';
      el.style.background = 'transparent';
      el.style.color = 'transparent';
      el.style.border = 'none';
      el.innerText = '';

      if (el._blockClickHandler) {
        el.removeEventListener('click', el._blockClickHandler, true);
        delete el._blockClickHandler;
      }
    }

    try { interact(el).unset(); } catch (e) {}
  });
}

// Load blok sa socket emit
document.getElementById('load').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';

  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target.result);

        // Emituj podatke serveru
        socket.emit('chat-layout-update', data);

        // Renderuj lokalno odmah
        renderLayout(data);

      } catch {
        alert('Nevalidan fajl!');
      }
    };

    reader.readAsText(file);
  };

  input.click();
});

// Socket on za ažuriranje layouta sa servera
socket.on('chat-layout-update', data => {
  setTimeout(() => {
    renderLayout(data);
  }, 5000);
});


document.getElementById('reset').addEventListener('click', () => {
  socket.emit('reset-layout');      // emit svima
  performReset();                   // lokalni reset
});

function performReset() {
  // VRATI TOOLBAR ako nema
  let toolbar = document.getElementById('toolbar');
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.id = 'toolbar';
    toolbar.style.display = 'flex';
    toolbar.style.gap = '5px';
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
      chatContainer.insertBefore(toolbar, chatContainer.firstChild);
    }
  }

  // VRATI DUGMIĆE u toolbar sa originalnim tekstom i stilovima
  ['openModal', 'sound', 'smilesBtn', 'GBtn', 'messageArea', 'guestList', 'chatInput'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    // Vrati dugmiće u toolbar ako su button, ili ih ostavi na mestu (messageArea, guestList, chatInput)
    if (el.tagName.toUpperCase() === 'BUTTON') {
      toolbar.appendChild(el);
    }

    // Resetuj stilove
    el.style.position = '';
    el.style.top = '';
    el.style.left = '';
    el.style.width = '';
    el.style.height = '';
    el.style.boxShadow = '';
    el.style.border = '';
    el.style.userSelect = '';
    el.style.padding = '';
    el.style.margin = '';
    el.style.zIndex = '';
    el.style.pointerEvents = '';
    el.style.background = '';
    el.style.color = '';

    el.style.transform = 'none';
    el.removeAttribute('data-x');
    el.removeAttribute('data-y');

    // Vrati originalni tekst za dugmad
    if (el.tagName.toUpperCase() === 'BUTTON') {
  const key = originalButtonText.has(`#${id}`) ? `#${id}` : id;
el.innerText = originalButtonText.get(key) || '';
 if (el._blockClickHandler) {
        el.dataset.disabled = 'false';
        el.removeEventListener('click', el._blockClickHandler, true);
        delete el._blockClickHandler;
      }
    }
  });

  // VRATI GOST BORDER
  const style = document.getElementById('remove-guest-borders');
  if (style) style.remove();

  document.querySelectorAll('.guest, .virtual-guest').forEach(el => {
    el.style.borderBottom = '';
  });

  // VRATI CHAT CONTAINER
  const chatContainer = document.getElementById('chatContainer');
  if (chatContainer) {
    chatContainer.style.zIndex = '';
    chatContainer.style.border = '';
    chatContainer.style.backgroundImage = '';
    chatContainer.style.backgroundSize = '';
    chatContainer.style.backgroundPosition = '';
    chatContainer.style.backgroundRepeat = '';
    chatContainer.style.width = '';
    chatContainer.style.height = '';
  }

if (chatInput) {
  chatInput.style.position = 'absolute';
  chatInput.style.top = '60px';
  chatInput.style.left = '120px';
  chatInput.style.width = '500px';
  chatInput.style.height = '25px';
  chatInput.style.padding = '5px';
  chatInput.style.borderRadius = '5px';
  chatInput.style.border = '2px solid white';
  chatInput.style.backgroundColor = 'black';
  chatInput.style.color = 'white';
  chatInput.style.fontSize = '17px';
  chatInput.style.resize = 'none';
  chatInput.style.overflow = 'hidden';
  chatInput.style.outline = 'none';
}

  // Setuj editMode na false
  editMode = false;
}

socket.on('reset-layout', () => {
  performReset();
});
