const path = require('path');
const express = require('express');
const http = require('http');
const ioLib = require("socket.io");

// create app
const app = express();

// static hosting client folder
const clientFolder = path.join(__dirname, 'client');
app.use(express.static(clientFolder));

// create server
const httpServer = http.createServer(app);
const io = new ioLib.Server(httpServer);

// socket.io setup
io.on('connection', (socket) => {
    console.log(`[IO] <${socket.id}> a user connected`);

    // log all messages
    socket.onAny((message, ...args) => {
        console.log(`[IO] <${socket.id}> Received: ${message}`, ...args);
    });

    // handle messages
    socket.on('chat message', (msg) => {
        io.emit('chat message', {from: socket.id, msg});
      });
});

httpServer.listen(3000, () => {
    console.log('[SERVER] listening on *:3000');
})
