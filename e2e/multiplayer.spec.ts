import { test, expect } from '@playwright/test';

test.describe('Multiplayer Game', () => {
  test('should allow two players to join and start a game', async ({ browser }) => {
    // Create two browser contexts (simulate two players)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const player1 = await context1.newPage();
    const player2 = await context2.newPage();

    try {
      // Player 1 creates a game
      await player1.goto('/create');
      await player1.fill('input[type="text"]', 'Player1');
      await player1.fill('input[type="number"]', '1'); // 1 round for faster testing
      await player1.click('button[type="submit"]');

      // Wait for lobby
      await player1.waitForURL(/\/lobby\/[A-Z0-9]+/);

      // Extract invite code from URL
      const inviteCode = player1.url().match(/\/lobby\/([A-Z0-9]+)/)?.[1];
      expect(inviteCode).toBeTruthy();

      // Player 2 joins via direct URL (simulating invite link)
      await player2.goto(`/lobby/${inviteCode}`);

      // Player 2 should see the lobby
      await expect(player2.locator('text=Lobby')).toBeVisible();

      // Player 2 enters nickname (if join page exists)
      const nicknameInput = player2.locator('input[type="text"]');
      if (await nicknameInput.isVisible()) {
        await nicknameInput.fill('Player2');
        await player2.click('button[type="submit"]');
        await player2.waitForURL(`/lobby/${inviteCode}`);
      }

      // Both players should see each other in the lobby
      await expect(player1.locator('text=Player1')).toBeVisible();
      await expect(player1.locator('text=Player2')).toBeVisible({ timeout: 10000 });
      await expect(player2.locator('text=Player1')).toBeVisible();
      await expect(player2.locator('text=Player2')).toBeVisible();

      // Player 1 (host) starts the game
      await player1.click('text=Start Game');

      // Both players should be redirected to game page
      await expect(player1).toHaveURL(`/game/${inviteCode}`, { timeout: 10000 });
      await expect(player2).toHaveURL(`/game/${inviteCode}`, { timeout: 10000 });

      // Verify game elements are visible for both players
      await expect(player1.locator('text=/Round 1/')).toBeVisible({ timeout: 15000 });
      await expect(player2.locator('text=/Round 1/')).toBeVisible({ timeout: 15000 });

    } finally {
      await context1.close();
      await context2.close();
    }
  });
});
