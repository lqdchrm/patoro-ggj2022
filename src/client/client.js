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


function add_player_to_player_list(player)
{
    var id = player.id
    var item = document.createElement('li');
    item.classList.add("move_done");
    item.textContent = id;
    item.id = id;

    var moves_info = document.createElement('span');
    moves_info.classList.add("pull_right");
    moves_info.textContent = 0 +" moves left";

    item.appendChild(moves_info);
    uiPlayerList.appendChild(item);

    update_moves_ui(player)
}

function remove_player_from_player_list(player)
{
    var id = player.id
    var player_list_entry = document.getElementById(id);
    uiPlayerList.removeChild(player_list_entry);
}

function update_moves_ui(player)
{
    var id = player.id;
    var player_list_entry = document.getElementById(id);
    var moves_info = player_list_entry.lastChild;
    let moves_left = player.commands.length - viewModel.state.round - 1;
    moves_info.textContent = moves_left + " moves left";

}

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
        this.mapLoading = loadMap("killzone", "./maps/killzone");
        this.map = await this.mapLoading;
        await updateMap();
    }

    move(direction /*up, down, left, right, skip*/) {
        socket.emit('command', direction);
    }

    update(serverState) {
        // add new players
        let addedPlayers = Object.keys(serverState.players).filter(id => !this.state.players[id]).sort();
        addedPlayers.forEach(id => {
            let spawnPoint =  {x: 3, y: 3};
            this.players[id] = {
                id,
                sprite: createSprite('robot', spawnPoint.x, spawnPoint.y, id),
            }
            let player = serverState.players[id];
            let moves = player.commands.slice(0, this.state.round);
            moves.forEach(move => {
                moveSprite(this.players[id].sprite, move);
            })
            add_player_to_player_list(player);
        });

        // remove old players
        let removedPlayers = Object.keys(this.state.players).filter(id => !serverState.players[id]).sort();
        removedPlayers.forEach(id => {
            var player = this.players[id];
            if (player) {
                remove_player_from_player_list(player);
                const localPlayer = player;
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
            update_moves_ui(player);
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

var uiMessages   = document.getElementById('messages');
var uiUserId     = document.getElementById('userId');
var uiRound      = document.getElementById('round');
var uiPlayerList = document.getElementById('player_list');

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
        switch (key) {
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
    const actorLayerPosition = map.properties?.actorlayer?.value ?? map.layers.length;

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
        let layer = map.layers[l];
        let layerDiv = document.createElement("div");
        layerDiv.classList.add("layer");
        if (map.layers[l].visible == false) {
            layerDiv.classList.add("debug");
        }
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


// TODO: Delete, Its debug...
window.setTerainBlock = setTerainBlock
window.makeHole = makeHole


/**
 * Make a holw in the floor
 * @param {number} x
 * @param {number} y
 * @returns returns if the map has now a hole in that direction
 */
function makeHole(x, y) {
    if (getDataLayerInfo(x, y) == "hole") {
        return true;
    }
    // The hole has index 1 in data layer
    const holeIndex = 0
    const dataTileset = viewModel.map.tilesets.filter(x => x.name == "tileset_data")[0];
    const dataTilesetIndex = viewModel.map.tilesets.indexOf(dataTileset);

    setMapImage(x, y, viewModel.map.layers.length - 1, dataTilesetIndex, holeIndex);

    const baseLayer = viewModel.map.layers.filter(x => x.name == "base")[0];
    const baseLayerIndex = viewModel.map.layers.indexOf(baseLayer);


    const holeTileset = viewModel.map.tilesets.filter(x => x.name == "tileset")[0];
    const holeTilesetIndex = viewModel.map.tilesets.indexOf(holeTileset);

    const holeImageTileIndex = 12;
    setMapImage(x, y, baseLayerIndex, holeTilesetIndex, holeImageTileIndex);


    //  visual layer hole = tileId: 12 tileset name :'tileset'

    // use terains?




    return true;

}




/**
 *
 * @param {number} x the left upper corner of the terain
 * @param {number} y the left upper corner of the terain
 * @param {number} width the width to set (minimum 2)
 * @param {*} height the height to set (minimum 2)
 * @param {'floor'|'hole1'|'hole2'|'hole3'|'raised'} terain
 */
function setTerainBlock(x, y, width, height, terain) {

    if (width < 2 | height < 2) { // with corner only support we can't set a single tile
        return false;
    }
    const tileset = viewModel.map.tilesets.filter(x => x.name == "tileset")[0];
    const tilesetIndex = viewModel.map.tilesets.indexOf(tileset);
    const terrain = tileset.terrains[0];
    if (!terain) {
        return false;
    }



    const terainNamesToTerainIndex = terrain.colors.reduce((obj, v, i) => {
        obj[v.name] = i + 1/* one based index*/;
        return obj;
    }, {});
    const terainIndex = terainNamesToTerainIndex[terain];
    const baseLayer = viewModel.map.layers.filter(x => x.name == "base")[0];
    const baseLayerIndex = viewModel.map.layers.indexOf(baseLayer);




    // use terrains to handle neigborung tiles

    const directionIndex = {
        left: 6,
        right: 2,
        bottom: 4,
        top: 0,
        topleft: 7,
        topright: 1,
        bottomleft: 5,
        bottomright: 3
    }
    if (terrain.type != 'corner') {
        console.error('Currently only corner terrains are implemented');
    }

    function getWangId(x, y) {
        const tuple = baseLayer.data[x + y * baseLayer.width];
        if (!tuple) {
            return undefined;
        }
        const [tilesetIndex, tileIndex] = tuple;
        const wangTile = viewModel.map.tilesets[tilesetIndex].terrains[0]?.wangtiles.filter(x => x.tileid == tileIndex)[0];
        return wangTile?.wangid;
    }

    function arrayEquals(a, b) {
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((val, index) => val === b[index]);
    }

    const targetTileIds = [];

    for (let yPos = 0; yPos < height; yPos++) {
        for (let xPos = 0; xPos < width; xPos++) {

            const searchedWangId = [0, terainIndex, 0, terainIndex, 0, terainIndex, 0, terainIndex]

            if (xPos == 0 && x > 0) {
                const wang = getWangId(x + xPos - 1, y + yPos);
                if (wang) {
                    searchedWangId[directionIndex.topleft] = wang[directionIndex.topright];
                    searchedWangId[directionIndex.bottomleft] = wang[directionIndex.bottomright];
                }
            }
            else if (xPos == width - 1 && x < baseLayer.width) {
                const wang = getWangId(x + xPos + 1, y + yPos);
                if (wang) {
                    searchedWangId[directionIndex.topright] = wang[directionIndex.topleft];
                    searchedWangId[directionIndex.bottomright] = wang[directionIndex.bottomleft];
                }
            }

            if (yPos == 0 && y > 0) {
                const wang = getWangId(x + xPos, y + yPos - 1);
                if (wang) {
                    searchedWangId[directionIndex.topleft] = wang[directionIndex.bottomleft];
                    searchedWangId[directionIndex.topright] = wang[directionIndex.bottomright];
                }
            }
            else if (yPos == height - 1 && y < baseLayer.height) {
                const wang = getWangId(x + xPos, y + yPos + 1);
                if (wang) {
                    searchedWangId[directionIndex.bottomleft] = wang[directionIndex.topleft];
                    searchedWangId[directionIndex.bottomright] = wang[directionIndex.topright];
                }
            }


            const foundWang = terrain.wangtiles.filter(x => arrayEquals(x.wangid, searchedWangId))[0];
            if (!foundWang) {
                console.log(`Faild to find wang tile at (${x + xPos},${y + yPos})`, Object.keys(terainNamesToTerainIndex).map(k => ({ name: k, value: terainNamesToTerainIndex[k] })).filter(x => searchedWangId.includes(x.value)).map(x => x.name))
                return false;
            }

            targetTileIds.push(foundWang.tileid);
        }
    }


    // we did not exit so everything should match.

    for (let i = 0; i < targetTileIds.length; i++) {
        const target = targetTileIds[i];
        const destinationX = i % width + x;
        const destinationY = Math.floor(i / width) + y;
        setMapImage(destinationX, destinationY, baseLayerIndex, tilesetIndex, target);
    }

    return true;


}


function setMapImage(x, y, layerIndex, tilesetIndex, tilesetTileIndex) {
    const layer = viewModel.map.layers[layerIndex];
    const layerWidth = layer.width;
    const layerTileIndex = x + y * layerWidth;
    const tileset = viewModel.map.tilesets[tilesetIndex];



    // change render
    const tileId = `layer_${layerIndex}_tile_${layerTileIndex}`;
    const tileDiv = document.getElementById(tileId);
    if (tileDiv) { // invisible layers will not be loaded
        tileDiv.style.setProperty('--tileset-x', tilesetTileIndex % tileset.tilesPerRow);
        tileDiv.style.setProperty('--tileset-y', Math.floor(tilesetTileIndex / tileset.tilesPerRow));
        tileDiv.style.backgroundImage = `url(${tileset.imgPath})`;
    }

    // TODO: should it be changed? Or will this mess with incremental changes
    //       I use the infos in the map, so it should reflect the correct state
    // change model
    viewModel.map.layers[layerIndex].data[layerTileIndex] = [tilesetIndex, tilesetTileIndex];

}


/**
 *
 * @param {number} x
 * @param {number} y
 * @returns A value coresponding tho the datalyer
 */
function getDataLayerInfo(x, y) {
    const dataLayer = viewModel.map.layers[viewModel.map.layers.length - 1];
    const array = dataLayer.data;
    const layerWidth = dataLayer.width;
    const index = x + y * layerWidth;
    const currentTile = array[index];
    if (!currentTile) { // 0 is not set tile
        return 'floor';
    }
    const [tilesetIndex, tileIndex] = currentTile;
    // should only be one tileset in this layer but we check it...
    if (viewModel.map.tilesets[tilesetIndex].name !== 'data') {
        console.error('Is this the correct dataset', viewModel.map.tilesets[tilesetIndex].name);
    }

    switch (tileIndex) {
        case 0:
            return 'hole';
        case 1:
            return 'move-right';

        default:
            console.error('Tileindex undefined', tileIndex);
            return 'floor';
    }


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

    switch (direction) {
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
