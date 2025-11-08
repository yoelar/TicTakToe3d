// backend/src/components/board/Board3D.ts
import { IBoard } from './IBoard';

export class Board3D implements IBoard<'X' | 'O' | ''> {
    private readonly size = 3;
    private cells: ('' | 'X' | 'O')[][][];

    constructor() {
        this.cells = Array.from({ length: this.size }, () =>
            Array.from({ length: this.size }, () => Array(this.size).fill(''))
        );
    }

    getSize(): number {
        return this.size;
    }

    isValid(x: number, y: number, z: number): boolean {
        return [x, y, z].every(n => Number.isInteger(n) && n >= 0 && n < this.size);
    }

    get(x: number, y: number, z: number): '' | 'X' | 'O' {
        if (!this.isValid(x, y, z))
            throw new RangeError(`Invalid coordinates: (${x}, ${y}, ${z})`);
        return this.cells[z][y][x];
    }

    set(x: number, y: number, z: number, value: 'X' | 'O' | ''): void {
        if (!this.isValid(x, y, z))
            throw new RangeError(`Invalid coordinates: (${x}, ${y}, ${z})`);
        this.cells[z][y][x] = value;
    }

    isEmpty(x: number, y: number, z: number): boolean {
        return this.get(x, y, z) === '';
    }

    toJSON(): ('' | 'X' | 'O')[][][] {
        return this.cells.map(layer => layer.map(row => [...row]));
    }

    clear(): void {
        for (let z = 0; z < this.size; z++) {
            for (let y = 0; y < this.size; y++) {
                for (let x = 0; x < this.size; x++) {
                    this.cells[z][y][x] = '';
                }
            }
        }
    }

    reset(): void {
        this.clear();
    }
}
