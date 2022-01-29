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
import State from "./state.js";

//#endregion
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// ██╗   ██╗██╗███████╗██╗    ██╗███╗   ███╗ ██████╗ ██████╗ ███████╗██╗
// ██║   ██║██║██╔════╝██║    ██║████╗ ████║██╔═══██╗██╔══██╗██╔════╝██║
// ██║   ██║██║█████╗  ██║ █╗ ██║██╔████╔██║██║   ██║██║  ██║█████╗  ██║
// ╚██╗ ██╔╝██║██╔══╝  ██║███╗██║██║╚██╔╝██║██║   ██║██║  ██║██╔══╝  ██║
//  ╚████╔╝ ██║███████╗╚███╔███╔╝██║ ╚═╝ ██║╚██████╔╝██████╔╝███████╗███████╗
//   ╚═══╝  ╚═╝╚══════╝ ╚══╝╚══╝ ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝
//#region ViewModel
let viewModel = new class ViewModel {

    constructor() {
        this.id = null;                 // socket id

        this.players = {};              // local players view model holding the sprite

        this.mapLoading = null;         // promise to wait for loading finish
        this.map = {};

        this.messages = [];             // chat

        this.state = State.getState();  // game state
    }

    async init() {
        // state.map = await loadMap("orthogonal-outside", "./maps");
        //state.map = await loadMap("samplemap","./maps/village");
        this.mapLoading = loadMap("killzone", "./maps/killzone");
        this.map = await this.mapLoading;
        await updateMap();
    }

    move(direction /*up, down, left, right, skip*/) {
        socket.emit('command', direction);
    }

    update(serverState) {
        // add new players
        let addedPlayers = Object.keys(serverState.players).filter(id => !this.state.players[id]);
        addedPlayers.forEach(id => {
            this.players[id] = {
                sprite: createSprite('robot', 3, 3, id)
            }
            let player = serverState.players[id];
            let moves = player.commands.slice(0, this.state.round);
            moves.forEach(move => {
                moveSprite(this.players[id].sprite, move);
            })
        });

        // remove old players
        let removedPlayers = Object.keys(this.state.players).filter(id => !serverState.players[id]);
        removedPlayers.forEach(id => {
            if (this.players[id]) {
                const localPlayer = this.players[id];
                localPlayer.sprite.remove();
                delete this.players[id];
            }
        });

        // update moves
        Object.values(serverState.players).forEach(player => {
            let moves = player.commands.slice(this.state.round, serverState.round);
            moves.forEach(move => {
                moveSprite(this.players[player.id].sprite, move);
            });
        });

        // store state
        this.state = serverState;
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

// chat input box
form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

// chat output box
viewModel.messages = new Proxy(viewModel.messages, {
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


// command buttons
document.querySelectorAll(".command").forEach(cmd => {
    cmd.addEventListener("click", () => {
        viewModel.move(cmd.id);
    });
});

// round
viewModel = new Proxy(viewModel, {
    set: function (target, key, value) {
        target[key] = value;
        switch(key) {
            case 'id':
                uiUserId.textContent = value;
                break;
            case 'state':
                uiRound.textContent = value.round;
                break;
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
    console.log(`[IO] Connected`);
    viewModel.id = socket.id;
    viewModel.messages.push(`Connected to Server`);
});

// on disconnect
socket.on('disconnect', (reason) => {
    console.log(`[IO] Disconnected: ${reason}`);
    viewModel.messages.push(`Disconnected from Server: ${reason}`);
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
    viewModel.messages.push(`${from}: ${msg}`);
});

socket.on('update', (serverState) => {
    viewModel.update(serverState);
    console.log("[STATE]: ", viewModel.state);
})

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
    const map = viewModel.map;
    const mapRoot = uiMap.parentNode;
    uiMap.remove();

    // clear all
    [...uiMap.children].forEach(c => c.remove());

    // define position for actor layer
    const actorLayerPosition = map.properties?.actorlayer ?? map.layers.length;

    // configure map
    uiMap.style = `--actor-layer:${actorLayerPosition};--h-tiles:${map.width};--v-tiles:${map.height};--tileWidth:${map.tileWidth}; --tileHeight:${map.tileHeight}`

    // create a layer for all sprites if it will be positioned in next layer
    const actorLayerDiv = document.createElement("div");
    actorLayerDiv.classList.add("layer");
    actorLayerDiv.classList.add("actor");
    uiMap.appendChild(actorLayerDiv);
    uiActors = actorLayerDiv;

    const animationNames = {}

    // for all layers
    for (let l = 0; l < map.layers.length; ++l) {
        if (map.layers[l].visible==false) continue;

        let layer = map.layers[l];
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

                const tileSet = map.tilesets[tileSetIndex]
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
                tileDiv.style.width = `${map.tileWidth}px`;
                tileDiv.style.height = `${map.tileHeight}px`;
                tileDiv.style.left = `${(xPos - 1) * map.tileWidth}px`;
                tileDiv.style.top = `${(yPos - 1) * map.tileHeight}px`;
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
    viewModel.mapLoading.then(() => uiActors.appendChild(spriteDiv));
    return spriteDiv;
}

/**
 *
 * @param {HTMLDivElement} sprite
 * @param {'up'|'down'|'left'|'right'|'skip'} direction
 */
function moveSprite(sprite, direction) {

    const x = parseInt(sprite.style.getPropertyValue('--x'));
    const y = parseInt(sprite.style.getPropertyValue('--y'));

    sprite.classList.remove('down');
    sprite.classList.remove('left');
    sprite.classList.remove('right');
    sprite.classList.remove('up');

    switch(direction) {
        case 'up':
            sprite.style.setProperty('--y', y - 1);
            sprite.classList.add('up');
            break;
        case 'down':
            sprite.style.setProperty('--y', y + 1);
            sprite.classList.add('down');
            break;
        case 'left':
            sprite.style.setProperty('--x', x - 1);
            sprite.classList.add('left');
            break;
        case 'right':
            sprite.classList.add('right');
            sprite.style.setProperty('--x', x + 1);
            break;
        case 'skip':
            break;
        default:
            throw `Unknown direction ${direction}`
    }
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
    await viewModel.init();
})();

//#endregion
////////////////////////////////////////////////////////////////////////////////
