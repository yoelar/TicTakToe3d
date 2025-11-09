import React from 'react';
import '../styles/components.css';
import type { GameState } from '../types/game';

type Props = {
    state?: GameState;
};

export default function GameStatus({ state }: Props) {
    if (!state) return <div className="status">No game</div>;
    const turn = (() => {
        // derive who is next by counting pieces
        const flat = state.board.flat(2);
        const xCount = flat.filter(c => c === 'X').length;
        const oCount = flat.filter(c => c === 'O').length;
        const next = xCount === oCount ? 'X' : 'O';
        return next;
    })();

    if (state.isFinished) {
        return <div className="status">Winner: {state.winner || 'Draw'}</div>;
    }
    return <div className="status">Next: {turn}</div>;
}
