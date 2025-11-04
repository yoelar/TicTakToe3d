import { Player } from './Player';

export interface MoveResult {
    success: boolean;
    error?: string;
}

export abstract class Game {
    public id: string;
    public winner?: string | null;

    constructor(id: string) {
        this.id = id;
    }

    abstract addPlayer(player: Player): void;
    abstract makeMove(player: Player, x: number, y: number, z: number): MoveResult;
    abstract isSoloMode(): boolean;
}
