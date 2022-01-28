const path = require('path');
const express = require('express');
const http = require('http');
const ioLib = require("socket.io");

// create app
const app = express();

// add dev reload
var env = process.env.NODE_ENV || 'development';
if (env == "development") {
    const livereload = require("livereload");
    const liveReloadServer = livereload.createServer();
    liveReloadServer.watch(path.join(__dirname, 'client'));
    console.warn("live reload activated")
}

// static hosting client folder
const clientFolder = path.join(__dirname, 'client');
app.use(express.static(clientFolder));

// create server
const httpServer = http.createServer(app);
const io = new ioLib.Server(httpServer);

// socket.io setup
io.on('connection', (socket) => {
    let user;
    // user connected
    console.log(`[IO] <${socket.id}> a user connected`);
    let msg = `User <${socket.id}> connected`;
    socket.broadcast.emit('chat message', { from: socket.id, msg });

    // log all messages
    socket.onAny((message, ...args) => {
        if (args[0] && args[0].user) {
            user = args[0].user;
        }
        console.log(`[IO] <${socket.id}> Received: ${message}`, ...args);
        socket.broadcast.emit(message, ...args);
    });

    // handle disconnect
    socket.on('disconnect', (reason) => {
        console.log(`[IO] <${socket.id}> a user disconnected: ${reason}`);
        let msg = `User <${socket.id}> disconnected: ${reason}`;
        socket.broadcast.emit('chat message', { from: socket.id, msg });
        socket.broadcast.emit('left', { from: socket.id, user: user });
    });

    // handle messages
    socket.on('chat message', (msg) => {
        io.emit('chat message', { from: socket.id, msg });
    });
});

// start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`[SERVER] listening on http://localhost:${PORT}`);
})
