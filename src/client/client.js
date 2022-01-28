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
        this.user = {
            id: null
        };
        this.map = {};
        this.players = {};
        this.events = [];
        this.messages = [];
    }

    async init() {
        console.log("[STATE] Map loading...");
        // state.map = await loadMap("orthogonal-outside", "./maps");
        state.map = await loadMap("samplemap","./maps/village");
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
    const actorLayerPosition = state.map.properties.actorlayer?? state.maplayers.length;

    // configure map
    uiMap.style = `--actor-layer:${actorLayerPosition};--h-tiles:${state.map.width};--v-tiles:${state.map.height};--tileWidth:${state.map.tileWidth}; --tileHeight:${state.map.tileHeight}`
   
     // create a layer for all sprites if it will be positioned in next layer
    const actorLayerDiv = document.createElement("div");
    actorLayerDiv.classList.add("layer");
    actorLayerDiv.classList.add("actor");
    uiMap.appendChild(actorLayerDiv);
    uiActors = actorLayerDiv;
    
    // for all layers
    for (let l = 0; l < state.map.layers.length; ++l) {

     

        let layer = state.map.layers[l];
        let layerDiv = document.createElement("div");
        layerDiv.classList.add("layer");
        uiMap.appendChild(layerDiv);

        let rowDiv = null;
        let xPos=0;
        let yPos=0;
        // for all tiles
        for (let i = 0; i < layer.data.length; ++i) {
            // new row
            if (i % layer.width === 0) {
                rowDiv = document.createElement("div");
                rowDiv.classList.add("row");
                layerDiv.appendChild(rowDiv);
                xPos=0; 
                yPos++;
            }
            xPos++;
            // new tile
            const [tileSetIndex, tileIndex] = layer.data[i] ?? [undefined, undefined];
            if(tileSetIndex !== undefined && tileIndex !== undefined){

                const tileSet = state.map.tilesets[tileSetIndex]
                let tileId = tileIndex;
                let tileDiv = document.createElement("div");
                tileDiv.id = `layer_${l}_tile_${i}`;
                tileDiv.classList.add("tile");
                tileDiv.style.setProperty('--y', yPos);
                tileDiv.style.setProperty('--x', xPos);
                tileDiv.style.setProperty('--layer', l);
                
                let offsetY = -(Math.floor(tileId / tileSet. tilesPerRow)) * tileSet.tileHeight;
                let offsetX = -(tileId % tileSet.tilesPerRow) * tileSet.tileWidth;
                
                tileDiv.style.background = `url(${tileSet.imgPath}) no-repeat ${offsetX}px ${offsetY}px`;
                tileDiv.style.width = `${tileSet.tileWidth}px`;
                tileDiv.style.height = `${tileSet.tileHeight}px`;
                rowDiv.appendChild(tileDiv);
            }else{
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
        const spriteDiv=document.createElement("div");
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
