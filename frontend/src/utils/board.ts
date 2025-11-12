// src/utils/board.ts
export const emptyBoard = () =>
    Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => ''))
    );
