export abstract class Player {
    public readonly id: string;
    protected _connected: boolean;

    constructor(id: string) {
        this.id = id;
        this._connected = false;
    }

    /** Whether the player is currently connected */
    get connected(): boolean {
        return this._connected;
    }

    /** Connects the player */
    connect(): void {
        this._connected = true;
    }

    /** Disconnects the player */
    disconnect(): void {
        this._connected = false;
    }

    /** Equality check based on ID */
    equals(other: Player): boolean {
        return this.id === other.id;
    }
}
