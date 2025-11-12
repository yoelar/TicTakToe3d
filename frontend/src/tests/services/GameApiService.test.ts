// frontend/src/tests/services/GameApiService.test.ts
import { GameApiService } from '../../services/GameApiService';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

describe('GameApiService', () => {
    const service = new GameApiService('/api');

    // Clear ALL handlers before each test
    beforeEach(() => {
        server.resetHandlers();
    });

    describe('createGame', () => {
        it('should create a game successfully', async () => {
            server.use(
                http.post('*/api/game', ({ request }) => {
                    const url = new URL(request.url);
                    expect(url.searchParams.get('clientId')).toBe('client-1');

                    return HttpResponse.json({
                        gameId: 'game-123',
                        state: { id: 'game-123', board: [], currentPlayer: 'X' }
                    });
                })
            );

            const result = await service.createGame('client-1');

            expect(result.gameId).toBe('game-123');
            expect(result.state.id).toBe('game-123');
        });

        it('should throw error when create game fails with 500', async () => {
            server.use(
                http.post('*/api/game', () => {
                    return new HttpResponse(null, { status: 500 });
                })
            );

            await expect(service.createGame('client-1'))
                .rejects.toThrow('Failed to create game');
        });

        it('should throw error when create game fails with 400', async () => {
            server.use(
                http.post('*/api/game', () => {
                    return new HttpResponse(null, { status: 400 });
                })
            );

            await expect(service.createGame('client-1'))
                .rejects.toThrow('Failed to create game');
        });

        it('should include clientId in query params', async () => {
            let capturedClientId = '';

            server.use(
                http.post('*/api/game', ({ request }) => {
                    const url = new URL(request.url);
                    capturedClientId = url.searchParams.get('clientId') || '';

                    return HttpResponse.json({
                        gameId: 'game-123',
                        state: { id: 'game-123', board: [], currentPlayer: 'X' }
                    });
                })
            );

            await service.createGame('test-client');
            expect(capturedClientId).toBe('test-client');
        });
    });

    describe('joinGame', () => {
        it('should join a game successfully', async () => {
            server.use(
                http.post('*/api/game/:gameId/join', ({ params, request }) => {
                    const url = new URL(request.url);

                    expect(params.gameId).toBe('game-123');
                    expect(url.searchParams.get('clientId')).toBe('client-2');

                    return HttpResponse.json({
                        state: { id: 'game-123', board: [], currentPlayer: 'X' }
                    });
                })
            );

            const result = await service.joinGame('game-123', 'client-2');
            expect(result.state.id).toBe('game-123');
        });

        it('should throw error when join fails', async () => {
            server.use(
                http.post('*/api/game/:gameId/join', () => {
                    return new HttpResponse(null, { status: 404 });
                })
            );

            await expect(service.joinGame('invalid-game', 'client-2'))
                .rejects.toThrow('Failed to join game');
        });

        it('should throw error when game is full', async () => {
            server.use(
                http.post('*/api/game/:gameId/join', () => {
                    return new HttpResponse(null, { status: 400 });
                })
            );

            await expect(service.joinGame('game-123', 'client-3'))
                .rejects.toThrow('Failed to join game');
        });
    });

    describe('leaveGame', () => {
        it('should leave a game successfully', async () => {
            server.use(
                http.post('*/api/game/:gameId/leave', ({ params, request }) => {
                    const url = new URL(request.url);

                    expect(params.gameId).toBe('game-123');
                    expect(url.searchParams.get('clientId')).toBe('client-1');

                    return HttpResponse.json({ success: true });
                })
            );

            await expect(service.leaveGame('game-123', 'client-1'))
                .resolves.toBeUndefined();
        });

        it('should handle leave errors gracefully', async () => {
            server.use(
                http.post('*/api/game/:gameId/leave', () => {
                    return new HttpResponse(null, { status: 500 });
                })
            );

            await expect(service.leaveGame('game-123', 'client-1'))
                .rejects.toThrow('Failed to leave game');
        });
    });

    describe('makeMove', () => {
        it('should make a move successfully', async () => {
            server.use(
                http.post('*/api/game/:gameId/move', async ({ params, request }) => {
                    const body = await request.json() as any;
                    const url = new URL(request.url);

                    expect(params.gameId).toBe('game-123');
                    expect(url.searchParams.get('clientId')).toBe('client-1');
                    expect(body.player).toBe('X');
                    expect(body.x).toBe(0);
                    expect(body.y).toBe(1);
                    expect(body.z).toBe(2);

                    return HttpResponse.json({
                        state: {
                            id: 'game-123',
                            board: [],
                            currentPlayer: 'O'
                        }
                    });
                })
            );

            const result = await service.makeMove('game-123', 'client-1', 'X', 0, 1, 2);
            expect(result.state.currentPlayer).toBe('O');
        });

        it('should throw error when move is invalid', async () => {
            server.use(
                http.post('*/api/game/:gameId/move', () => {
                    return new HttpResponse(null, { status: 400 });
                })
            );

            await expect(service.makeMove('game-123', 'client-1', 'X', 0, 0, 0))
                .rejects.toThrow('Move rejected by server');
        });

        it('should throw error when not player turn', async () => {
            server.use(
                http.post('*/api/game/:gameId/move', () => {
                    return new HttpResponse(null, { status: 403 });
                })
            );

            await expect(service.makeMove('game-123', 'client-1', 'O', 0, 0, 0))
                .rejects.toThrow('Move rejected by server');
        });
    });
});