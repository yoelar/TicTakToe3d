// src/hooks/useGameState.ts
import { useState } from 'react';

export type Symbol = 'X' | 'O' | '';

const emptyBoard = (): Symbol[][][] =>
    Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () => '')
        )
    );

export const useGameState = () => {
    const [board, setBoard] = useState<Symbol[][][]>(emptyBoard());
    const [current, setCurrent] = useState<Symbol>('X');

    const makeMove = (x: number, y: number, z: number) => {
        if (board[z][y][x] !== '') return; // ignore filled cells
        const newBoard = structuredClone(board);
        newBoard[z][y][x] = current;
        setBoard(newBoard);
        setCurrent(current === 'X' ? 'O' : 'X');
    };

    const restart = () => {
        setBoard(emptyBoard());
        setCurrent('X');
    };

    return { board, current, makeMove, restart };
};
