export type MoveResult =
    | {
        success: true;
        winner: '' | 'X' | 'O';
        isFinished: boolean;
        state: {
            id: string;
            createdAt: Date;
            players: { id: string; symbol: 'X' | 'O' }[];
            board: any;
            isFinished: boolean;
            winner: '' | 'X' | 'O';
        };
    }
    | {
        success: false;
        error: string;
    };
