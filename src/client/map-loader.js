export async function loadMap(mapname, folder) {

    async function loadTileset(input) {

        let tileset;

        if (input.image) {
            tileset = input;
        } else if (input.source) {
            const response = await fetch(`${folder}/${input.source}`);
            const data = await response.json();
            tileset = data;
        }


        const imgFile = tileset.image.split("\/").pop();
        const imgPath = `${folder}/${imgFile}`;


        return {
            imgPath,
            imageWidth: tileset.imagewidth,
            imageHeight: tileset.imageheight,
            tilesPerRow: Math.floor(tileset.imagewidth / tileset.tilewidth),
            tileWidth: tileset.tilewidth,
            tileHeight: tileset.tileheight,
            tiles: tileset.tiles?.reduce((obj, v) => { obj[v.id] = v; return obj }, {}) ?? {}
        }

    }


    let response = await fetch(`${folder}/${mapname}.json`);
    let data = await response.json();

    let tilesets = await Promise.all(data.tilesets.map(loadTileset));

    function updateIndex(layer) {
        const result = { ...layer }

        result.data = layer.data.map(i => {
            if (i == 0)
                return undefined;
            const tileIndex = data.tilesets.map(set => set.firstgid <= (i & 0x7FFFFFFF)).lastIndexOf(true);

            const indexInTileset = (i & 0x7FFFFFFF) - data.tilesets[tileIndex].firstgid;
            return [tileIndex, indexInTileset];
        })

        return result;
    }

    return {
        tileWidth: data.tilewidth,
        tileHeight: data.tileheight,
        tilesets,
        height: data.height,
        width: data.width,
        layers: data.layers.map(updateIndex),
        properties: data?.properties.reduce((obj, v) => {
            obj[v.name] = v.value;
            return obj
        }, {})
    };
}


export default loadMap;
