import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('create game and play a move', async ({ page }) => {
 // assume frontend running at baseURL
 await page.goto('/');
 // Check accessibility
 const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
 expect(accessibilityScanResults.violations.length).toBe(0);

 // TODO: interact with UI to create a game
 const createBtn = await page.getByRole('button', { name: /create game/i });
 await createBtn.click();
 const gameIdEl = await page.getByTestId('game-id');
 const gameId = await gameIdEl.innerText();
 expect(gameId).toBeTruthy();

 // click a cell
 const firstCell = await page.getByRole('button', { name: /cell/i }).first();
 await firstCell.click();
 // ensure it shows X or O
 await expect(firstCell).toHaveText(/X|O/);
});
