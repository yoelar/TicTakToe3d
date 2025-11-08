import { Board3D } from '../../components/board/Board3D';

describe('Board3D', () => {
    let board: Board3D;

    beforeEach(() => {
        board = new Board3D();
    });

    test('starts empty', () => {
        for (let z = 0; z < 3; z++)
            for (let y = 0; y < 3; y++)
                for (let x = 0; x < 3; x++)
                    expect(board.get(x, y, z)).toBe('');
    });

    test('isValid recognizes in-range coordinates', () => {
        expect(board.isValid(0, 0, 0)).toBe(true);
        expect(board.isValid(2, 2, 2)).toBe(true);
        expect(board.isValid(3, 0, 0)).toBe(false);
        expect(board.isValid(0, -1, 0)).toBe(false);
    });

    test('set/get work correctly', () => {
        board.set(1, 1, 1, 'X');
        expect(board.get(1, 1, 1)).toBe('X');
        expect(board.isEmpty(1, 1, 1)).toBe(false);
    });

    test('reset clears all cells', () => {
        board.set(0, 0, 0, 'O');
        board.reset();
        expect(board.get(0, 0, 0)).toBe('');
    });

    test('invalid coordinates throw on get/set', () => {
        expect(() => board.get(5, 0, 0)).toThrow(RangeError);
        expect(() => board.set(-1, 0, 0, 'X')).toThrow(RangeError);
    });

    test('toJSON returns a deep copy', () => {
        const json = board.toJSON();
        json[0][0][0] = 'X';
        expect(board.get(0, 0, 0)).toBe('');
    });
});
