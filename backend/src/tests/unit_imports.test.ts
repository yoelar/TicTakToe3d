import { ThreeDTicTacToeGame } from '../components/ThreeDTicTacToeGame';
import { TicTacToePlayer } from '../components/TicTacToePlayer';
import { Game } from '../components/Game';
import { TicTacToeGame } from '../components/TicTacToeGame';

describe('Backend module imports', () => {
 it('should import core classes without throwing', () => {
 expect(typeof ThreeDTicTacToeGame).toBe('function');
 expect(typeof TicTacToePlayer).toBe('function');
 expect(typeof Game).toBe('function');
 expect(typeof TicTacToeGame).toBe('function');
 });

 it('can create a ThreeDTicTacToeGame and player', () => {
 const g = new ThreeDTicTacToeGame('t1');
 const p = new TicTacToePlayer('p1', 'X');
 expect(g.id).toBe('t1');
 expect(p.id).toBe('p1');
 });
});
