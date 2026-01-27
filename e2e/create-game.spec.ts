import { test, expect } from '@playwright/test';

test.describe('Create Game Flow', () => {
  test('should create a new game and display lobby', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Click Create Game button
    await page.click('text=Create Game');

    // Should be on create page
    await expect(page).toHaveURL(/\/create/);
    await expect(page.locator('h1')).toContainText('Create Game');

    // Fill in nickname
    await page.fill('input[type="text"]', 'TestPlayer');

    // Adjust settings
    await page.fill('input[type="number"]', '1'); // Set 1 round for faster testing

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to lobby with invite code
    await expect(page).toHaveURL(/\/lobby\/[A-Z0-9]+/, { timeout: 10000 });

    // Verify lobby elements
    await expect(page.locator('text=Lobby')).toBeVisible();
    await expect(page.locator('text=TestPlayer')).toBeVisible();
    await expect(page.locator('text=Start Game')).toBeVisible();
  });

  test('should display game settings in lobby', async ({ page }) => {
    // Create game
    await page.goto('/create');
    await page.fill('input[type="text"]', 'SettingsTest');
    await page.fill('input[type="number"]', '3');
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/lobby\//);

    // Verify settings are displayed
    await expect(page.locator('text=/Rounds.*3/')).toBeVisible();
  });
});
