document.addEventListener("DOMContentLoaded", () => {
    const authorizedUsers = new Set(['Radio Galaksija', 'ZI ZU', '*__X__*']); // Privilegovani korisnici
    let hasBanPrivilege = false;
    let isBanned = false; // Praćenje statusa banovanja

    const guestList = document.getElementById("guestList");
    const chatContainer = document.getElementById("chatContainer"); // Referenca na chat

    if (!guestList) {
        console.error("Element sa id='guestList' nije pronađen.");
        return;
    }

    // Prijava korisnika
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-socket-id': socket.id  
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (response.ok) {
                socket.emit('userLoggedIn', username);
                this.reset();

                // Provera da li je korisnik privilegovan
                if (authorizedUsers.has(username)) {
                    hasBanPrivilege = true; 
                }
            }
        });

            // Dvoklik na korisnike
    guestList.addEventListener("dblclick", (event) => {
    const target = event.target;
    if (!target.classList.contains("guest")) return;

    const nickname = target.textContent.split(" (")[0].trim().replace(/( (B|I))/g, '');

    // Samo *__X__* može banovati sve
    if (hasBanPrivilege && username === '*__X__*') {
        const action = target.classList.toggle("banned") ? "banUser" : "unbanUser";
        target.style.backgroundColor = action === "banUser" ? "red" : "";
        target.textContent = `${nickname}${action === "banUser" ? " (B)" : ""}`;
        socket.emit(action, nickname);
    } else if (hasBanPrivilege && !authorizedUsers.has(nickname)) {
        // Ostali privilegovani ne mogu banovati autorizovane
        const action = target.classList.toggle("banned") ? "banUser" : "unbanUser";
        target.style.backgroundColor = action === "banUser" ? "red" : "";
        target.textContent = `${nickname}${action === "banUser" ? " (B)" : ""}`;
        socket.emit(action, nickname);
    }
});

        // Slušanje događaja za banovanje
        socket.on("userBanned", (nickname) => {
            const elements = document.querySelectorAll('.guest');
            elements.forEach((el) => {
                if (el.textContent.split(" (")[0].trim().replace(/( (B|I))/g, '') === nickname) {
                    el.classList.add("banned");
                    el.style.backgroundColor = "red";
                    if (!el.textContent.includes(" (B)")) {
                        el.textContent += " (B)";
                    }
                }
            });

            if (nickname === socket.id) {
                isBanned = true;
                document.getElementById('chat-input').disabled = true;
                chatContainer.style.display = 'none';
            }
        });

        // Slušanje događaja za odbanovanje
        socket.on("userUnbanned", (nickname) => {
            const elements = document.querySelectorAll('.guest');
            elements.forEach((el) => {
                if (el.textContent.split(" (")[0].trim().replace(/( (B|I))/g, '') === nickname) {
                    el.classList.remove("banned");
                    el.style.backgroundColor = "";
                    el.textContent = el.textContent.replace(" (B)", "");
                }
            });

                   if (nickname === socket.id) {
                isBanned = false;
                document.getElementById('chat-input').disabled = false;
                chatContainer.style.display = 'block';
            }
        }); 
    }); 
}); 

