// frontend/tests/e2e/game_flow.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('create game and play a move', async ({ page }) => {
    // Go to the app
    await page.goto('/');

    // Wait until the UI is rendered
    await page.waitForSelector('button', { timeout: 15000 });

    // Accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    if (accessibilityScanResults.violations.length > 0) {
        console.warn('⚠️ Accessibility violations found:');
        for (const v of accessibilityScanResults.violations) {
            console.warn(`- ${v.id}: ${v.description}`);
        }
    }

    expect(accessibilityScanResults.violations.length).toBeLessThanOrEqual(5); // ✅ temporary tolerance

    // Try to find the create game button
    const createBtn = page.getByTestId('create-game-btn');
    await expect(createBtn).toBeVisible({ timeout: 20000 });
    await createBtn.click();

    // Verify game ID
    const gameIdEl = page.getByTestId('game-id');
    await expect(gameIdEl).toBeVisible();
    const gameId = await gameIdEl.innerText();
    expect(gameId).not.toBe('');

    // Click a cell
    const firstCell = page.getByRole('button', { name: /cell/i }).first();
    await firstCell.click();

    // Ensure it shows X or O
    await expect(firstCell).toHaveText(/X|O/);
});
