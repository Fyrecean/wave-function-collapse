/**
 * Wave objects:
 * 1. System for knowing what options there are
 * 2. Entropy value (number of options available)
 * 3. Coordinates
 * 4. Methods for:
 *      1. Reducing entropy of neighbors
 * Tile Board
 * Heap for storing unresolved tiles, sorted by entropy
 * */

/**
 * Create the empty board
 * For each coordinate on the board, create a Wave with max entropy and add it to the heap
 * Setup: Collapse 1 tile, update neighbors
 * Loop: extract top of heap, collapse it, update neighbors
 */

class Wave {
    private _options: number[];

    removeOptions(invalidOptions: number) {
        
    }
}

class Board {
    private _tiles: (number | null)[][];

    constructor(width: number, height: number) {
        this._tiles = [];
        for (let y = 0; y < height; y++) {
            this._tiles.push(Array<null>(width));
        } 
        // Create Heap
    }

    getTile(x,y) {
        return this._tiles[y][x];
    }

    collapseNextTile() {
        // Extract Wave from heap
        // Collapse it
        // Save to tiles
        // Update neighboring Waves
    }
}

class MinHeap<T> {
    private _contents: T[];
    private _mapping: Map<T,number>;
    private _keyComparator: (a: T, b: T) => number;

    // Assumes contents is a valid heap
    constructor(contents: T[], keyComparator: (a: T, b: T) => number) {
        this._contents = contents;
        this._mapping = new Map();
        this._keyComparator = keyComparator;
        this._contents.forEach((item, index) => this._mapping.set(item, index));
    }

    // Two types of lookups:
    // 1. Extract min-entropy (removes it from heap)
    // 2. Get by coordinate or get by the contents of 
    extractMin() {
        
    }

    updateKey(item: T) {
        // Lookup an item,  
    }

    private heapify() {
        //
    }
}
