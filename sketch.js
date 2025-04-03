/// <reference path="node_modules/@types/p5/index.d.ts"/>
/// <reference path="node_modules/@types/p5/global.d.ts"/>
/// <reference path="node_modules/@types/p5/constants.d.ts"/>



const TILE_SIZE = 100;
const NUMBER_OF_TILES = 10;

let images = [];

//    [0]
// [3] [X] [1]
//     [2]
//
const banned_tile_mapping = [
    [[2,3,4],[1,3,4],[1,2,4],[1,2,3]], // 0
    [[0,1],[0,2],[1,2,4],[0,4]],
    [[0,1],[0,2],[0,3],[1,2,3]],
    [[2,3,4],[0,2],[0,3],[0,4]],
    [[0,1],[1,3,4],[0,3],[0,4]],
];

let uncollapsed_tiles = [];
let collapsed_tiles = [];

function preload() {
    images.push(loadImage("assets/0-empty.png"));
    images.push(loadImage("assets/1-bottom.png"));
    images.push(loadImage("assets/2-left.png"));
    images.push(loadImage("assets/3-top.png"));
    images.push(loadImage("assets/4-right.png"));
}

function setup() {
    createCanvas(TILE_SIZE * NUMBER_OF_TILES, TILE_SIZE * NUMBER_OF_TILES);

    for (let i = 0; i < NUMBER_OF_TILES; i++) {
        let tempOptions = [];
        for (let j = 0; j < NUMBER_OF_TILES; j++) {
            tempOptions.push([0,1,2,3,4]);
        }
        uncollapsed_tiles.push(tempOptions);
        collapsed_tiles.push(Array(NUMBER_OF_TILES).fill(-1));
    }
    
    let target_x = int(random(0,NUMBER_OF_TILES));
    let target_y = int(random(0,NUMBER_OF_TILES));

    collapseTile(target_x, target_y);
}

function collapseTile(x, y) {
    const entropy = uncollapsed_tiles[y][x].length;
    const chosen_tile = uncollapsed_tiles[y][x][int(random(0,entropy))];
    if (entropy == 0) {
        collapsed_tiles[y][x] = -1;
        return;
    }
    collapsed_tiles[y][x] = chosen_tile;
    if (y > 0) {
        reduceEntropy(x, y-1, banned_tile_mapping[chosen_tile][0]);
    }
    if (x > 0) {
        reduceEntropy(x-1, y, banned_tile_mapping[chosen_tile][3]);
    }
    if (y < NUMBER_OF_TILES - 1) {
        reduceEntropy(x, y+1, banned_tile_mapping[chosen_tile][2]);
    }
    if (x < NUMBER_OF_TILES - 1) {
        reduceEntropy(x+1, y, banned_tile_mapping[chosen_tile][1]);
    }
}

function reduceEntropy(x,y,options_to_clear) {
    if (uncollapsed_tiles[y][x].length === 0) {
        return;
    }
    uncollapsed_tiles[y][x] = uncollapsed_tiles[y][x].filter(option => {
        return !options_to_clear.includes(option);
    });
}

function draw() {
    background(200);

    let lowest_entropy = Infinity;
    let lowest_entropy_tiles = [];
    for (let y = 0; y < NUMBER_OF_TILES; y++) {
        for (let x = 0; x < NUMBER_OF_TILES; x++) {
            if (collapsed_tiles[y][x] !== -1) {
                image(images[collapsed_tiles[y][x]], x * TILE_SIZE, y * TILE_SIZE);
            } else {
                const entropy = uncollapsed_tiles[y][x].length;
                if (entropy > 0 && entropy < lowest_entropy) {
                    lowest_entropy = entropy;
                    lowest_entropy_tiles = [[x,y]];
                } else if (entropy === lowest_entropy) {
                    lowest_entropy_tiles.push([x,y]);
                }
            }
        }
    }

    if (lowest_entropy === Infinity)
    {
        return;
    }

    let [target_x, target_y] = lowest_entropy_tiles[int(random(0,lowest_entropy_tiles.length))];
    collapseTile(target_x, target_y);
}