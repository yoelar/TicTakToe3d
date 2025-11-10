// src/components/GameBoard.tsx
import React, { useState } from 'react';
import Cell from './Cell';
import '../styles/board.css';

type Symbol = 'X' | 'O' | '';

const emptyBoard = (): Symbol[][][] =>
    Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () => '')
        )
    );

const GameBoard: React.FC = () => {
    const [board, setBoard] = useState<Symbol[][][]>(emptyBoard());
    const [current, setCurrent] = useState<Symbol>('X');

    const handleCellClick = (x: number, y: number, z: number) => {
        if (board[z][y][x] !== '') return;

        const copy = structuredClone(board) as Symbol[][][];
        copy[z][y][x] = current;
        setBoard(copy);
        setCurrent(current === 'X' ? 'O' : 'X');
    };

    return (
        <div className="layers-wrapper">
            {board.map((layer, z) => (
                <section
                    key={z}
                    className="layer"
                    data-testid="board-layer"   // ✅ Added for Jest/RTL tests
                >
                    <div className="layer-title">Layer {z + 1}</div>
                    <div
                        className="layer-grid"
                        role="grid"
                        aria-label={`Layer ${z + 1}`}
                    >
                        {layer.map((row, y) =>
                            row.map((cell, x) => (
                                <Cell
                                    key={`${x}-${y}-${z}`}
                                    value={cell}
                                    onClick={() => handleCellClick(x, y, z)}
                                    data-x={x}
                                    data-y={y}
                                    data-z={z}
                                />
                            ))
                        )}
                    </div>
                </section>
            ))}
        </div>
    );
};

export default GameBoard;
