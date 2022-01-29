import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import State from "./client/state.js";

// create app
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// add dev reload
(async () => {
    var env = process.env.NODE_ENV || 'development';
    if (env == "development") {
        const livereload = await import("livereload");
        const liveReloadServer = livereload.createServer();
        liveReloadServer.watch(path.join(__dirname, 'client'));
        console.warn("live reload activated")
    }
})();

// static hosting client folder
const clientFolder = path.join(__dirname, 'client');
app.use(express.static(clientFolder));

// create server
const httpServer = http.createServer(app);
const io = new Server(httpServer);

// socket.io setup
io.on('connection', (socket) => {
    let user;

    // user connected
    console.log(`[IO] <${socket.id}> a user connected`);
    let msg = `User <${socket.id}> connected`;
    socket.broadcast.emit('chat message', { from: socket.id, msg });
    let state = State.addPlayer({id: socket.id, name: "Unknown"});
    io.emit('update', state);

    // log all messages
    socket.onAny((message, ...args) => {
        console.log(`[IO] <${socket.id}> Received: ${message}`, ...args);
    });

    // handle disconnect
    socket.on('disconnect', (reason) => {
        console.log(`[IO] <${socket.id}> a user disconnected: ${reason}`);
        let msg = `User <${socket.id}> disconnected: ${reason}`;
        socket.broadcast.emit('chat message', { from: socket.id, msg });
        socket.broadcast.emit('left', { from: socket.id, user: user });
        let state = State.removePlayer(socket.id);
        io.emit('update', state);
    });

    // handle messages
    socket.on('chat message', (msg) => {
        io.emit('chat message', { from: socket.id, msg });
    });

    // handle command
    socket.on('command', (cmd) => {
        let state = State.applyCommand({id: socket.id, cmd});
        io.emit('update', state);
    });
});

// start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`[SERVER] listening on http://localhost:${PORT}`);
})
