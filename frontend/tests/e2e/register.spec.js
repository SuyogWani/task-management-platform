import { test, expect } from '@playwright/test';

test('register page can submit a new account', async ({ page }) => {
  await page.route('**/api/auth/register', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'playwright-token', user: { id: 1, name: 'Test user', email: 'test@example.com' } }),
    });
  });

  await page.goto('/register');
  await page.fill('input[type="text"]', 'Test user');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('h1')).toContainText('Dashboard');
});
