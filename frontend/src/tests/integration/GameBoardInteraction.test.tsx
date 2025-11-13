// frontend/src/tests/integration/GameBoardInteraction.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameLayout } from '../../components/GameLayout';
import { GameState } from '../../../../Shared/types';

describe('GameBoard Interaction', () => {
    const mockGameState: GameState = {
        id: 'game-123',
        board: Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () =>
                Array.from({ length: 3 }, () => '')
            )
        ),
        currentPlayer: 'X',
        players: [
            { id: 'client-1', symbol: 'X' },
            { id: 'client-2', symbol: 'O' }
        ],
        isFinished: false,
        winner: null
    };

    it('should call onMove when cell is clicked', async () => {
        const mockOnMove = jest.fn();
        const mockOnLeave = jest.fn();

        render(
            <GameLayout
                gameId="game-123"
                gameState={mockGameState}
                assignedPlayer="X"
                players={[]}
                onMove={mockOnMove}
                onLeave={mockOnLeave}
                isConnected={true}
            />
        );

        const cells = screen.getAllByLabelText(/cell/i);
        fireEvent.click(cells[0]);

        expect(mockOnMove).toHaveBeenCalledWith(0, 0, 0);
    });

    it('should not allow move when not player turn', async () => {
        const mockOnMove = jest.fn();

        render(
            <GameLayout
                gameId="game-123"
                gameState={{ ...mockGameState, currentPlayer: 'O' }}
                assignedPlayer="X"
                players={[]}
                onMove={mockOnMove}
                onLeave={jest.fn()}
                isConnected={true}
            />
        );

        const cells = screen.getAllByLabelText(/cell/i);
        fireEvent.click(cells[0]);

        // Should not call onMove if it's not player's turn
        // Adjust based on your actual implementation
        expect(mockOnMove).not.toHaveBeenCalled();
    });

    it('should disable cells when not connected', () => {
        render(
            <GameLayout
                gameId="game-123"
                gameState={mockGameState}
                assignedPlayer="X"
                players={[]}
                onMove={jest.fn()}
                onLeave={jest.fn()}
                isConnected={false}
            />
        );

        const cells = screen.getAllByLabelText(/cell/i);
        cells.forEach(cell => {
            expect(cell).toBeDisabled();
        });
    });
});
