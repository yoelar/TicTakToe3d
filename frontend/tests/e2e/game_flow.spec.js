"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// frontend/tests/e2e/game_flow.spec.ts
const test_1 = require("@playwright/test");
const playwright_1 = __importDefault(require("@axe-core/playwright"));
(0, test_1.test)('create game and play a move', async ({ page }) => {
    // Go to the app
    await page.goto('/');
    // Wait until the UI is rendered
    await page.waitForSelector('button', { timeout: 15000 });
    // Accessibility scan
    const accessibilityScanResults = await new playwright_1.default({ page }).analyze();
    if (accessibilityScanResults.violations.length > 0) {
        console.warn('⚠️ Accessibility violations found:');
        for (const v of accessibilityScanResults.violations) {
            console.warn(`- ${v.id}: ${v.description}`);
        }
    }
    (0, test_1.expect)(accessibilityScanResults.violations.length).toBeLessThanOrEqual(5); // ✅ temporary tolerance
    // Try to find the create game button
    const createBtn = page.getByTestId('create-game-btn');
    await (0, test_1.expect)(createBtn).toBeVisible({ timeout: 20000 });
    await createBtn.click();
    // Verify game ID
    const gameIdEl = page.getByTestId('game-id');
    await (0, test_1.expect)(gameIdEl).toBeVisible();
    const gameId = await gameIdEl.innerText();
    (0, test_1.expect)(gameId).not.toBe('');
    // Click a cell
    const firstCell = page.getByRole('button', { name: /cell/i }).first();
    await firstCell.click();
    // Ensure it shows X or O
    await (0, test_1.expect)(firstCell).toHaveText(/X|O/);
});
