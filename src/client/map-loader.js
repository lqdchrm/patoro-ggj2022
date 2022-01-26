export async function loadMap(src) {
    let response = await fetch(src);
    let data = await response.json();

    let tileset = data.tilesets[0];
    let imgFile = tileset.image.split("\/").pop();
    let imgPath = `./maps/${imgFile}`;

    return {
        imgPath,
        tileWidth: tileset.tilewidth,
        tileHeight: tileset.tileheight,
        imageWidth: tileset.imagewidth,
        imageHeight: tileset.imageheight,
        tilesPerRow: Math.floor(tileset.imagewidth / tileset.tilewidth),
        layers: data.layers
    };
}

export default loadMap;
