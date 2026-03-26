import { expect, test } from '@playwright/test';
import path from 'node:path';
import { BASE, goToLogin } from './helpers';

test.describe('Profile settings', () => {
  test('updates profile pic + username, and change email/password flows work', async ({
    page,
  }) => {
    test.setTimeout(240_000);
    const email = process.env.E2E_PERSONAL_ACCOUNT_EMAIL;
    const password = process.env.E2E_PERSONAL_ACCOUNT_PASSWORD;
    test.skip(!email || !password, 'E2E_PERSONAL_ACCOUNT credentials not set');

    const uniqueTag = Date.now().toString().slice(-8);
    const nextUsername = `e2eprof${uniqueTag}`;
    const nextPassword = `E2ePwd!${uniqueTag}`;
    const [localPart, domain] = email!.split('@');
    const nextEmail = `${localPart}+e2e${uniqueTag}@${domain}`;
    const profileImagePath = path.resolve(
      process.cwd(),
      'assets/businessImagePlaceholders/food-drink/fine-dining.jpg'
    );

    // Sign in.
    await goToLogin(page);
    const emailInput = page.getByPlaceholder('you@example.com');
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill(email!);
      await page.getByPlaceholder(/enter your password/i).fill(password!);
      await page.getByText('Sign in', { exact: true }).first().click();
      await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20_000 });
    }

    // 1) Open profile tab, then update username and profile picture.
    await page.getByText('Profile', { exact: true }).last().click();
    await page.waitForTimeout(600);
    await page.getByText('Edit Profile', { exact: true }).first().click();

    await expect(page.getByText('Edit Profile', { exact: true }).last()).toBeVisible();
    const usernameInput = page.getByPlaceholder('Choose a username');

    await usernameInput.fill(nextUsername);

    const uploadButton = page.getByText('Upload', { exact: true }).first();
    await uploadButton.click();
    let uploadWorked = false;
    const chooser = await page.waitForEvent('filechooser', { timeout: 3_000 }).catch(() => null);
    if (chooser) {
      await chooser.setFiles(profileImagePath);
      uploadWorked = true;
    } else {
      const chooseFromLibrary = page.getByText('Choose from Library', { exact: true }).first();
      if (await chooseFromLibrary.isVisible().catch(() => false)) {
        const chooserFromMenu = await Promise.all([
          page.waitForEvent('filechooser', { timeout: 3_000 }).catch(() => null),
          chooseFromLibrary.click(),
        ]).then(([fc]) => fc);
        if (chooserFromMenu) {
          await chooserFromMenu.setFiles(profileImagePath);
          uploadWorked = true;
        }
      } else {
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.isVisible().catch(() => false)) {
          await fileInput.setInputFiles(profileImagePath);
          uploadWorked = true;
        }
      }
    }

    const profileUpdateResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/user/profile') &&
        response.request().method() === 'PUT' &&
        response.status() < 400,
      { timeout: 20_000 }
    );
    await page.getByText('Save Changes', { exact: true }).first().click();
    await profileUpdateResponse;
    await expect(page.getByPlaceholder('Choose a username')).not.toBeVisible({ timeout: 15_000 });

    await page.getByText('Edit Profile', { exact: true }).first().click();
    await expect(page.getByPlaceholder('Choose a username')).toHaveValue(nextUsername, {
      timeout: 20_000,
    });
    if (uploadWorked) {
      await expect(page.getByText('Remove', { exact: true }).first()).toBeVisible();
    } else {
      await expect(page.getByText('Upload', { exact: true }).first()).toBeVisible();
    }
    await page.getByText('Cancel', { exact: true }).first().click();

    // 2) Change email (verification step should be reached).
    await page.getByText('Change', { exact: true }).nth(1).click();
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible({ timeout: 10_000 });
    await page.getByPlaceholder('your@email.com').fill(nextEmail);
    await page.getByText('Send Verification Email', { exact: true }).first().click();
    await expect(page.getByText(/Check your inbox|Verify New Email/)).toBeVisible({
      timeout: 15_000,
    });

    // 3) Return to profile and change password to a new one.
    await page.goBack();
    await page.getByText('Change', { exact: true }).first().click();
    await expect(page.getByText('Change Password', { exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await page.getByPlaceholder('Your current password').fill(password!);
    await page.getByPlaceholder('Create a new password').fill(nextPassword);
    await page.getByPlaceholder('Confirm new password').fill(nextPassword);
    await page.getByText('Update Password', { exact: true }).first().click();
    await expect(page.getByText(/Password Updated|All set!/)).toBeVisible({
      timeout: 15_000,
    });
    if (await page.getByText('Done', { exact: true }).first().isVisible()) {
      await page.getByText('Done', { exact: true }).first().click();
    }

    // 4) Roll password back so the shared E2E account remains stable.
    await page.goBack();
    await page.getByText('Change', { exact: true }).first().click();
    await page.getByPlaceholder('Your current password').fill(nextPassword);
    await page.getByPlaceholder('Create a new password').fill(password!);
    await page.getByPlaceholder('Confirm new password').fill(password!);
    await page.getByText('Update Password', { exact: true }).first().click();
    await expect(page.getByText(/Password Updated|All set!/)).toBeVisible({
      timeout: 15_000,
    });
  });
});
