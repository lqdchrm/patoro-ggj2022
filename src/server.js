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

    // user connected
    console.log(`[IO] <${socket.id}> a user connected`);
    let msg = `User <${socket.id}> connected`;
    socket.broadcast.emit('chat message', { from: socket.id, msg });

    // log all messages
    socket.onAny((message, ...args) => {
        console.log(`[IO] <${socket.id}> Received: ${message}`, ...args);
    });

    // handle disconnect
    socket.on('disconnect', (reason) => {
        console.log(`[IO] <${socket.id}> a user disconnected: ${reason}`);
        let msg = `User <${socket.id}> disconnected: ${reason}`;
        socket.broadcast.emit('chat message', { from: socket.id, msg });
    });

    // handle messages
    socket.on('chat message', (msg) => {
        io.emit('chat message', { from: socket.id, msg });
    });
});

// start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`[SERVER] listening on *:${PORT}`);
})
