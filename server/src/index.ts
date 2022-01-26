import express, { } from 'express';
import path from 'path';
import socket from 'socket.io';
import http from "http";




var env = process.env.NODE_ENV || 'development';
if (env == "development") {
  require('dotenv').config({ path: '../.env' })
}


const PORT = process.env.PORT || 5000



type UserData = {
  room: string;
  user: string;
}



const app = express();
app.set("port", PORT);

var httpServer = new http.Server(app);
const io = new socket.Server(httpServer);

io.on('connection', socket => {
  let room: string | undefined;
  let user: string | undefined;
  console.log('connected');
  socket.onAny((message, data: UserData) => {
    console.log(`Recived ${message} from ${data.user}`)
    socket.to(data.room).emit(message, data);
    // join the room if not already
    if (!socket.rooms.has(data.room)) {
      room = data.room;
      user = data.user;
      console.log(`Join ${data.user} in ${data.room}`)
      socket.join(data.room);
    }
  })

  socket.on('disconnect', reason => {
    console.log(`Recived disconect from ${user}`)
    if (room) {
      io.to(room).emit('left', { user: user });
    }
  })
});


app.use(express.static(path.join(__dirname, 'public')))
  .use(express.json())
  .use(express.urlencoded({ extended: false }))



// start our simple server up on localhost:PORT
const server = httpServer
  .listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));

