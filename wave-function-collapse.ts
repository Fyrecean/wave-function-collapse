/// <reference path="node_modules/@types/p5/index.d.ts"/>
/// <reference path="node_modules/@types/p5/global.d.ts"/>
/// <reference path="node_modules/@types/p5/constants.d.ts"/>
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

const banned_tile_mapping = [
    [[2,3,4],[1,3,4],[1,2,4],[1,2,3]], // 0
    [[0,1],[0,2],[1,2,4],[0,4]],
    [[0,1],[0,2],[0,3],[1,2,3]],
    [[2,3,4],[0,2],[0,3],[0,4]],
    [[0,1],[1,3,4],[0,3],[0,4]],
];

const coordsToString = (coords: ICoordinates) => {
    return coords.x + "," + coords.y; 
}

class Wave implements IHeapItem<number[]> {
    
    get key(): number {
        return this._options.length;
    }
    
    get identifier(): string {
        return coordsToString(this.coordinates);
    }

    updateKey = this.removeOptions;
    
    coordinates: ICoordinates;
    private _options: number[];

    constructor(coordinates: ICoordinates) {
        this._options = [0,1,2,3,4];
        this.coordinates = coordinates;
    }

    collapse(): number {
        return random(this._options);
    }

    removeOptions(invalidOptions: number[]) {
        this._options = this._options.filter(option => !invalidOptions.includes(option));
    }
}

interface ICoordinates {
    x: number;
    y: number;
}

class Board {
    private _tiles: (number | null)[][];
    private _heapOfWaves: MinHeap<number[]>;

    constructor(width: number, height: number) {
        this._tiles = [];
        let waves: Wave[] = [];
        for (let y = 0; y < height; y++) {
            this._tiles.push(Array<null>(width));
            for (let x = 0; x < width; x++) {
                waves.push(new Wave({x, y}));
            }
        } 
        this._heapOfWaves = new MinHeap(waves);
        
    }

    isDone() {
        return this._heapOfWaves.length == 0;
    }

    getTile(x,y) {
        return this._tiles[y][x];
    }

    collapseNextTile() {
        let wave = this._heapOfWaves.extractMin() as Wave;
        let {x, y} = wave.coordinates;
        let new_tile = wave.collapse();
        this._tiles[y][x] = new_tile;

        this._heapOfWaves.updateKey(coordsToString({x: x, y: y-1}), banned_tile_mapping[new_tile][0]);
        this._heapOfWaves.updateKey(coordsToString({x: x, y: y+1}), banned_tile_mapping[new_tile][2]);

        this._heapOfWaves.updateKey(coordsToString({x: x-1, y: y}), banned_tile_mapping[new_tile][3]);
        this._heapOfWaves.updateKey(coordsToString({x: x+1, y: y}), banned_tile_mapping[new_tile][1]);
    }
}

interface IHeapItem<T> {
    readonly key: number;
    readonly identifier: string;
    updateKey: (args: T) => void;
}

class MinHeap<T> {
    private heap: IHeapItem<T>[] = [];
    private itemIndexMap: Map<string, number> = new Map();
    private _length: number;

    get length(): number {
        return this._length;
    }

    constructor(items: IHeapItem<T>[]) {
        this.heap = items;
        this.heap.forEach((item, index) => this.itemIndexMap.set(item.identifier, index));
        this._length = this.heap.length;
    }

    public insert(item: IHeapItem<T>): void {
        this.heap.push(item);
        this._length++;
        const index = this.heap.length - 1;
        this.itemIndexMap.set(item.identifier, index);
        this.bubbleUp(index);
    }

    public extractMin(): IHeapItem<T> | null {
        if (this.heap.length === 0) return null;

        const minItem = this.heap[0];
        const lastItem = this.heap.pop() as IHeapItem<T>;
        this._length--;
        if (this.heap.length > 0) {
            this.heap[0] = lastItem;
            this.itemIndexMap.set(lastItem.identifier, 0);
            this.bubbleDown(0);
        }

        this.itemIndexMap.delete(minItem.identifier);
        return minItem;
    }

    public getItem(identifier: string): IHeapItem<T> | null {
        const index = this.itemIndexMap.get(identifier);
        if (index === undefined) return null;
        return this.heap[index];
    }

    public updateKey(identifier: string, args: T): void {
        const index = this.itemIndexMap.get(identifier);
        if (index === undefined) return;

        const item = this.heap[index];
        const oldKey = item.key;
        item.updateKey(args);
        const newKey = item.key;

        if (newKey < oldKey) {
            this.bubbleUp(index);
        } else {
            this.bubbleDown(index);
        }
    }

    private bubbleUp(index: number): void {
        let currentIndex = index;
        while (currentIndex > 0) {
            const parentIndex = Math.floor((currentIndex - 1) / 2);
            if (this.heap[currentIndex].key < this.heap[parentIndex].key) {
                this.swap(currentIndex, parentIndex);
                currentIndex = parentIndex;
            } else {
                break;
            }
        }
    }

    private bubbleDown(index: number): void {
        let currentIndex = index;
        const lastIndex = this.heap.length - 1;

        while (currentIndex < lastIndex) {
            const leftChildIndex = 2 * currentIndex + 1;
            const rightChildIndex = 2 * currentIndex + 2;
            let minChildIndex = leftChildIndex;

            if (rightChildIndex <= lastIndex && this.heap[rightChildIndex].key < this.heap[leftChildIndex].key) {
                minChildIndex = rightChildIndex;
            }

            if (minChildIndex > lastIndex) break;

            if (this.heap[currentIndex].key > this.heap[minChildIndex].key) {
                this.swap(currentIndex, minChildIndex);
                currentIndex = minChildIndex;
            } else {
                break;
            }
        }
    }

    private swap(index1: number, index2: number): void {
        const temp = this.heap[index1];
        this.heap[index1] = this.heap[index2];
        this.heap[index2] = temp;
        this.itemIndexMap.set(this.heap[index1].identifier, index1);
        this.itemIndexMap.set(this.heap[index2].identifier, index2);
    }
}


// class MinHeap<IHeapItem> {
//     private _contents: IHeapItem[];
//     private _mapping: Map<IHeapItem,number>;
//     private _keyComparator: (a: IHeapItem, b: IHeapItem) => number;

//     // Assumes contents is a valid heap
//     constructor(contents: IHeapItem[], keyComparator: (a: IHeapItem, b: IHeapItem) => number) {
//         this._contents = contents;
//         this._mapping = new Map();
//         this._keyComparator = keyComparator;
//         this._contents.forEach((item, index) => this._mapping.set(item, index));
//     }

//     // Two types of lookups:
//     // 1. Extract min-entropy (removes it from heap)
//     // 2. Get by coordinate or get by the contents of 
//     extractMin() {
        
//     }

//     updateKey(item: IHeapItem) {
//         // Lookup an item,
//     }
// }


// interface IFoo<T, U> {
//     foo: number;
//     onUpdate: (args: U) => void;
// }


// class Baz implements IFoo<number, string> {
//     foo: number;
//     onUpdate = this.buzz;
    
//     buzz(args: string) {
//         this.foo = int(args);
//     }
// }

// class Bar<T, U> {
//     content: IFoo<T, U>;

//     constructor(content: IFoo<T, U>) {
//         this.content = content
//     }
// }

// const newBar = new Bar(new Baz());
