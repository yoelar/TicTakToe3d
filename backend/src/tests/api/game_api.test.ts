import supertest from 'supertest';
import { server, app } from '../../index'; // adjust path if needed

const request = supertest(app);

describe('3D TicTacToe REST API', () => {
  let clientA = 'clientA';
  let clientB = 'clientB';
  let gameId: string;

    afterAll(() => {
        if (server.listening) server.close();
    });

  it('should create a new game', async () => {
    const res = await request
      .post('/api/game')
      .query({ clientId: clientA })
      .expect(200);
    expect(res.body).toHaveProperty('gameId');
    expect(res.body).toHaveProperty('player');
    expect(res.body.player).toBe('X');
    gameId = res.body.gameId;
  });

  it('should allow the same player to make moves in solo mode', async () => {
    const move1 = await request
      .post(`/api/game/${gameId}/move`)
      .send({ player: 'X', x: 0, y: 0, z: 0 })
      .expect(200);
    expect(move1.body.state.board[0][0][0]).toBe('X');

    const move2 = await request
      .post(`/api/game/${gameId}/move`)
      .send({ player: 'O', x: 1, y: 1, z: 1 })
      .expect(200);
    expect(move2.body.state.board[1][1][1]).toBe('O');
  });

  it('should allow another player to join', async () => {
    const joinRes = await request
      .post(`/api/game/${gameId}/join`)
      .query({ clientId: clientB })
      .expect(200);
    expect(joinRes.body.player).toBe('O');
  });

  it('should reject a third player', async () => {
    const joinRes = await request
      .post(`/api/game/${gameId}/join`)
      .query({ clientId: 'clientC' })
      .expect(400);
    expect(joinRes.body.error).toMatch(/full/i);
  });

  it('should alternate turns between players X and O', async () => {
    await request
      .post(`/api/game/${gameId}/move`)
      .send({ player: 'X', x: 0, y: 1, z: 0 })
      .expect(200);

    const badMove = await request
      .post(`/api/game/${gameId}/move`)
      .send({ player: 'X', x: 0, y: 2, z: 0 })
      .expect(400);

    expect(badMove.body.error).toMatch(/not .* turn/i);
  });

  it('should report a win when one player completes a line', async () => {
    const winGame = await request
      .post('/api/game')
      .query({ clientId: 'winner' })
      .expect(200);
    const newId = winGame.body.gameId;

    // X wins via (0,0,0), (1,0,0), (2,0,0)
    await request.post(`/api/game/${newId}/move`).send({ player: 'X', x: 0, y: 0, z: 0 });
    await request.post(`/api/game/${newId}/move`).send({ player: 'O', x: 0, y: 1, z: 0 });
    await request.post(`/api/game/${newId}/move`).send({ player: 'X', x: 1, y: 0, z: 0 });
    await request.post(`/api/game/${newId}/move`).send({ player: 'O', x: 1, y: 1, z: 0 });
    const winRes = await request.post(`/api/game/${newId}/move`).send({ player: 'X', x: 2, y: 0, z: 0 });

    expect(winRes.body.state.winner).toBe('X');
  });
});
