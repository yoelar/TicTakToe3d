// src/tests/integration/GameFlow.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameBoard from '../../components/GameBoard';

describe('GameBoard integration tests', () => {
    test('renders a full 3-layer 3x3x3 board', () => {
        render(<GameBoard />);
        const layers = screen.getAllByTestId('board-layer');
        expect(layers).toHaveLength(3);

        // Each layer should have 9 cells
        const cells = screen.getAllByLabelText(/cell/i);
        expect(cells).toHaveLength(27);
    });

    test('clicking a cell places X then O alternately', () => {
        render(<GameBoard />);
        const cells = screen.getAllByLabelText(/cell/i);

        fireEvent.click(cells[0]);
        expect(cells[0]).toHaveTextContent('X');

        fireEvent.click(cells[1]);
        expect(cells[1]).toHaveTextContent('O');

        fireEvent.click(cells[2]);
        expect(cells[2]).toHaveTextContent('X');
    });

    test('clicking the same cell twice does not overwrite it', () => {
        render(<GameBoard />);
        const cells = screen.getAllByLabelText(/cell/i);

        fireEvent.click(cells[0]);
        expect(cells[0]).toHaveTextContent('X');

        fireEvent.click(cells[0]);
        expect(cells[0]).toHaveTextContent('X'); // unchanged
    });

    test('Restart button clears the board', () => {
        render(<GameBoard />);
        const cells = screen.getAllByLabelText(/cell/i);

        fireEvent.click(cells[0]);
        fireEvent.click(cells[1]);
        expect(cells[0]).toHaveTextContent('X');
        expect(cells[1]).toHaveTextContent('O');

        // Now restart
        const restartBtn = screen.getByRole('button', { name: /restart/i });
        fireEvent.click(restartBtn);

        // Board should be empty again
        cells.forEach(cell => {
            expect(cell).toHaveTextContent('');
        });
    });

});
