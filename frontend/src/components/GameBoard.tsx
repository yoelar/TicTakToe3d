// src/components/GameBoard.tsx
import React, { useState } from 'react';
import '../styles/layout.css'; // updated CSS name

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
        if (board[z][y][x] !== '') return; // already occupied
        const newBoard = structuredClone(board);
        newBoard[z][y][x] = current;
        setBoard(newBoard);
        setCurrent(current === 'X' ? 'O' : 'X');
    };

    return (
        <div className="board-container">
            {board.map((layer, z) => (
                <div key={z} className="board-layer">
                    {layer.map((row, y) =>
                        row.map((cell, x) => (
                            <div
                                key={`${x}-${y}-${z}`}
                                className={`cell ${cell}`} // <--- add the cell's symbol class
                                onClick={() => handleCellClick(x, y, z)}
                            >
                                {cell}
                            </div>
                        ))
                    )}
                </div>
            ))}
        </div>
    );
};

export default GameBoard;
