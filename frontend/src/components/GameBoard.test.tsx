import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameBoard from './GameBoard';

describe('<GameBoard />', () => {
    it('renders 27 cells (3x3x3 board)', () => {
        render(<GameBoard />);
        const cells = screen.getAllByRole('button');
        expect(cells).toHaveLength(27);
    });

    it('places X on first click and O on next click', () => {
        render(<GameBoard />);
        const cells = screen.getAllByRole('button');

        // Click first cell -> X
        fireEvent.click(cells[0]);
        expect(cells[0]).toHaveTextContent('X');

        // Click another cell -> O
        fireEvent.click(cells[1]);
        expect(cells[1]).toHaveTextContent('O');
    });

    it('does not overwrite a filled cell', () => {
        render(<GameBoard />);
        const cells = screen.getAllByRole('button');

        fireEvent.click(cells[0]); // X
        fireEvent.click(cells[0]); // should not change
        expect(cells[0]).toHaveTextContent('X');
    });

    it('alternates correctly even when skipping filled cells', () => {
        render(<GameBoard />);
        const cells = screen.getAllByRole('button');

        fireEvent.click(cells[0]); // X
        fireEvent.click(cells[0]); // ignored
        fireEvent.click(cells[1]); // O
        expect(cells[0]).toHaveTextContent('X');
        expect(cells[1]).toHaveTextContent('O');
    });
    it('plays a short game sequence correctly', () => {
        render(<GameBoard />);
        const cells = screen.getAllByRole('button');

        // Simulate moves: X, O, X, O, X
        fireEvent.click(cells[0]); // X
        fireEvent.click(cells[1]); // O
        fireEvent.click(cells[2]); // X
        fireEvent.click(cells[3]); // O
        fireEvent.click(cells[4]); // X

        // Verify alternating pattern
        expect(cells[0]).toHaveTextContent('X');
        expect(cells[1]).toHaveTextContent('O');
        expect(cells[2]).toHaveTextContent('X');
        expect(cells[3]).toHaveTextContent('O');
        expect(cells[4]).toHaveTextContent('X');
    });

    it('maintains board state across re-renders', () => {
        const { rerender } = render(<GameBoard />);
        const cells = screen.getAllByRole('button');

        fireEvent.click(cells[0]); // X
        rerender(<GameBoard />); // simulate re-render (React state should persist)
        expect(cells[0]).toHaveTextContent('X');
    });

    it('ignores clicks on filled cells but continues the game', () => {
        render(<GameBoard />);
        const cells = screen.getAllByRole('button');

        fireEvent.click(cells[0]); // X
        fireEvent.click(cells[0]); // ignored
        fireEvent.click(cells[1]); // O
        fireEvent.click(cells[2]); // X

        expect(cells[0]).toHaveTextContent('X');
        expect(cells[1]).toHaveTextContent('O');
        expect(cells[2]).toHaveTextContent('X');
    });

    it('renders all layers distinctly for 3D structure', () => {
        render(<GameBoard />);
        const layers = screen.getAllByTestId('board-layer');
        expect(layers).toHaveLength(3);
        // Each layer should have 9 cells (3x3)
        layers.forEach(layer => {
            expect(layer.querySelectorAll('button')).toHaveLength(9);
        });
    });

});
