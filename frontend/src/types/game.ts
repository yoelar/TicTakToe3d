export type Symbol = 'X' | 'O' | '';

export interface PlayerInfo {
    id: string;
    symbol: 'X' | 'O';
}

export interface GameState {
    id: string;
    board: string[][][]; // board[z][y][x]
    players: PlayerInfo[];
    isFinished: boolean;
    winner: Symbol | 'Draw';
}
