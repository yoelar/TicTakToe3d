import supertest from 'supertest';
import { app, server } from '../../index';

const request = supertest(app);

describe('3D TicTacToe API Leave/Rejoin Scenarios', () => {
    let clientA = 'clientA', clientB = 'clientB', clientC = 'clientC', clientD = 'clientD';
    let gameId: string;

    beforeAll(async () => {
        const res = await request.post('/api/game').query({ clientId: clientA }).expect(200);
        gameId = res.body.gameId;
    });

    afterAll(done => {
        if (server.listening) server.close(done);
        else done();
    });

    it('1️⃣ solo → join → continue', async () => {
        await request.post(`/api/game/${gameId}/join`).query({ clientId: clientB }).expect(200);
        await request.post(`/api/game/${gameId}/move`).send({ player: 'X', x: 0, y: 0, z: 0 }).expect(200);
        await request.post(`/api/game/${gameId}/move`).send({ player: 'O', x: 1, y: 0, z: 0 }).expect(200);
    });

    it('2️⃣ player2 leaves → player1 continues', async () => {
        await request.post(`/api/game/${gameId}/leave`).query({ clientId: clientB }).expect(200);
        await request.post(`/api/game/${gameId}/move`).send({ player: 'X', x: 2, y: 2, z: 0 }).expect(200);
        await request.post(`/api/game/${gameId}/move`).send({ player: 'O', x: 1, y: 1, z: 1 }).expect(200);
    });

    // ... repeat for cases 3–5 as in component-level test
});
