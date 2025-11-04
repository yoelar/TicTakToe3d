import { Player } from './Player';

export class TicTacToePlayer extends Player {
    public readonly sign: 'X' | 'O';

    constructor(id: string, sign: 'X' | 'O') {
        super(id);
        if (sign !== 'X' && sign !== 'O') {
            throw new Error(`Invalid sign: ${sign}`);
        }
        this.sign = sign;
    }

    /** Determines if this player can play given the current turn sign */
    canPlay(currentTurn: 'X' | 'O'): boolean {
        return this.sign === currentTurn;
    }
}
