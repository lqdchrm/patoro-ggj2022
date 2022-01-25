import { Engine, EX_VERSION, Loader } from "excalibur";
import { Player } from "./player";
import { Resources } from "./resources";
import ioclient, { io } from "socket.io-client";
import { Keys } from "excalibur/build/dist/Input";

const socket = ioclient();

type join = {
  room: string;
  user: string;
}

type updateData = {

  x: number;
  y: number;
} & join;


type playerLockup = {
  [key: string]: Player;
}

class Game extends Engine {
  initialize() {

    const players: playerLockup = {};

    const userName = Math.random().toString();

    const player = new Player(userName);
    this.add(player);

    const joinData: join = {
      user: userName,
      room: location.search ?? 'myRoom'
    };
    socket.emit('join', joinData);

    socket.on("join", async (data: join) => {
      console.log("join", data)
      if (!players[data.user] && data.user != userName) {

        const newPlayer = new Player(data.user);
        this.add(newPlayer);
        players[data.user] = newPlayer;
        socket.emit('join', joinData);
      }
    });

    socket.on('update', (data: updateData) => {
      const player = players[data.user];

      if (player) {
        player.pos.x = data.x;
        player.pos.y = data.y;
      }
    })

    const loader = new Loader();
    loader.addResource(Resources.Sword);
    this.start(loader).then(() => {
      console.log(EX_VERSION);
    });

    this.on('preupdate', e => {
      const keys = this.input.keyboard.getKeys();
      const speed = 0.5;
      let didMove = false;
      if (keys.includes("ArrowRight")) {
        player.pos.x = player.pos.x + e.delta * speed;
        didMove = true;
      }
      if (keys.includes("ArrowLeft")) {
        player.pos.x = player.pos.x - e.delta * speed;
        didMove = true;
      }
      if (keys.includes("ArrowDown")) {
        player.pos.y = player.pos.y + e.delta * speed;
        didMove = true;
      }
      if (keys.includes("ArrowUp")) {
        player.pos.y = player.pos.y - e.delta * speed;
        didMove = true;
      }
      if (didMove) {
        const data: updateData = {
          ...joinData,

          x: player.pos.x,
          y: player.pos.y
        };
        socket.emit('update', data)
      }
    })


  }
}

const game = new Game();


game.initialize();

