////////////////////////////////////////////////////////////////////////////////
// ██╗███╗   ███╗██████╗  ██████╗ ██████╗ ████████╗███████╗
// ██║████╗ ████║██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝
// ██║██╔████╔██║██████╔╝██║   ██║██████╔╝   ██║   ███████╗
// ██║██║╚██╔╝██║██╔═══╝ ██║   ██║██╔══██╗   ██║   ╚════██║
// ██║██║ ╚═╝ ██║██║     ╚██████╔╝██║  ██║   ██║   ███████║
// ╚═╝╚═╝     ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝
//#region Imports

import "/socket.io/socket.io.js";
import { loadMap } from "./map-loader.js";

//#endregion
////////////////////////////////////////////////////////////////////////////////





////////////////////////////////////////////////////////////////////////////////
//  ██████╗  █████╗ ███╗   ███╗███████╗    ███████╗████████╗ █████╗ ████████╗███████╗
// ██╔════╝ ██╔══██╗████╗ ████║██╔════╝    ██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██╔════╝
// ██║  ███╗███████║██╔████╔██║█████╗      ███████╗   ██║   ███████║   ██║   █████╗
// ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝      ╚════██║   ██║   ██╔══██║   ██║   ██╔══╝
// ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗    ███████║   ██║   ██║  ██║   ██║   ███████╗
//  ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝
//#region GameState
const state = new class extends EventTarget {

    /**
     * @type {Record<string, {sprite:HTMLDivElement}>}
     */
    get players() {
        return this._players
    }

    constructor() {
        super();
        this.user = {
            id: null
        };
        this.map = {};
        this._players = {};
        this.events = [];
        this.messages = [];
        this.nextTurn = undefined;
    }

    async init() {
        console.log("[STATE] Map loading...");
        // state.map = await loadMap("orthogonal-outside", "./maps");
        state.map = await loadMap("samplemap", "./maps/village");
        console.log("[STATE] ...Map loaded");
        await updateMap();
        await updateSprites();
    }

    /**
     * 
     * @param {direction:'up'|'down'|'left'|'right'} direction 
     */
    setTurn(nextTurn) {
        if (this.nextTurn != undefined) {
            this.nextTurn = nextTurn;
            socket.emit('turn', this.nextTurn);
        }
    }

    /**
     * 
     * @param {string} playerName 
     * @returns The player
     */
    addPlayer(playerName) {
        const player = {
            sprite: createSprite('man', 3, 3, playerName)
        }
        this.players[playerName] = player;
        return player
    }

    removePlayer(playerName) {
        if (this.players[playerName]) {
            const player = this.players[playerName];
            player.sprite.remove();
            delete this.players[playerName];
        }
    }



};



//#endregion
////////////////////////////////////////////////////////////////////////////////





////////////////////////////////////////////////////////////////////////////////
// ██╗   ██╗██╗    ██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗     ███████╗██████╗ ███████╗
// ██║   ██║██║    ██║  ██║██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝██╔══██╗██╔════╝
// ██║   ██║██║    ███████║███████║██╔██╗ ██║██║  ██║██║     █████╗  ██████╔╝███████╗
// ██║   ██║██║    ██╔══██║██╔══██║██║╚██╗██║██║  ██║██║     ██╔══╝  ██╔══██╗╚════██║
// ╚██████╔╝██║    ██║  ██║██║  ██║██║ ╚████║██████╔╝███████╗███████╗██║  ██║███████║
//  ╚═════╝ ╚═╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝
//#region UI Handlers

var form = document.getElementById('form');
var input = document.getElementById('input');

var uiMessages = document.getElementById('messages');
var uiUserId = document.getElementById('userId');
var uiRound = document.getElementById('round');

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

state.user = new Proxy(state.user, {
    set: function (target, key, value) {
        target[key] = value;
        uiUserId.textContent = target.id;
        return true;
    },
});

state.events = new Proxy(state.events, {
    set: function (target, key, value) {
        target[key] = value;
        uiRound.textContent = target.length;
        return true;
    },
});

state.messages = new Proxy(state.messages, {
    set: function (target, key, value) {
        target[key] = value;

        let idx = parseInt(key);
        if (idx === target.length - 1) {
            var item = document.createElement('li');
            item.textContent = target[idx];
            uiMessages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
        }

        return true;
    }
});

//#endregion
////////////////////////////////////////////////////////////////////////////////





////////////////////////////////////////////////////////////////////////////////
// ███████╗ ██████╗  ██████╗██╗  ██╗███████╗████████╗    ██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗     ███████╗██████╗ ███████╗
// ██╔════╝██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝    ██║  ██║██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝██╔══██╗██╔════╝
// ███████╗██║   ██║██║     █████╔╝ █████╗     ██║       ███████║███████║██╔██╗ ██║██║  ██║██║     █████╗  ██████╔╝███████╗
// ╚════██║██║   ██║██║     ██╔═██╗ ██╔══╝     ██║       ██╔══██║██╔══██║██║╚██╗██║██║  ██║██║     ██╔══╝  ██╔══██╗╚════██║
// ███████║╚██████╔╝╚██████╗██║  ██╗███████╗   ██║       ██║  ██║██║  ██║██║ ╚████║██████╔╝███████╗███████╗██║  ██║███████║
// ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝       ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝
//#region Socket Handlers
const socket = io();

// on connect
socket.on('connect', () => {
    state.user.id = socket.id;
    console.log(`[IO] Connected`);
    state.messages.push(`Connected to Server`);
});

// on disconnect
socket.on('disconnect', (reason) => {
    console.log(`[IO] Disconnected: ${reason}`);
    state.messages.push(`Disconnected from Server: ${reason}`);
    if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, you need to reconnect manually
        socket.connect();
    }
});

// log everything
socket.onAny((message, ...args) => {
    console.log(`[IO] Received ${message}: `, ...args);
});

// handle chat messages
socket.on('chat message', function ({ from, msg }) {
    state.messages.push(`${from}: ${msg}`);
});



class Communication extends EventTarget {

    /**
     * @type {{userId:string, game:string}}
     */
    get userData() {
        return this._userData;
    }
    /**
     * @type {Record<string, Move | undefined>}
     */

    get moves() {
        return this._moves;
    }

    /**
     * @type {() => GameState}
     */
    get getGameState() {
        return this._getGameState;
    }

    /**
     * @type {() => number}
     */
    get requestPlayerNumber() {
        return this._requestPlayerNumber;
    }

    /**
     * @type {(playerName: string) => boolean}
     */
    get isPlayerKnown() {
        return this._isPlayerKnown;
    }

    /**
     * 
     * @param {{userId:string, game:string}}} userData 
     * @param {()=>Gamestate)} requestGameState 
     * @param {()=>number)} getPlayerNumber 
     * @param {(playername:string)=>boolean} isPlayerKnown 
     */
    constructor(userData, requestGameState, getPlayerNumber, isPlayerKnown) {
        super();
        this._userData = userData;
        this._getGameState = requestGameState;
        this._requestPlayerNumber = getPlayerNumber;
        this._isPlayerKnown = isPlayerKnown;
        this.socket = socket;
        this.socket.on('join', data => this.handleJoin(data))
        this.socket.on('left', data => this.handleLeve(data))
        this.socket.on('move', data => this.handleMove(data))
        this.socket.on('gameState', data => this.handleGameState(data))
        this.socket.on('requestGameState', data => this.handleRequestGameState(data))
        this.send('join', userData);
    }

    /**
     * 
     * @param {TurnData} data 
     */
    submitMove(data) {
        console.debug('try submit move Move');
        if (!this.moves[this.userData.user]) {
            console.debug('Submitting Move');
            this.moves[this.userData.user] = data;
            this.send('move', data);
            this.CheckAllMoved();

        }
    }

    requestGameState() {
        this.send('requestGameState', {})
    }


    handleRequestGameState() {
        this.send('gameState', this.getGameState());
    }

    /**
     * 
     * @param { GameState & UserData} data 
     */
    handleGameState(data) {
        this.dispatchEvent(new CustomEvent('RecivedGameState', { state: data }));

        // const handlers = this.handlers.RecivedGameState;
        //   if (handlers) {
        //     for (let index = 0; index < handlers.length; index++) {
        //       const handler = handlers[index];
        //       handler({ state: data });
        //     }
        //   }
    }

    /**
     * 
     * @param {Join & UserData} data 
     */
    handleJoin(data) {
        console.debug("recived Join", data);

        if (!this.isPlayerKnown(data.user)) {

            console.debug(`Player ${data.user} joind`)
            this.send('join', this.userData);
            this.send('gameState', this.getGameState());
            this.dispatchEvent(new CustomEvent('AddPlayer', { player: data.user }))
            // const handlers = this.handlers.AddPlayer;
            // if (handlers) {
            //   for (let index = 0; index < handlers.length; index++) {
            //     const handler = handlers[index];
            //     handler({ player: data.user });
            //   }
            // }
        }
    }

    /**
     * 
     * @param {Join & UserData} data 
     */
    handleLeve(data) {
        console.debug("recived left", data);
        if (this.isPlayerKnown(data.user)) {
            this.dispatchEvent('RemovePlayer', data);
            // const handlers = this.handlers.RemovePlayer;
            // if (handlers) {
            //   for (let index = 0; index < handlers.length; index++) {
            //     const handler = handlers[index];
            //     handler({ player: data.user });
            //   }
            // }
            delete this.moves[data.user];
            this.CheckAllMoved();
        }
    }

    /**
     * 
     * @param {Move & UserData} data 
     */
    handleMove(data) {

        if (!this.moves[data.user] && this.isPlayerKnown(data.user)) {
            console.debug(`Player ${data.user} moved`)


            this.moves[data.user] = data;

            // test if we have all moves including our own
            this.CheckAllMoved();


        }
    }

    CheckAllMoved() {
        console.debug("check moves", this.moves);
        const numberOfPlayers = this.requestPlayerNumber();
        console.debug("check moves player count", numberOfPlayers);
        if (Object.keys(this.moves).length == numberOfPlayers) {
            console.debug('All Moves are present');
            const moveArray = Object.keys(this.moves).filter(k => this.moves[k]).map(k => ({ ...this.moves[k], player: k }));

            this.dispatchEvent('NewTurn', { moves: moveArray });

            // const handlers = this.handlers.NewTurn;
            // if (handlers) {
            //   for (let index = 0; index < handlers.length; index++) {
            //     const handler = handlers[index];
            //     const moveArray = Object.keys(this.moves).filter(k => this.moves[k]).map(k => ({ ...this.moves[k]!, player: k }));
            //     handler({ moves: moveArray });
            //   }
            // }
            this.moves = {};
        }
    }



    /**
     * 
     * @param {string} message 
     * @param {Object} data 
     */
    send(message, data) {
        this.socket.emit(message, { ...this.userData, ...data });
    }





}

//#endregion
////////////////////////////////////////////////////////////////////////////////





////////////////////////////////////////////////////////////////////////////////
// ██████╗ ███████╗███╗   ██╗██████╗ ███████╗██████╗ ███████╗██████╗
// ██╔══██╗██╔════╝████╗  ██║██╔══██╗██╔════╝██╔══██╗██╔════╝██╔══██╗
// ██████╔╝█████╗  ██╔██╗ ██║██║  ██║█████╗  ██████╔╝█████╗  ██████╔╝
// ██╔══██╗██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗██╔══╝  ██╔══██╗
// ██║  ██║███████╗██║ ╚████║██████╔╝███████╗██║  ██║███████╗██║  ██║
// ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
//#region renderer

const uiMap = document.getElementById("map");
let uiActors;


async function updateMap() {
    // clear all
    [...uiMap.children].forEach(c => c.remove());

    // define position for actor layer
    const actorLayerPosition = state.map.properties.actorlayer ?? state.maplayers.length;

    // configure map
    uiMap.style = `--actor-layer:${actorLayerPosition};--h-tiles:${state.map.width};--v-tiles:${state.map.height};--tileWidth:${state.map.tileWidth}; --tileHeight:${state.map.tileHeight}`

    // create a layer for all sprites if it will be positioned in next layer
    const actorLayerDiv = document.createElement("div");
    actorLayerDiv.classList.add("layer");
    actorLayerDiv.classList.add("actor");
    uiMap.appendChild(actorLayerDiv);
    uiActors = actorLayerDiv;

    const animationNames = {}

    // for all layers
    for (let l = 0; l < state.map.layers.length; ++l) {



        let layer = state.map.layers[l];
        let layerDiv = document.createElement("div");
        layerDiv.classList.add("layer");
        uiMap.appendChild(layerDiv);

        let rowDiv = null;
        let xPos = 0;
        let yPos = 0;
        // for all tiles
        for (let i = 0; i < layer.data.length; ++i) {
            // new row
            if (i % layer.width === 0) {
                rowDiv = document.createElement("div");
                rowDiv.classList.add("row");
                layerDiv.appendChild(rowDiv);
                xPos = 0;
                yPos++;
            }
            xPos++;
            // new tile
            const [tileSetIndex, tileIndex] = layer.data[i] ?? [undefined, undefined];
            if (tileSetIndex !== undefined && tileIndex !== undefined) {

                const tileSet = state.map.tilesets[tileSetIndex]
                let tileId = tileIndex;
                let tileDiv = document.createElement("div");
                tileDiv.id = `layer_${l}_tile_${i}`;
                tileDiv.classList.add("tile");
                tileDiv.style.setProperty('--y', yPos);
                tileDiv.style.setProperty('--x', xPos);
                tileDiv.style.setProperty('--layer', l);

                tileDiv.style.setProperty('--tileset-x', tileId % tileSet.tilesPerRow);
                tileDiv.style.setProperty('--tileset-y', Math.floor(tileId / tileSet.tilesPerRow));
                tileDiv.style.backgroundImage = `url(${tileSet.imgPath})`;

                if (tileSet.tiles[tileId]?.animation) {

                    const currentAnimation = tileSet.tiles[tileId]?.animation;
                    const name = `a${tileSetIndex}t${tileId}`;

                    const totalTime = currentAnimation.map(x => x.duration).reduce((p, v) => p + v);
                    tileDiv.style.animation = `${name} 1s linear infinite`


                    if (!animationNames[name]) {


                        // generate animation
                        let keyframes = `@keyframes ${name} { \n`

                        let currentDuration = 0;

                        for (const frame of currentAnimation) {
                            const frameTileId = frame.tileid;
                            const frameDuratoin = frame.duration;
                            const tileXPos = frameTileId % tileSet.tilesPerRow;
                            const tileYPos = Math.floor(frameTileId / tileSet.tilesPerRow);
                            keyframes += `${currentDuration * 100 / totalTime}% { --tileset-x: ${tileXPos};--tileset-y: ${tileYPos}; }\n`
                            currentDuration += frameDuratoin;
                        }
                        keyframes += `}`




                        if (document.styleSheets && document.styleSheets.length) {
                            document.styleSheets[0].insertRule(keyframes, 0);
                        } else {
                            var s = document.createElement('style');
                            s.innerHTML = keyframes;
                            document.getElementsByTagName('head')[0].appendChild(s);

                        }
                        animationNames[name] = true;
                    }

                }


                tileDiv.style.width = `${tileSet.tileWidth}px`;
                tileDiv.style.height = `${tileSet.tileHeight}px`;
                rowDiv.appendChild(tileDiv);
            } else {
                let tileDiv = document.createElement("div");
                tileDiv.id = `layer_${l}_tile_${i}`;
                tileDiv.classList.add("tile");
                tileDiv.style.width = `${state.map.tileWidth}px`;
                tileDiv.style.height = `${state.map.tileHeight}px`;
                rowDiv.appendChild(tileDiv);
            }

        }

    }
}

async function updateSprites() {
    const sampleSprite = [{
        x: 26,
        y: 29,
        direction: 'down'
    }, {
        x: 28,
        y: 27,
        direction: 'left'
    }, {
        x: 27,
        y: 28,
        direction: 'right'
    }, {
        x: 23,
        y: 15,
        direction: 'up'
    }]

    for (const sprite of sampleSprite) {
        const spriteDiv = document.createElement("div");
        spriteDiv.style.setProperty('--x', sprite.x);
        spriteDiv.style.setProperty('--y', sprite.y);
        spriteDiv.classList.add('sprite');
        spriteDiv.classList.add('man');
        spriteDiv.classList.add(sprite.direction);
        uiActors.appendChild(spriteDiv);
    }
}


/**
 * 
 * @param {'man'} type 
 * @param {number} x 
 * @param {number} y 
 * @param {string|undefined} name 
 * @returns {HTMLDivElement} that is the sprite
 */
function createSprite(type, x, y, name) {
    const spriteDiv = document.createElement("div");
    spriteDiv.style.setProperty('--x', x);
    spriteDiv.style.setProperty('--y', y);
    if (name) {
        spriteDiv.style.setProperty('--name', name);
    }
    spriteDiv.classList.add('sprite');
    spriteDiv.classList.add(type);
    spriteDiv.classList.add("down");
    uiActors.appendChild(spriteDiv);
    return spriteDiv;
}

/**
 * 
 * @param {HTMLDivElement} sprite 
 * @param {number} x 
 * @param {number} y 
 */
function setSpritePosition(sprite, x, y) {
    sprite.style.setProperty('--x', x);
    sprite.style.setProperty('--y', y);
}

//#endregion
////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////
// ███████╗████████╗ █████╗ ██████╗ ████████╗██╗   ██╗██████╗
// ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝██║   ██║██╔══██╗
// ███████╗   ██║   ███████║██████╔╝   ██║   ██║   ██║██████╔╝
// ╚════██║   ██║   ██╔══██║██╔══██╗   ██║   ██║   ██║██╔═══╝
// ███████║   ██║   ██║  ██║██║  ██║   ██║   ╚██████╔╝██║
// ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝
//#region startup

(async () => {

    const randomName = Math.random().toString();

    const nameRegex = /user=(?<value>[^&]+)/
    const roomRegex = /room=(?<value>[^&]+)/
    const name = nameRegex.exec(location.search)?.groups['value'];
    const room = roomRegex.exec(location.search)?.groups['value'];

    if (!name || !room) {
        window.location.assign(`/?user=${name ?? randomName}&room=${room ?? 'MyRoom'}`);
        return;
    }


    const userData = {
        user: name ?? randomName,
        room: room ?? 'MyRoom'
    };

    const communication = new Communication(userData, () => {
        const result = {
            positions: {}
        };

        for (const player of state.players) {
            result.positions[player.user] =
            {
                position: {
                    x: player.pos.x,
                    y: player.pos.y
                }
            }
        }


        return result;
    }, () => Object.keys(state.players), (playerName) => state.players[playerName] !== undefined);

    communication.addEventListener('AddPlayer', e => {
        state.addPlayer(e.player);
    });

    communication.addEventListener('RemovePlayer', e => {
        console.debug('Remove player', e)
        state.removePlayer(e.player)
    })


    communication.addEventListener('NewTurn', e => {
        console.debug('Recived New Turn', e)
        for (let index = 0; index < e.moves.length; index++) {

            const move = e.moves[index];
            const player = state.players[move.player] ?? state.addPlayer(move.player);

            setSpritePosition(player.sprite, move.x, move.y)
        }
    })

    communication.addEventListener('RecivedGameState', e => {
        console.debug('Recived Game State', e)
        const playerNames = Object.keys(e.state.positions);
        for (let index = 0; index < playerNames.length; index++) {
            const playerName = playerNames[index];
            const position = e.state.positions[playerName].position;
            const player = state.players[playerName] ?? state.addPlayer(playerName);
            setSpritePosition(player.sprite, position.x, position.y)
        }

    })

    await state.init();
    state.events.push("Hello World");
})();

//#endregion
////////////////////////////////////////////////////////////////////////////////
