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

export interface GameStateDTO {
    board: string[][][];
    currentPlayer: string;
    winner: string;
    isFinished: boolean;
}

export interface CreateGameSuccess {
    success: true;
    gameId: string;
    player: string;
    state: GameStateDTO;
}

export interface Failure {
    success: false;
    error: string;
}

export type CreateGameResponse = CreateGameSuccess | Failure;

export interface JoinGameSuccess {
    success: true;
    player: string;
    state: GameStateDTO;
}

export type JoinGameResponse = JoinGameSuccess | Failure;

export interface MoveSuccess {
    success: true;
    winner: string;
    isFinished: boolean;
    state: GameStateDTO;
}

export type MoveResponse = MoveSuccess | Failure;

export interface LeaveGameSuccess {
    success: true;
    remaining: { id: string; symbol: string }[];
    state: GameStateDTO;
}

export type LeaveGameResponse = LeaveGameSuccess | Failure;
