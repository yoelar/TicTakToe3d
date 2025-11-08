// backend/src/components/board/IBoard.ts
export interface IBoard<T extends string> {
    get(x: number, y: number, z: number): T;
    set(x: number, y: number, z: number, value: T): void;
    isEmpty(x: number, y: number, z: number): boolean;
    toJSON(): T[][][];
    clear(): void;
    getSize(): number;
}
