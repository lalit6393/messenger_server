const express = require('express');
const http = require('http');
const morgan = require('morgan');
const userRouter = require('./authenication/userauth');
const { Server } = require('socket.io');

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    },
    connectionStateRecovery: {}
});

const users = {};

io.on('connection', socket => {
    console.log('✅ Socket connected:', socket.id);

    socket.on('register', (userId) => {
        users[userId] = socket.id;
        console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on('privateMessage', ({ userId, msg }) => {
        const toSocketId = users[userId];
        if (toSocketId) {
            io.to(toSocketId).emit('privateMessage', {
                from: getUserBySocketId(socket.id), // optional
                msg
            });
        }
    })

    socket.on('chatMessage', (msg) => {
        console.log('Message:', msg);
        socket.broadcast.emit('chatMessage', msg);
    });

    socket.on('disconnect', () => {
        const userId = getUserBySocketId(socket.id);
        if (userId) {
            delete users[userId];
            console.log(`User ${userId} disconnected`);
        }
        console.log('❌ Disconnected:', socket.id);
    });
})

function getUserBySocketId(socketId) {
    return Object.keys(users).find((key) => users[key] === socketId);
}


app.use(morgan('dev'));
app.use(express.json());

app.use('/', userRouter);

module.exports = server;
