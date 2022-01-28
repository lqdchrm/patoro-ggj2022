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
        this.user = { id: null };
        this.map = {};
        this._players = {};
        this.events = [];
        this.messages = [];
        this.nextTurn = undefined;
    }

    async init() {
        console.log("[STATE] Map loading...");
        // state.map = await loadMap("orthogonal-outside", "./maps");
        //state.map = await loadMap("samplemap","./maps/village");
        state.map = await loadMap("killzone","./maps/killzone");
        console.log("[STATE] ...Map loaded");
        await updateMap();
    }

    /**
     * 
     * @param {direction:'up'|'down'|'left'|'right'} direction 
     */
    setTurn(direction) {
        if (this.nextTurn == undefined) {
            this.nextTurn = { direction };
            communication.submitMove(this.nextTurn);
            // socket.emit('turn', this.nextTurn);
        }
    }

    /**
     * 
     * @param {string} playerName 
     * @returns The player
     */
    addPlayer(playerName) {
        const player = {
            sprite: createSprite('robot', 3, 3, playerName)
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

    updateState(update) {
        for (let index = 0; index < update.length; index++) {

            const playerMove = update[index];
            const player = state.players[playerMove.player] ?? state.addPlayer(playerMove.player);

            moveSprite(player.sprite, playerMove.direction)
            this.nextTurn = undefined;
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

document.querySelectorAll(".command").forEach(cmd => {
    cmd.addEventListener("click", (evt) => {
        socket.emit("command", cmd.id);
        state.setTurn(cmd.id);
    });
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
            uiMessages.scrollTo(0, uiMessages.scrollHeight);
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


/**
* @type {Communication}
*/
let communication;

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
        this._moves = {};

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
        this.dispatchEvent(new CustomEvent('RecivedGameState', { detail: data }));

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
            this.dispatchEvent(new CustomEvent('AddPlayer', { detail: { player: data.user } }))
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
            this.dispatchEvent(new CustomEvent('RemovePlayer', { detail: data }));
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

            this.dispatchEvent(new CustomEvent('NewTurn', { detail: moveArray }));

            // const handlers = this.handlers.NewTurn;
            // if (handlers) {
            //   for (let index = 0; index < handlers.length; index++) {
            //     const handler = handlers[index];
            //     const moveArray = Object.keys(this.moves).filter(k => this.moves[k]).map(k => ({ ...this.moves[k]!, player: k }));
            //     handler({ moves: moveArray });
            //   }
            // }
            this._moves = {};
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
    const mapRoot = uiMap.parentNode;
    uiMap.remove();

    // clear all
    [...uiMap.children].forEach(c => c.remove());

    // define position for actor layer
    const actorLayerPosition = state.map.properties?.actorlayer ?? state.map.layers.length;

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

        let xPos = 0;
        let yPos = 0;

        // for all tiles
        for (let i = 0; i < layer.data.length; ++i) {

            // new row
            if (i % layer.width === 0) {
                xPos = 0;
                yPos++;
            }
            xPos++;

            // new tile
            let tileDiv = document.createElement("div");

            tileDiv.id = `layer_${l}_tile_${i}`;

            tileDiv.classList.add("tile");

            tileDiv.style.setProperty('--y', yPos);
            tileDiv.style.setProperty('--layer', l);

            const [tileSetIndex, tileIndex] = layer.data[i] ?? [undefined, undefined];
            if (tileSetIndex !== undefined && tileIndex !== undefined) {

                const tileSet = state.map.tilesets[tileSetIndex]
                let tileId = tileIndex;
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
                tileDiv.style.left = `${(xPos - 1) * tileSet.tileWidth}px`;
                tileDiv.style.top = `${(yPos - 1) * tileSet.tileHeight}px`;
            } else {
                tileDiv.style.width = `${state.map.tileWidth}px`;
                tileDiv.style.height = `${state.map.tileHeight}px`;
                tileDiv.style.left = `${(xPos - 1) * state.map.tileWidth}px`;
                tileDiv.style.top = `${(yPos - 1) * state.map.tileHeight}px`;
            }

            tileDiv.setAttribute("data-x", xPos);
            tileDiv.setAttribute("data-y", yPos);
            tileDiv.setAttribute("data-layer", l);
            layerDiv.appendChild(tileDiv);
        }
    }

    mapRoot.appendChild(uiMap);
}


/**
 * 
 * @param {'man'|'robot'} type 
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

/**
 * 
 * @param {HTMLDivElement} sprite 
 * @param {'up'|'down'|'left'|'right'} direction 
 */
function moveSprite(sprite, direction) {
    console.log(direction)
    const x = parseInt(sprite.style.getPropertyValue('--x'));
    const y = parseInt(sprite.style.getPropertyValue('--y'));

    sprite.classList.remove('down');
    sprite.classList.remove('left');
    sprite.classList.remove('right');
    sprite.classList.remove('up');



    if (direction == 'up') {
        sprite.style.setProperty('--y', y - 1);
        sprite.classList.add('up');
    } else if (direction == 'down') {
        sprite.style.setProperty('--y', y + 1);
        sprite.classList.add('down');
    }
    else if (direction == 'left') {
        sprite.style.setProperty('--x', x - 1);
        sprite.classList.add('left');
    }
    else if (direction == 'right') {
        sprite.classList.add('right');
        sprite.style.setProperty('--x', x + 1);
    }
    else {
        throw `Unknown direction ${direction}`
    }
}

function getSpritePosition(sprite) {
    const x = parseInt(sprite.style.getPropertyValue('--x'));
    const y = parseInt(sprite.style.getPropertyValue('--y'));
    return { x, y };
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

    await state.init();

    state.addPlayer(name);

    communication = new Communication(userData, () => {
        const result = {
            positions: {}
        };

        for (const player of Object.values(state.players)) {
            result.positions[player.user] =
            {
                position: getSpritePosition(player.sprite)
            }
        }


        return result;
    }, () => Object.keys(state.players).length,
        (playerName) => state.players[playerName] !== undefined);

    communication.addEventListener('AddPlayer', e => {
        state.addPlayer(e.detail.player);
    });

    communication.addEventListener('RemovePlayer', e => {
        console.debug('Remove player', e)
        state.removePlayer(e.detail.player)
    })


    communication.addEventListener('NewTurn', e => {
        console.debug('Recived New Turn', e)
        const update = e.detail;

        state.updateState(update)

    })

    communication.addEventListener('RecivedGameState', e => {
        console.debug('Recived Game State', e)
        const playerNames = Object.keys(e.detail.positions);
        for (let index = 0; index < playerNames.length; index++) {
            const playerName = playerNames[index];
            const position = e.state.positions[playerName].position;
            const player = state.players[playerName] ?? state.addPlayer(playerName);
            setSpritePosition(player.sprite, position.x, position.y)
        }

    })

    state.events.push("Hello World");
})();

//#endregion
////////////////////////////////////////////////////////////////////////////////
