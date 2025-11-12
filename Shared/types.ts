// shared/types.ts (used by both frontend and backend)

// ========== Core Game Types ==========
export type Symbol = 'X' | 'O' | '';

export interface TicTacToePlayer {
    id: string;
    symbol: 'X' | 'O';
}

export interface GameState<TBoard = any> {
    id: string;
    createdAt?: Date;
    players?: TicTacToePlayer[];
    board: TBoard;
    isFinished?: boolean;
    winner?: Symbol;
    currentPlayer?: 'X' | 'O'; // Added for frontend compatibility
}

// ========== WebSocket Message Types ==========
export type WSMessageType =
    | 'MAKE_MOVE'
    | 'MOVE_MADE'
    | 'PLAYER_JOINED'
    | 'PLAYER_LEFT'
    | 'GAME_OVER'
    | 'ERROR';

export interface WSMessage {
    type: WSMessageType;
    payload: any;
}

export interface MoveMadePayload {
    x: number;
    y: number;
    z: number;
    player: 'X' | 'O';
    state: GameState;
}

export interface PlayerJoinedPayload {
    clientId: string;
    player: 'X' | 'O';
}

// ========== API Response Types ==========
export type MoveResult =
    | {
        success: true;
        winner: Symbol;
        isFinished: boolean;
        state: GameState;
        error?: string;
    }
    | {
        success: false;
        error: string;
    };