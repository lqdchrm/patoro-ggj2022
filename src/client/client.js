import "/socket.io/socket.io.js";
const socket = io();


// ██╗   ██╗██╗    ██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗     ███████╗██████╗ ███████╗
// ██║   ██║██║    ██║  ██║██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝██╔══██╗██╔════╝
// ██║   ██║██║    ███████║███████║██╔██╗ ██║██║  ██║██║     █████╗  ██████╔╝███████╗
// ██║   ██║██║    ██╔══██║██╔══██║██║╚██╗██║██║  ██║██║     ██╔══╝  ██╔══██╗╚════██║
// ╚██████╔╝██║    ██║  ██║██║  ██║██║ ╚████║██████╔╝███████╗███████╗██║  ██║███████║
//  ╚═════╝ ╚═╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝
//#region UI Handlers

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
var userId = document.getElementById('userId');

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

//#endregion



// ███████╗ ██████╗  ██████╗██╗  ██╗███████╗████████╗    ██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗     ███████╗██████╗ ███████╗
// ██╔════╝██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝    ██║  ██║██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝██╔══██╗██╔════╝
// ███████╗██║   ██║██║     █████╔╝ █████╗     ██║       ███████║███████║██╔██╗ ██║██║  ██║██║     █████╗  ██████╔╝███████╗
// ╚════██║██║   ██║██║     ██╔═██╗ ██╔══╝     ██║       ██╔══██║██╔══██║██║╚██╗██║██║  ██║██║     ██╔══╝  ██╔══██╗╚════██║
// ███████║╚██████╔╝╚██████╗██║  ██╗███████╗   ██║       ██║  ██║██║  ██║██║ ╚████║██████╔╝███████╗███████╗██║  ██║███████║
// ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝       ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝
//#region Socket Handlers

socket.on('connect', () => {
    userId.textContent = socket.id;
});


socket.onAny((message, ...args) => {
    console.log(`[IO] Received ${message}: `, ...args);
});


socket.on('chat message', function ({from, msg}) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

//#endregion



//  ██████╗  █████╗ ███╗   ███╗███████╗    ███████╗████████╗ █████╗ ████████╗███████╗
// ██╔════╝ ██╔══██╗████╗ ████║██╔════╝    ██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██╔════╝
// ██║  ███╗███████║██╔████╔██║█████╗      ███████╗   ██║   ███████║   ██║   █████╗
// ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝      ╚════██║   ██║   ██╔══██║   ██║   ██╔══╝
// ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗    ███████║   ██║   ██║  ██║   ██║   ███████╗
//  ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝
//#region GameState
import { loadMap } from "./maps/map-loader.js";

const state = {
    map: {

    },
    players: {

    }
};

(async () => {
    console.log("[STATE] Map loading...");
    state.map = await loadMap("./maps/orthogonal-outside.json");
    console.log("[STATE] ...Map loaded");
    await updateUI();
})();

//#endregion



// ██████╗ ███████╗███╗   ██╗██████╗ ███████╗██████╗ ███████╗██████╗
// ██╔══██╗██╔════╝████╗  ██║██╔══██╗██╔════╝██╔══██╗██╔════╝██╔══██╗
// ██████╔╝█████╗  ██╔██╗ ██║██║  ██║█████╗  ██████╔╝█████╗  ██████╔╝
// ██╔══██╗██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗██╔══╝  ██╔══██╗
// ██║  ██║███████╗██║ ╚████║██████╔╝███████╗██║  ██║███████╗██║  ██║
// ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
//#region renderer

const uiMap = document.getElementById("map");

async function updateUI() {
    console.log("[UI] state: ", state);
    [...uiMap.children].forEach(c => c.remove());

    for(let l=0; l<state.map.layers.length; ++l) {
        let layer = state.map.layers[l];
        let layerDiv = document.createElement("div");
        layerDiv.classList.add("layer");
        uiMap.appendChild(layerDiv);

        let rowDiv = null;
        for(let i=0; i<layer.data.length; ++i) {
            if (i % layer.width === 0) {
                rowDiv = document.createElement("div");
                rowDiv.classList.add("row");
                layerDiv.appendChild(rowDiv);
            }

            let tileId = (layer.data[i] & 0x7FFFFFFF) - 1;
            let tileDiv = document.createElement("div");
            tileDiv.id = `layer_${l}_tile_${i}`;
            tileDiv.classList.add("tile");

            let offsetY = -(Math.floor(tileId / state.map.tilesPerRow)) * state.map.tileHeight;
            let offsetX = -(tileId % state.map.tilesPerRow) * state.map.tileWidth;

            tileDiv.style.background = `url(${state.map.imgPath}) no-repeat ${offsetX}px ${offsetY}px`;
            tileDiv.style.width = `${state.map.tileWidth}px`;
            tileDiv.style.height = `${state.map.tileHeight}px`;
            rowDiv.appendChild(tileDiv);
        }
    }
}

//#endregion
