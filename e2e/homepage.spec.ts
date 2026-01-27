import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display homepage with neobrutalist design', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page.locator('h1')).toContainText('EdiGuessr');

    // Check buttons exist
    await expect(page.locator('text=Create Game')).toBeVisible();
    await expect(page.locator('text=Join Game')).toBeVisible();

    // Check features section
    await expect(page.locator('text=Real-time')).toBeVisible();
    await expect(page.locator('text=Edinburgh')).toBeVisible();
  });

  test('should have neobrutalist styling with bold borders', async ({ page }) => {
    await page.goto('/');

    // Check for bold borders (neobrutalist characteristic)
    const container = page.locator('main > div').first();
    const borderWidth = await container.evaluate((el) => {
      return window.getComputedStyle(el).borderWidth;
    });

    // Should have thick borders (4px)
    expect(borderWidth).toBe('4px');
  });

  test('should navigate to create game page', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Create Game');

    await expect(page).toHaveURL('/create');
  });

  test('should navigate to join game page', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Join Game');

    await expect(page).toHaveURL('/join');
  });
});
