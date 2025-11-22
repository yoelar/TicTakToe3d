// backend/src/tests/integration/WinDetection.test.ts
import request from 'supertest';
import { app } from '../../index';
import { games } from '../../components/GameStore';

describe('Win Detection Integration', () => {
    afterEach(() => {
        // Clear all games
        Object.keys(games).forEach(key => delete games[key]);
    });

    it('should detect horizontal win on first layer', async () => {
        // Create game
        const createRes = await request(app)
            .post('/api/game?clientId=player-1')
            .expect(200);

        const gameId = createRes.body.gameId;

        // Join game
        await request(app)
            .post(`/api/game/${gameId}/join?clientId=player-2`)
            .expect(200);

        // Make moves to create horizontal win: X X X on first row
        await request(app)
            .post(`/api/game/${gameId}/move?clientId=player-1`)
            .send({ player: 'X', x: 0, y: 0, z: 0 })
            .expect(200);

        await request(app)
            .post(`/api/game/${gameId}/move?clientId=player-2`)
            .send({ player: 'O', x: 1, y: 1, z: 0 })
            .expect(200);

        await request(app)
            .post(`/api/game/${gameId}/move?clientId=player-1`)
            .send({ player: 'X', x: 1, y: 0, z: 0 })
            .expect(200);

        await request(app)
            .post(`/api/game/${gameId}/move?clientId=player-2`)
            .send({ player: 'O', x: 1, y: 2, z: 0 })
            .expect(200);

        // Winning move
        const winRes = await request(app)
            .post(`/api/game/${gameId}/move?clientId=player-1`)
            .send({ player: 'X', x: 2, y: 0, z: 0 })
            .expect(200);

        // CRITICAL TEST: Game should be marked as finished with winner
        expect(winRes.body.state.isFinished).toBe(true);
        expect(winRes.body.state.winner).toBe('X');
    });

    it('should reject moves after game is won', async () => {
        // Create and set up winning game state
        const createRes = await request(app)
            .post('/api/game?clientId=player-1')
            .expect(200);

        const gameId = createRes.body.gameId;

        await request(app)
            .post(`/api/game/${gameId}/join?clientId=player-2`)
            .expect(200);

        // Create winning condition
        await request(app)
            .post(`/api/game/${gameId}/move?clientId=player-1`)
            .send({ player: 'X', x: 0, y: 0, z: 0 });

        await request(app)
            .post(`/api/game/${gameId}/move?clientId=player-2`)
            .send({ player: 'O', x: 1, y: 1, z: 0 });

        await request(app)
            .post(`/api/game/${gameId}/move?clientId=player-1`)
            .send({ player: 'X', x: 1, y: 0, z: 0 });

        await request(app)
            .post(`/api/game/${gameId}/move?clientId=player-2`)
            .send({ player: 'O', x: 1, y: 2, z: 0 });

        await request(app)
            .post(`/api/game/${gameId}/move?clientId=player-1`)
            .send({ player: 'X', x: 2, y: 0, z: 0 });

        // Try to make another move - should fail
        const moveAfterWinRes = await request(app)
            .post(`/api/game/${gameId}/move?clientId=player-2`)
            .send({ player: 'O', x: 0, y: 1, z: 0 })
            .expect(400);

        expect(moveAfterWinRes.body.error).toMatch(/game is .*finished|already won/i);
    });
});