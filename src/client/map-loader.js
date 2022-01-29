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
        terrains = terrains.map((t, i) => ({ ...t, id: i + 1, index: i, colorsByName: arrayToObjectByProp(t.colors) }))
    }
    return replaceProperty({
        imgPath,
        name: tileset.name,
        imageWidth: tileset.imagewidth,
        imageHeight: tileset.imageheight,
        tilesPerRow: Math.floor(tileset.imagewidth / tileset.tilewidth),
        tileWidth: tileset.tilewidth,
        tileHeight: tileset.tileheight,
        tiles: tileset.tiles?.reduce((obj, v) => { obj[v.id] = v; return obj }, {}) ?? {},
        terrains,
    })

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

function replaceProperty(obj) {
    if (obj == undefined) {
        return obj;
    } else if (Array.isArray(obj)) {

        return obj.map(x => replaceProperty(x));
    } else if (typeof obj != "object") {
        return obj;
    }
    const newObj = { ...obj };
    if (typeof obj.properties == 'object') {
        newObj.properties = arrayToObjectByProp(obj.properties);
    }

    for (const key in newObj) {
        if (Object.hasOwnProperty.call(newObj, key)) {
            const element = newObj[key];
            newObj[key] = replaceProperty(element);
        }
    }
    return newObj;

}

export async function loadMap(mapname, folder) {

    let response = await fetch(`${folder}/${mapname}.json`);
    let data = await response.json();

    /**@type{Tileset[]} */
    let tilesets = await Promise.all(
        data.tilesets.map(
            (input) => loadTileset(folder, input)
        )
    );
    /**@type{Record<TilesetNames,Tileset>} */
    let tilesetsByName = arrayToObjectByProp(tilesets);

    /**@type {Layer} */
    let layers = replaceProperty( data.layers.map(layer => updateIndex(data, layer)));
    /**@type {Record<LayerNames, Layer>} */
    let layersByName = arrayToObjectByProp(layers);

    /**@type {Record<string, Property>} */
    let properties = arrayToObjectByProp(data?.properties);


    const spawnTiles = Object.values(tilesetsByName['tileset_data'].tiles).filter(x => x.properties['type']?.value == "spawn");

    const spawnPoints = spawnTiles.flatMap(tile => {
        const dataLayer = layersByName['data'];
        const spawnIdices = dataLayer.data.map((tileMapping, i) => ({ isSpawnPoint: tileMapping ? tileMapping[1] == tile.id : false, index: i }))
            .filter(x => x.isSpawnPoint)
            .map(x => x.index);

        return spawnIdices.map(s => ({ x: s % dataLayer.width, y: Math.floor(s / dataLayer.width) }));

    })

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
