// src/components/GameBoard.tsx
import React from 'react';
import { useGameState } from '../hooks/useGameState';
import BoardLayer from './BoardLayer';
import '../styles/board.css';

const GameBoard: React.FC = () => {
    const { board, makeMove, restart } = useGameState();

    return (
        <div className="game-wrapper">
            <button className="restart-btn" onClick={restart}>
                Restart
            </button>
            <div className="layers-wrapper">
                {board.map((layer, z) => (
                    <BoardLayer
                        key={z}
                        layer={layer}
                        z={z}
                        onCellClick={makeMove}
                    />
                ))}
            </div>
        </div>
    );
};

export default GameBoard;
