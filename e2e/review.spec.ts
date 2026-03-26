import path from 'path';
import { test, expect } from '@playwright/test';
import { goToLogin } from './helpers';

const IMAGE_PATH = path.resolve(
  __dirname,
  '..',
  'assets',
  'businessImagePlaceholders',
  'food-drink',
  'fine-dining.jpg'
);
test.describe('Write Review', () => {
  test('submit a review with image for a business', async ({ page }) => {
    test.setTimeout(90_000);

    const email = process.env.E2E_PERSONAL_ACCOUNT_EMAIL;
    const password = process.env.E2E_PERSONAL_ACCOUNT_PASSWORD;
    test.skip(!email || !password, 'E2E_PERSONAL_ACCOUNT credentials not set');

    // Log in
    await goToLogin(page);
    await page.getByPlaceholder('you@example.com').fill(email!);
    await page.getByPlaceholder(/enter your password/i).fill(password!);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 15_000,
    });

    // Navigate to home and find a business link
    await page.goto('https://sayso.co.za/home');
    await page.waitForLoadState('networkidle');

    const businessLink = page.locator('a[href^="/business/"]').first();
    await expect(businessLink).toBeVisible({ timeout: 10_000 });
    const href = await businessLink.getAttribute('href');
    expect(href).toBeTruthy();

    // Navigate to the review page for this business
    const reviewUrl = `https://sayso.co.za${href}/review`;
    await page.goto(reviewUrl);
    await page.waitForLoadState('networkidle');

    // Wait for the review form to load
    await expect(
      page.getByText('How was your experience?')
    ).toBeVisible({ timeout: 15_000 });

    // Select 4-star rating
    await page.getByRole('button', { name: 'Rate 4 stars' }).click();
    await expect(page.getByText('Great', { exact: true })).toBeVisible();

    // Fill the review text (minimum 10 characters)
    const reviewTextarea = page.getByPlaceholder(/share your experience/i);
    if (await reviewTextarea.isVisible()) {
      await reviewTextarea.fill(
        'This place has an amazing atmosphere and great service. Highly recommend visiting!'
      );
    } else {
      const textarea = page.locator('textarea').first();
      await textarea.fill(
        'This place has an amazing atmosphere and great service. Highly recommend visiting!'
      );
    }

    // Scroll down to make the photo section visible
    await page.getByText('Photos').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Upload an image via the hidden file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(IMAGE_PATH);

    // Verify image preview appeared and counter updated
    await expect(page.getByText('1/2 added')).toBeVisible({ timeout: 5_000 });

    // Submit the review
    const submitButton = page.getByRole('button', { name: /submit review/i });
    await expect(submitButton).toBeEnabled({ timeout: 5_000 });
    await submitButton.click();

    // Wait for the submission to complete — the button changes to "Submitting..."
    await expect(page.getByText('Submitting...')).toBeVisible({ timeout: 5_000 });

    // The web app uses window.location.href after a 1.5s delay post-success
    // Wait for redirect back to business detail page
    await page.waitForURL(
      (url) => !url.pathname.includes('/review'),
      { timeout: 45_000 }
    );
    await expect(page).toHaveURL(/\/business\//);
  });
});
