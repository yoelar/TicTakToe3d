// backend/src/components/Game.ts

export interface MoveResult {
    success: boolean;
    error?: string;
}

/**
 * Generic base class for games.
 * TPlayer must at minimum have an `id: string` property.
 */
export abstract class Game<TPlayer extends { id: string }> {
    public readonly id: string;
    public readonly createdAt: Date;
    public isFinished = false;

    /** Subclasses (and tests) should not be able to mutate this array directly. */
    protected players: TPlayer[] = [];

    constructor(id: string) {
        this.id = id;
        this.createdAt = new Date();
    }

    // ------------------- Player management -------------------

    /**
     * Adds a player to the game if not present.
     * Returns a small result object to indicate success or why it failed.
     */
    addPlayer(player: TPlayer): { success: boolean; error?: string } {
        if (this.players.find(p => p.id === player.id)) {
            return { success: false, error: 'Player already in game' };
        }
        this.players.push(player);
        return { success: true };
    }

    /**
     * Remove a player by id or player object.
     * Returns success and (optionally) a snapshot of remaining players.
     */
    removePlayer(playerOrId: string | TPlayer): { success: boolean; error?: string; remainingPlayers?: { id: string }[] } {
        const id = typeof playerOrId === 'string' ? playerOrId : playerOrId.id;
        const before = this.players.length;
        this.players = this.players.filter(p => p.id !== id);
        const removed = this.players.length < before;
        if (!removed) {
            return { success: false, error: 'Player not found' };
        }
        return { success: true, remainingPlayers: this.players.map(p => ({ id: p.id })) };
    }

    /**
     * Return a shallow copy of the players array to avoid external mutation.
     */
    getPlayers(): TPlayer[] {
        return [...this.players];
    }

    /**
     * Helper: check whether a player is part of this game by id.
     */
    hasPlayer(id: string): boolean {
        return this.players.some(p => p.id === id);
    }

    /**
     * Helper: find player by id (or undefined if not found).
     */
    protected findPlayer(id: string): TPlayer | undefined {
        return this.players.find(p => p.id === id);
    }

    // ------------------- Game-specific behaviour -------------------

    /**
     * Subclasses must implement move application logic.
     * Keep the MoveResult shape simple here; subclasses may return
     * richer objects if desired (but should be compatible).
     */
    abstract makeMove(player: TPlayer, moveData: any): MoveResult;

    // ------------------- Serialization -------------------

    /**
     * Default serialization. Subclasses should call `super.serialize()` and
     * extend the object (e.g. add board, winner, etc).
     */
    serialize(): any {
        return {
            id: this.id,
            createdAt: this.createdAt,
            players: this.players.map(p => ({ id: p.id })),
            isFinished: this.isFinished,
        };
    }
}
