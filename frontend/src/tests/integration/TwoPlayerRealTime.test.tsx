// frontend/src/tests/integration/TwoPlayerRealTime.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameController } from '../../components/GameController';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('Two Player Real-Time Game (Simulates Real Browser)', () => {
    let gameBoard: string[][][];
    let pollCalls: Array<{ time: number; board: string }> = [];
    let currentPlayer: 'X' | 'O';

    beforeEach(() => {
        pollCalls = [];
        currentPlayer = 'X';
        gameBoard = Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () =>
                Array.from({ length: 3 }, () => '')
            )
        );
        localStorage.clear();

        server.use(
            http.post('*/api/game', ({ request }) => {
                const url = new URL(request.url);
                const clientId = url.searchParams.get('clientId');
                console.log('[Mock] Player 1 creates game');

                return HttpResponse.json({
                    success: true,
                    gameId: 'game-real-123',
                    player: 'X',
                    state: {
                        id: 'game-real-123',
                        createdAt: new Date().toISOString(),
                        players: [{ id: clientId, symbol: 'X' }],
                        board: gameBoard,
                        isFinished: false,
                        winner: '',
                        currentPlayer: 'X'
                    }
                });
            }),

            http.post('*/api/game/:gameId/join', ({ params, request }) => {
                const url = new URL(request.url);
                const clientId = url.searchParams.get('clientId');
                console.log('[Mock] Player 2 joins game');

                return HttpResponse.json({
                    success: true,
                    player: 'O',
                    state: {
                        id: params.gameId,
                        createdAt: new Date().toISOString(),
                        players: [
                            { id: 'player-1', symbol: 'X' },
                            { id: clientId, symbol: 'O' }
                        ],
                        board: gameBoard,
                        isFinished: false,
                        winner: '',
                        currentPlayer: 'X'
                    }
                });
            }),

            http.get('*/api/game/:gameId/state', () => {
                const timestamp = Date.now();
                const boardState = gameBoard[0][0][0];
                pollCalls.push({ time: timestamp, board: boardState });

                console.log(`[Mock] Poll #${pollCalls.length} at ${timestamp} - Board[0][0][0]="${boardState}"`);

                return HttpResponse.json({
                    id: 'game-real-123',
                    createdAt: new Date().toISOString(),
                    players: [
                        { id: 'player-1', symbol: 'X' },
                        { id: 'player-2', symbol: 'O' }
                    ],
                    board: gameBoard,
                    isFinished: false,
                    winner: '',
                    currentPlayer
                });
            }),

            http.post('*/api/game/:gameId/move', async ({ request }) => {
                const body = await request.json() as any;
                console.log(`[Mock] Move made: ${body.player} at [${body.x},${body.y},${body.z}]`);

                gameBoard[body.z][body.y][body.x] = body.player;
                currentPlayer = body.player === 'X' ? 'O' : 'X';

                return HttpResponse.json({
                    state: {
                        id: 'game-real-123',
                        createdAt: new Date().toISOString(),
                        players: [
                            { id: 'player-1', symbol: 'X' },
                            { id: 'player-2', symbol: 'O' }
                        ],
                        board: gameBoard,
                        isFinished: false,
                        winner: '',
                        currentPlayer
                    }
                });
            })
        );
    });

    afterEach(() => {
        server.resetHandlers();
    });

    it('SCENARIO: Player 1 moves, Player 2 should see it', async () => {
        console.log('\n========================================');
        console.log('SCENARIO: Two players, one board');
        console.log('========================================\n');

        // ========== PLAYER 1: Create and make move ==========
        console.log('--- PLAYER 1 ACTIONS ---');
        localStorage.setItem('clientId', 'player-1');

        const { unmount: unmountPlayer1 } = render(<GameController />);

        // Create game
        const createBtn = await screen.findByTestId('create-game-btn');
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(screen.getAllByLabelText(/cell/i).length).toBe(27);
        });

        console.log('[Player 1] Board loaded');

        // Player 1 makes a move
        const player1Cells = screen.getAllByLabelText(/cell-empty/i);
        fireEvent.click(player1Cells[0]);

        await waitFor(() => {
            const cells = screen.getAllByLabelText(/cell/i);
            expect(cells[0]).toHaveTextContent('X');
        });

        console.log('[Player 1] Made move at [0,0,0] - Cell shows "X"');
        console.log('[Backend] Board state is now: X at [0,0,0]\n');

        // Simulate Player 1 closing their browser/tab
        unmountPlayer1();
        console.log('[Player 1] Closed browser tab\n');

        // ========== PLAYER 2: Join game and wait ==========
        console.log('--- PLAYER 2 ACTIONS ---');
        localStorage.clear();
        localStorage.setItem('clientId', 'player-2');

        const pollCountBeforeJoin = pollCalls.length;

        render(<GameController />);

        // Join existing game
        const gameIdInput = screen.getByPlaceholderText(/enter game id/i);
        const joinBtn = screen.getByRole('button', { name: /join/i });

        fireEvent.change(gameIdInput, { target: { value: 'game-real-123' } });
        fireEvent.click(joinBtn);

        await waitFor(() => {
            expect(screen.getAllByLabelText(/cell/i).length).toBe(27);
        });

        console.log('[Player 2] Joined game and board loaded');

        const player2Cells = screen.getAllByLabelText(/cell/i);
        const initialCellValue = player2Cells[0].textContent;

        console.log(`[Player 2] Initial view of cell[0]: "${initialCellValue}"`);
        console.log(`[Player 2] Expected: "X" (Player 1's move)`);
        console.log(`[Player 2] Actual: "${initialCellValue}"`);

        // CRITICAL TEST: Player 2 should see Player 1's move immediately or after 1 poll
        if (initialCellValue !== 'X') {
            console.log('[Player 2] Did NOT see move on join. Waiting for polling...');

            const waitStartTime = Date.now();

            await waitFor(() => {
                const cells = screen.getAllByLabelText(/cell/i);
                const cellValue = cells[0].textContent;

                if (cellValue === 'X') {
                    const detectionTime = Date.now() - waitStartTime;
                    console.log(`[Player 2] ✅ Detected move after ${detectionTime}ms`);
                }

                expect(cellValue).toBe('X');
            }, { timeout: 5000 });
        } else {
            console.log('[Player 2] ✅ Saw move immediately on join');
        }

        console.log(`\n[Stats] Total polls by Player 2: ${pollCalls.length - pollCountBeforeJoin}`);
        console.log('[Test] ✅ SUCCESS: Player 2 can see Player 1\'s move');
        console.log('========================================\n');
    }, 15000);

    it('CRITICAL BUG TEST: Player 2 polls but doesnt see move', async () => {
        console.log('\n========================================');
        console.log('BUG TEST: Polling happens but UI doesnt update');
        console.log('========================================\n');

        // Player 1 makes move first
        localStorage.setItem('clientId', 'player-1');
        const { unmount } = render(<GameController />);

        const createBtn = await screen.findByTestId('create-game-btn');
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(screen.getAllByLabelText(/cell/i).length).toBe(27);
        });

        const cells = screen.getAllByLabelText(/cell-empty/i);
        fireEvent.click(cells[0]);

        await waitFor(() => {
            const updatedCells = screen.getAllByLabelText(/cell/i);
            expect(updatedCells[0]).toHaveTextContent('X');
        });

        console.log('[Player 1] Made move: X at [0,0,0]');
        console.log('[Backend] gameBoard[0][0][0] = "X"');

        unmount();

        // Player 2 joins
        localStorage.clear();
        localStorage.setItem('clientId', 'player-2');

        const pollsBefore = pollCalls.length;
        console.log(`\n[Player 2] Joining game... (polls so far: ${pollsBefore})`);

        render(<GameController />);

        const gameIdInput = screen.getByPlaceholderText(/enter game id/i);
        const joinBtn = screen.getByRole('button', { name: /join/i });

        fireEvent.change(gameIdInput, { target: { value: 'game-real-123' } });
        fireEvent.click(joinBtn);

        await waitFor(() => {
            expect(screen.getAllByLabelText(/cell/i).length).toBe(27);
        });

        // Check initial state
        const player2Cells = screen.getAllByLabelText(/cell/i);
        const initialValue = player2Cells[0].textContent;

        console.log(`[Player 2] Board loaded. Cell[0] shows: "${initialValue}"`);
        console.log(`[Player 2] Backend has: "${gameBoard[0][0][0]}"`);

        // Wait for at least 2 polls to happen (4+ seconds)
        console.log('[Test] Waiting 4.5 seconds for polling...');
        await new Promise(resolve => setTimeout(resolve, 4500));

        const pollsAfter = pollCalls.length;
        const pollsOccurred = pollsAfter - pollsBefore;

        console.log(`\n[Stats] Polls occurred: ${pollsOccurred}`);
        console.log(`[Stats] Poll details:`);
        pollCalls.slice(pollsBefore).forEach((poll, i) => {
            console.log(`  Poll ${i + 1}: board="${poll.board}"`);
        });

        // Final check
        const finalCells = screen.getAllByLabelText(/cell/i);
        const finalValue = finalCells[0].textContent;

        console.log(`\n[Player 2] Final cell[0] value: "${finalValue}"`);
        console.log(`[Backend] gameBoard[0][0][0]: "${gameBoard[0][0][0]}"`);
        console.log(`[Expected] Should show: "X"`);

        // THE CRITICAL ASSERTION
        console.log(`\n[Analysis] Polling happened: ${pollsOccurred > 0 ? '✅ YES' : '❌ NO'}`);
        console.log(`[Analysis] Backend has data: ${gameBoard[0][0][0] === 'X' ? '✅ YES' : '❌ NO'}`);
        console.log(`[Analysis] UI updated: ${finalValue === 'X' ? '✅ YES' : '❌ NO'}`);

        if (pollsOccurred > 0 && gameBoard[0][0][0] === 'X' && finalValue !== 'X') {
            console.log('\n❌ BUG CONFIRMED: Polling works, backend has data, but UI does not update!');
        }

        console.log('========================================\n');

        expect(finalValue).toBe('X');
    }, 20000);
});