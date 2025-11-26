import { test, expect } from '@playwright/test';
import { resetE2EDatabase } from '../helpers/e2e-db-helpers';
import { TEST_LISTS, TEST_WORDS } from '../helpers/test-data';

test.describe('Happy Path - Complete User Journey', () => {
  test.beforeEach(async () => {
    await resetE2EDatabase();
  });

  test('Complete flow: create list, add words, take quiz, verify progress', async ({ page }) => {
    // 1. Visit homepage (empty state)
    await page.goto('/');
    await expect(page.getByText(/no word lists yet/i)).toBeVisible();

    // 2. Create a new word list
    await page.getByRole('button', { name: /create new list/i }).click();
    await page.getByLabel(/list name/i).fill(TEST_LISTS.basicPhrases.name);
    await page.getByLabel(/description/i).fill(TEST_LISTS.basicPhrases.description);
    await page.getByRole('button', { name: /create list/i }).click();

    // Verify list appears on homepage
    await expect(page.getByText(TEST_LISTS.basicPhrases.name)).toBeVisible();

    // 3. Navigate to list details
    await page.getByText(TEST_LISTS.basicPhrases.name).click();
    await expect(page).toHaveURL(/\/lists\/\d+/);
    await expect(page.getByRole('heading', { name: TEST_LISTS.basicPhrases.name })).toBeVisible();

    // 4. Add first word: hallo/hello
    await page.getByRole('button', { name: /add word/i }).click();
    await page.getByLabel(/dutch word/i).fill(TEST_WORDS.greetings[0].dutch);
    await page.getByLabel(/english translation/i).fill(TEST_WORDS.greetings[0].english);
    await page.getByRole('button', { name: /add word/i }).click();

    // Verify word appears in table
    await expect(page.getByText(TEST_WORDS.greetings[0].dutch)).toBeVisible();
    await expect(page.getByText(TEST_WORDS.greetings[0].english)).toBeVisible();

    // 5. Add second word: kat/cat
    await page.getByRole('button', { name: /add word/i }).first().click();
    await page.getByLabel(/dutch word/i).fill(TEST_WORDS.animals[0].dutch);
    await page.getByLabel(/english translation/i).fill(TEST_WORDS.animals[0].english);
    await page.getByRole('button', { name: /add word/i }).click();

    // 6. Add third word: hond/dog
    await page.getByRole('button', { name: /add word/i }).first().click();
    await page.getByLabel(/dutch word/i).fill(TEST_WORDS.animals[1].dutch);
    await page.getByLabel(/english translation/i).fill(TEST_WORDS.animals[1].english);
    await page.getByRole('button', { name: /add word/i }).click();

    // Verify all three words are displayed
    await expect(page.getByText(TEST_WORDS.greetings[0].dutch)).toBeVisible();
    await expect(page.getByText(TEST_WORDS.animals[0].dutch)).toBeVisible();
    await expect(page.getByText(TEST_WORDS.animals[1].dutch)).toBeVisible();

    // 7. Verify statistics show 3 words due for review
    await expect(page.getByText(/3.*due for review/i)).toBeVisible();

    // 8. Start quiz
    await page.getByRole('button', { name: /start quiz/i }).click();
    await expect(page).toHaveURL(/\/quiz$/);

    // 9. Answer first word correctly
    const firstWord = await page.locator('text=/Translate to English/i').locator('..').textContent();

    // Determine correct answer based on displayed word
    let answer = '';
    if (firstWord?.includes('hallo')) answer = 'hello';
    else if (firstWord?.includes('kat')) answer = 'cat';
    else if (firstWord?.includes('hond')) answer = 'dog';

    await page.getByRole('textbox').fill(answer);
    await page.getByRole('button', { name: /check answer/i }).click();

    // Verify correct feedback
    await expect(page.getByText(/correct/i)).toBeVisible();

    // Select difficulty - Easy
    await page.getByRole('button', { name: /easy/i }).click();

    // 10. Answer second word correctly
    const secondWord = await page.locator('text=/Translate to English/i').locator('..').textContent();

    if (secondWord?.includes('hallo')) answer = 'hello';
    else if (secondWord?.includes('kat')) answer = 'cat';
    else if (secondWord?.includes('hond')) answer = 'dog';

    await page.getByRole('textbox').fill(answer);
    await page.getByRole('button', { name: /check answer/i }).click();

    await expect(page.getByText(/correct/i)).toBeVisible();

    // Select difficulty - Medium
    await page.getByRole('button', { name: /medium/i }).click();

    // 11. Answer third word correctly
    const thirdWord = await page.locator('text=/Translate to English/i').locator('..').textContent();

    if (thirdWord?.includes('hallo')) answer = 'hello';
    else if (thirdWord?.includes('kat')) answer = 'cat';
    else if (thirdWord?.includes('hond')) answer = 'dog';

    await page.getByRole('textbox').fill(answer);
    await page.getByRole('button', { name: /check answer/i }).click();

    await expect(page.getByText(/correct/i)).toBeVisible();

    // Select difficulty - Hard
    await page.getByRole('button', { name: /hard/i }).click();

    // 12. Quiz completes and redirects to list
    await expect(page).toHaveURL(/\/lists\/\d+$/);

    // 13. Verify statistics have updated
    // Words should no longer be due (or only the hard one might be due soon)
    await expect(page.getByText(/total.*3/i)).toBeVisible();

    // 14. Return to homepage
    await page.getByRole('button', { name: /back to lists/i }).click();
    await expect(page).toHaveURL('/');

    // Verify list still exists with updated stats
    await expect(page.getByText(TEST_LISTS.basicPhrases.name)).toBeVisible();
  });
});
