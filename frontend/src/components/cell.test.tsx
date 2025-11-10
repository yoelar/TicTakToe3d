import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Cell from './Cell';

describe('<Cell />', () => {
    it('renders an empty cell initially', () => {
        render(<Cell value="" onClick={() => { }} />);
        const cell = screen.getByRole('button');
        expect(cell).toBeInTheDocument();
        expect(cell).toHaveTextContent('');
    });

    it('renders X or O correctly', () => {
        const { rerender } = render(<Cell value="X" onClick={() => { }} />);
        expect(screen.getByText('X')).toBeInTheDocument();

        rerender(<Cell value="O" onClick={() => { }} />);
        expect(screen.getByText('O')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handleClick = jest.fn();
        render(<Cell value="" onClick={handleClick} />);
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not crash if already filled', () => {
        const handleClick = jest.fn();
        render(<Cell value="X" onClick={handleClick} />);
        fireEvent.click(screen.getByText('X'));
        // We don't prevent the click itself, but value won't change — just sanity check
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
