type Datatypes = 'none'
    | 'spawn'
    | 'fall' | 'fall-left' | 'fall-right' | 'fall-bottom' | 'fall-top' | 'fall-bottom-left' | 'fall-top-left' | 'fall-bottom-right' | 'fall-top-right'
    | 'move-right';

type TilesetNames = 'tileset' | 'tileset_data' | 'tileset_top';
type LayerNames = 'data' | 'deco' | 'base';


type Layer = {
    data: [number, number][],
    height: number,
    id: number,
    name: LayerNames
    opacity: number,
    type: "tilelayer",
    visible: boolean,
    width: number,
    x: number,
    y: number
}

type Tileset = {
    imgPath: string;
    name: string;
    imageWidth: number;
    imageHeight: number;
    tilesPerRow: number;
    tileWidth: number;
    tileHeight: number;
    tiles: Record<number, Tile | undefined>;
    terrains: Terrain[];
}

type Terrain = {
    colors: {
        color: string,
        name: string,
        probability: number,
        tiles: number,
        properties: Record<string, Property | undefined>
    },
    name: string,
    tile: number,
    type: "corner" | "edge" | "mixed",
    wangtiles: {
        tileid: number,
        wangid: [number, number, number, number, number, number, number, number]
    }[]
}

type Tile = {
    id: number,
    properties: Record<string, Property | undefined>,
    probability: number | undefined
}

type Property = {
    name: string,
    type: string,
    value: any
}

type TileMap = {
    height: number
    width: number
    tileWidth: number
    tileHeight: number
    tilesets: Tileset[]
    tilesetsByName: Record<TilesetNames, Tileset>
    layers: Layer
    layersByName: Record<LayerNames, Layer>
    properties: Record<string, Property>,
    spawnPoints: {
        x: number,
        y: number,
    }[]
}

type SpriteTypes = 'man' | 'robot' | 'cursor' | 'cursor-dig'| 'cursor-fill'| 'cursor-error';