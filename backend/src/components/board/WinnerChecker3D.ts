// backend/src/components/board/WinnerChecker3D.ts
import { Board3D } from './Board3D';

export class WinnerChecker3D {
    private readonly lines: [number, number, number][][];

    constructor(private readonly board: Board3D) {
        this.lines = this.generateLines();
    }

    private generateLines(): [number, number, number][][] {
        const lines: [number, number, number][][] = [];
        const size = this.board.getSize();

        // Same logic as before: rows, columns, layers, diagonals, etc.
        for (let z = 0; z < size; z++) {
            for (let i = 0; i < size; i++) {
                lines.push([[0, i, z], [1, i, z], [2, i, z]]);
                lines.push([[i, 0, z], [i, 1, z], [i, 2, z]]);
            }
            lines.push([[0, 0, z], [1, 1, z], [2, 2, z]]);
            lines.push([[0, 2, z], [1, 1, z], [2, 0, z]]);
        }

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                lines.push([[x, y, 0], [x, y, 1], [x, y, 2]]);
            }
        }

        lines.push([[0, 0, 0], [1, 1, 1], [2, 2, 2]]);
        lines.push([[0, 0, 2], [1, 1, 1], [2, 2, 0]]);
        lines.push([[0, 2, 0], [1, 1, 1], [2, 0, 2]]);
        lines.push([[0, 2, 2], [1, 1, 1], [2, 0, 0]]);

        return lines;
    }

    checkWinner(): 'X' | 'O' | '' {
        for (const line of this.lines) {
            const [[x1, y1, z1], [x2, y2, z2], [x3, y3, z3]] = line;
            const s1 = this.board.get(x1, y1, z1);
            if (!s1) continue;
            if (s1 === this.board.get(x2, y2, z2) && s1 === this.board.get(x3, y3, z3)) {
                return s1;
            }
        }
        return '';
    }
}
