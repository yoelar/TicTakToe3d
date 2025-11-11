import { test, expect } from '@playwright/test';

test('two players can create and join a game', async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // Player A creates a game
    await pageA.goto('/');
    await pageA.getByTestId('create-game-btn').click();

    const gameId = await pageA.getByTestId('game-id').innerText();
    expect(gameId).not.toBe('');

    // Player A copies join link
    const copyBtn = pageA.getByTestId('copy-join-link-btn');
    await expect(copyBtn).toBeVisible();
    const joinLink = await copyBtn.getAttribute('data-link');
    expect(joinLink).toContain(`join=${gameId}`);

    // Player B opens join link
    await pageB.goto(joinLink);

    // Player B should see the same game ID
    await expect(pageB.getByTestId('game-id')).toHaveText(gameId);

    // Player B clicks a cell
    const firstCell = pageB.getByRole('button', { name: /cell/i }).first();
    await firstCell.click();

    // Player A should see the updated cell (after short delay)
    await pageA.waitForTimeout(300); // for simulated sync
    const updatedA = await pageA.getByRole('button', { name: /cell/i }).first().innerText();
    expect(updatedA).toMatch(/X|O/);

    await contextA.close();
    await contextB.close();
});
