// backend/src/components/Game.ts

export interface MoveResult {
    success: boolean;
    error?: string;
}

/**
 * Base abstract class for any multiplayer game.
 * Defines the minimum lifecycle contract all games must follow.
 */
export abstract class Game {
    readonly id: string;

    /** Whether the game has ended */
    protected isFinished = false;

    /** Timestamp for auditing / persistence */
    readonly createdAt: Date;

    constructor(id: string) {
        this.id = id;
        this.createdAt = new Date();
    }

    /**
     * Adds a player to the game.
     * Concrete subclasses define allowed limits and rules.
     */
    abstract addPlayer(player: any): void;

    /**
     * Applies a move by a player.
     * The moveData is kept generic so higher-level logic
     * (e.g., TicTacToe, Chess, etc.) can interpret it.
     */
    abstract makeMove(player: any, moveData: any): MoveResult;

    /**
     * Serializes the game state into a plain JS object.
     * This allows transport via REST, WebSocket, or persistence.
     */
    abstract serialize(): object;

    /**
     * Whether the game has ended.
     */
    public isGameFinished(): boolean {
        return this.isFinished;
    }

    /**
     * Ends the game explicitly.
     * This is optional — many games end automatically when a winner is found.
     */
    public endGame(): void {
        this.isFinished = true;
    }
}
