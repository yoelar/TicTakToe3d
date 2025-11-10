import { render, screen, fireEvent } from '@testing-library/react';
import GameBoard from './GameBoard';

describe('GameBoard', () => {
  test('renders 27 cells (3 layers of 3x3)', () => {
    render(<GameBoard />);
    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(27);
  });

  test('clicking an empty cell places X then O', () => {
    render(<GameBoard />);
    const cells = screen.getAllByRole('button');
    fireEvent.click(cells[0]);
    expect(cells[0]).toHaveTextContent('X');

    fireEvent.click(cells[1]);
    expect(cells[1]).toHaveTextContent('O');
  });

  test('occupied cell cannot be changed', () => {
    render(<GameBoard />);
    const first = screen.getAllByRole('button')[0];
    fireEvent.click(first);
    fireEvent.click(first);
    expect(first).toHaveTextContent('X'); // stays X
  });
});
