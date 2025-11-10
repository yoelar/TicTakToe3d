// src/components/GameBoard.tsx
import React from 'react';
import { useGameState } from '../hooks/useGameState';
import BoardLayer from './BoardLayer';
import '../styles/board.css';
import type { GameState } from '../types/game';

type Props = {
    state?: GameState | undefined;
    onCellClick?: (x: number, y: number, z: number) => void | Promise<void>;
};

const GameBoard: React.FC<Props> = ({ state, onCellClick }) => {
    // If a state/handler is provided by the App (backend-driven), use it,
    // otherwise fall back to local hook (useful for tests and dev without backend).
    const local = useGameState();

    const board = state ? state.board as any : local.board;
    const handleClick = (x: number, y: number, z: number) => {
        if (onCellClick) return onCellClick(x, y, z);
        return local.makeMove(x, y, z);
    };

    const restart = () => {
        if (state && !onCellClick) return; // no-op when backend-managed without handler
        local.restart();
    };

    return (
        <div className="game-wrapper">
            <button className="restart-btn" onClick={restart}>
                Restart
            </button>
            <div className="layers-wrapper">
                {board.map((layer: any, z: number) => (
                    <BoardLayer
                        key={z}
                        layer={layer}
                        z={z}
                        onCellClick={handleClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default GameBoard;
