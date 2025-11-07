// backend/src/components/types.ts

export type Symbol = 'X' | 'O' | '';

export interface TicTacToePlayer {
    id: string;
    symbol: 'X' | 'O';
}

export interface GameState<TBoard = any> {
    id: string;
    createdAt: Date;
    players: TicTacToePlayer[];
    board: TBoard;
    isFinished: boolean;
    winner: Symbol;
}

/**
 * Result of a makeMove operation.
 *
 * - success = true → valid move, includes updated state
 * - success = false → invalid move, includes error message
 *
 * `error` is optional for convenience, so tests can always access it
 * without narrowing `result.success` explicitly.
 */
export type MoveResult =
    | {
        success: true;
        winner: Symbol;
        isFinished: boolean;
        state: GameState;
        error?: string; // ✅ optional, for easier test access
    }
    | {
        success: false;
        error: string;
    };
