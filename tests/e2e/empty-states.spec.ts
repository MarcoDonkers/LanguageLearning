import { test, expect } from '@playwright/test';
import { resetE2EDatabase } from '../helpers/e2e-db-helpers';

test.describe('Empty States', () => {
  test.beforeEach(async () => {
    await resetE2EDatabase();
  });

  test('Homepage shows empty state when no lists exist', async ({ page }) => {
    await page.goto('/');

    // Should show empty state message
    await expect(page.getByText(/no word lists yet/i)).toBeVisible();
    await expect(page.getByText(/create your first list/i)).toBeVisible();

    // Should show create button
    await expect(page.getByRole('button', { name: /create new list/i })).toBeVisible();
  });

  test('List detail shows empty state when no words exist', async ({ page }) => {
    await page.goto('/');

    // Create a list
    await page.getByRole('button', { name: /create new list/i }).click();
    await page.getByLabel(/list name/i).fill('Empty List');
    await page.getByRole('button', { name: /create list/i }).click();

    // Navigate to the list
    await page.getByText('Empty List').click();

    // Should show empty words state
    await expect(page.getByText(/no words yet/i)).toBeVisible();
    await expect(page.getByText(/add your first word/i)).toBeVisible();

    // Should show add word button
    await expect(page.getByRole('button', { name: /add word/i })).toBeVisible();
  });

  test('Quiz button hidden when no words due', async ({ page }) => {
    await page.goto('/');

    // Create a list
    await page.getByRole('button', { name: /create new list/i }).click();
    await page.getByLabel(/list name/i).fill('Test List');
    await page.getByRole('button', { name: /create list/i }).click();

    // Navigate to the list (empty)
    await page.getByText('Test List').click();

    // Should not show quiz button when no words
    await expect(page.getByRole('button', { name: /start quiz/i })).not.toBeVisible();

    // Should show 0 due for review
    await expect(page.getByText(/0.*due/i)).toBeVisible();
  });
});
