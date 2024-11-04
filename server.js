const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { connectDB, User } = require('./mongo');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Poveži se sa bazom podataka
connectDB();

let users = {};
let assignedNumbers = new Set();

app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });

    try {
        await user.save();
        res.status(201).send('User registered');
    } catch (err) {
        console.error('Greška prilikom registracije:', err);
        res.status(400).send('Error registering user');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }

    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
        io.emit('userLoggedIn', username);
        res.send('Logged in');
    } else {
        res.status(400).send('Invalid credentials');
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Generiši broj u opsegu 1111-9999 koji još nije dodeljen
function generateUniqueNumber() {
    let number;
    do {
        number = Math.floor(Math.random() * 8889) + 1111;
    } while (assignedNumbers.has(number));
    assignedNumbers.add(number);
    return number;
}

const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        const userId = socket.id;
        const uniqueNumber = generateUniqueNumber();
        const nickname = `Gost-${uniqueNumber}`;
        const userStyles = { bold: false, italic: false, color: '#FFFFFF' };

        users[userId] = { nickname, styles: userStyles };
        console.log(`${nickname} se povezao.`);

        socket.broadcast.emit('newGuest', nickname);
        io.emit('updateGuestList', Object.values(users).map(user => ({ ...user.styles, nickname: user.nickname })));

        socket.on('updateStyle', (newStyles) => {
            if (users[userId]) {
                users[userId].styles = { ...users[userId].styles, ...newStyles };
            }
            io.emit('updateGuestList', Object.values(users).map(user => ({ ...user.styles, nickname: user.nickname })));
        });

        socket.on('userLoggedIn', (username) => {
            users[userId] = { nickname: username, styles: userStyles };
            io.emit('updateGuestList', Object.values(users).map(user => ({ ...user.styles, nickname: user.nickname })));
        });

        socket.on('chatMessage', (msgData) => {
            const time = new Date().toLocaleTimeString();
            const messageToSend = {
                text: msgData.text,
                bold: msgData.bold,
                italic: msgData.italic,
                color: msgData.color,
                nickname: users[userId].nickname,
                time: time
            };
            io.emit('chatMessage', messageToSend);
        });

        socket.on('disconnect', () => {
            console.log(`${users[userId].nickname} se odjavio.`);
            assignedNumbers.delete(parseInt(users[userId].nickname.split('-')[1], 10));
            delete users[userId];
            io.emit('updateGuestList', Object.values(users).map(user => ({ ...user.styles, nickname: user.nickname })));
        });
    });
};

setupSocketHandlers(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server je pokrenut na portu ${PORT}`);
});
