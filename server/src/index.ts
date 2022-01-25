import express, { } from 'express';
import path from 'path';
import socket from 'socket.io';
import http from "http";




var env = process.env.NODE_ENV || 'development';
if (env == "development") {
  require('dotenv').config({ path: '../.env' })
}


const PORT = process.env.PORT || 5000


type join = {
  room: string;
  user: string;
}

type updateData = {

  x: number;
  y: number;
} & join;


const app = express();
app.set("port", PORT);

var httpServer = new http.Server(app);
const io = new socket.Server(httpServer);

io.on('connection', socket => {
  socket.on('join', (data: join) => {
    console.log(`Join ${data.user} in ${data.room}`)

    socket.to(data.room).emit('join', data);
    socket.join(data.room);


  })

  socket.on('update', (data: updateData) => {
    socket.to(data.room).emit('update', data);
    if (socket.rooms.has(data.room)) {
      socket.join(data.room);
    }
  })


});


app.use(express.static(path.join(__dirname, 'public')))
  .use(express.json())
  .use(express.urlencoded({ extended: false }))



// start our simple server up on localhost:3000
const server = httpServer
  .listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));

