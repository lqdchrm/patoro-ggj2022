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

    constructor() {
        super();
        this.user = { id: null };
        this.map = {};
        this.players = {};
        this.events = [];
        this.messages = [];
    }

    async init() {
        console.log("[STATE] Map loading...");
        // state.map = await loadMap("orthogonal-outside", "./maps");
        state.map = await loadMap("samplemap", "./maps/village");
        console.log("[STATE] ...Map loaded");
        await updateMap();
        await updateSprites();
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
    await state.init();
    state.events.push("Hello World");
})();

//#endregion
////////////////////////////////////////////////////////////////////////////////
