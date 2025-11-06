import { Player } from './Player';

export class TicTacToePlayer extends Player {
    public readonly symbol: 'X' | 'O';

    constructor(id: string, symbol: 'X' | 'O') {
        super(id);
        if (symbol !== 'X' && symbol !== 'O') {
            throw new Error(`Invalid symbol: ${symbol}`);
        }
        this.symbol = symbol;
    }

    /** Determines if this player can play given the current turn symbol */
    canPlay(currentTurn: 'X' | 'O'): boolean {
        return this.symbol === currentTurn;
    }
}
