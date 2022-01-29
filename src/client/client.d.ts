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
    tiles: Record<number, Tile>;
    terrains: any[];
}

type Tile = {
    id: number,
    properties: Record<string, Property>
}

type Property = {
    name: string,
    type: string,
    value: any
}