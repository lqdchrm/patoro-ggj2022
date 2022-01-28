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
    const connectLivereload = require("connect-livereload");
    // open livereload high port and start to watch public directory for changes
    const liveReloadServer = livereload.createServer();
    liveReloadServer.watch(path.join(__dirname, 'client'));

    console.warn("live reload activated")
    // monkey patch every served HTML so they know of changes
    app.use(connectLivereload());
}

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
    console.log(`[SERVER] listening on http://localhost:${PORT}`);
})
