async function loadTileset(folder, input) {

    let tileset;

    if (input.image) {
        tileset = input;
    } else if (input.source) {
        const response = await fetch(`${folder}/${input.source}`);
        const data = await response.json();
        tileset = data;
    }

    const imgFile = tileset.image.split(/\//).pop();
    const imgPath = `${folder}/${imgFile}`;

    let terrains = []
    if (tileset.wangsets) {

        terrains = [...tileset.wangsets];
        terrains.map((t, i) => {
            const modifiedColors = t.colors.map(x => ({ ...x, properties: arrayToObjectByProp(x.properties) }));
            const changedTerrain = { ...t, id: i + 1, index: i, colorsByName: arrayToObjectByProp(modifiedColors) };
            changedTerrain.colors = modifiedColors;
            return changedTerrain;
        })
    }
    return {
        imgPath,
        name: tileset.name,
        imageWidth: tileset.imagewidth,
        imageHeight: tileset.imageheight,
        tilesPerRow: Math.floor(tileset.imagewidth / tileset.tilewidth),
        tileWidth: tileset.tilewidth,
        tileHeight: tileset.tileheight,
        tiles: tileset.tiles?.reduce((obj, v) => { obj[v.id] = v; return obj }, {}) ?? {},
        terrains,
    }

}

function updateIndex(data, layer) {
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

function arrayToObjectByProp(array, prop = "name") {
    return array?.reduce((acc, value) => {
        acc[value[prop]] = value;
        return acc;
    }, {}) ?? {};
}

export async function loadMap(mapname, folder) {

    let response = await fetch(`${folder}/${mapname}.json`);
    let data = await response.json();

    let tilesets = await Promise.all(
        data.tilesets.map(
            (input) => loadTileset(folder, input)
        )
    );
    let tilesetsByName = arrayToObjectByProp(tilesets);

    let layers = data.layers.map(layer => updateIndex(data, layer));
    let layersByName = arrayToObjectByProp(layers);
    let properties = arrayToObjectByProp(data?.properties);

    let spawnPoints = [];

    return {
        height: data.height,
        width: data.width,
        tileWidth: data.tilewidth,
        tileHeight: data.tileheight,

        tilesets,
        tilesetsByName,

        layers,
        layersByName,

        properties,

        spawnPoints,
    };
}


export default loadMap;
