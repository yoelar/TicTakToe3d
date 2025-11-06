export interface MoveResult {
    success: boolean;
    error?: string;
}

export abstract class Game<TPlayer extends { id: string }> {
    public readonly id: string;
    public readonly createdAt: Date;
    protected players: TPlayer[] = [];
    public isFinished = false;

    constructor(id: string) {
        this.id = id;
        this.createdAt = new Date();
    }

    /** Base addPlayer – adds player if not already in the list */
    addPlayer(player: TPlayer): { success: boolean; error?: string } {
        if (this.players.find(p => p.id === player.id)) {
            return { success: false, error: 'Player already in game' };
        }
        this.players.push(player);
        return { success: true };
    }

    /** Base removePlayer – removes by object or string ID */
    removePlayer(playerOrId: string | TPlayer): { success: boolean; error?: string } {
        const playerId = typeof playerOrId === 'string' ? playerOrId : playerOrId.id;
        const before = this.players.length;
        this.players = this.players.filter(p => p.id !== playerId);
        const removed = this.players.length < before;
        return removed
            ? { success: true }
            : { success: false, error: 'Player not found' };
    }

    /** Returns all current players */
    getPlayers(): TPlayer[] {
        return this.players;
    }

    /** Subclasses must implement how moves are made */
    abstract makeMove(player: TPlayer, moveData: any): MoveResult;

    /** Optional serialization override for saving state */
    serialize(): any {
        return {
            id: this.id,
            createdAt: this.createdAt,
            players: this.players.map(p => ({ id: p.id })),
            isFinished: this.isFinished,
        };
    }
}
