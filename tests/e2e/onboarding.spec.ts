import { test, expect } from '@playwright/test';

// Requires a test user to be set up appropriately in the database or mocked
test.describe('User Onboarding Flow', () => {
    
  test.beforeEach(async ({ page }) => {
    // Navigate and assume middleware handles redirect if user status requires it
    await page.goto('/onboarding');
  });

  test('Happy Path: Complete full onboarding', async ({ page }) => {
      // Step 1: Categories
      await expect(page.getByText("Qu'aimez-vous lire ?")).toBeVisible();
      
      // Select 2 categories
      const catButtons = page.getByRole('button').filter({ hasText: /Romantisme|Symbolisme|Spleen/i });
      if (await catButtons.count() >= 2) {
         await catButtons.nth(0).click();
         await catButtons.nth(1).click();
      } else {
         // Fallback if specific names don't match mock DB
         await page.getByRole('button').nth(1).click();
         await page.getByRole('button').nth(2).click();
      }

      await expect(page.getByText('2 / 5 sélectionnés')).toBeVisible();
      await page.getByRole('button', { name: "Suivant" }).click();

      // Step 2: Authors
      await expect(page.getByText('Quelles sont vos plumes favorites ?')).toBeVisible();
      await expect(page).toHaveURL(/.*step=authors/); // Check history API

      const authorButtons = page.getByRole('button').filter({ hasText: /Baudelaire|Hugo/i });
      if (await authorButtons.count() >= 1) {
         await authorButtons.nth(0).click();
      } else {
         await page.getByRole('button').nth(3).click();
      }

      await page.getByRole('button', { name: "Suivant" }).click();

      // Step 3: Reader Preferences
      await expect(page.getByText('Votre expérience de lecture')).toBeVisible();
      await expect(page).toHaveURL(/.*step=reader/);
      
      // Interact with preferences
      await page.getByRole('button', { name: "Moderne" }).click();
      await page.getByRole('button', { name: "Sombre" }).click();

      // Submit
      const submitBtn = page.getByRole('button', { name: "Terminer" });
      await submitBtn.click();
      await expect(submitBtn).toBeDisabled(); // Double submit lock test

      // Should redirect to home
      await expect(page).toHaveURL('/');
  });

  test('Skip Functionality Validation Bypass', async ({ page }) => {
      // User lands on Categories Step 1
      await expect(page.getByText("Qu'aimez-vous lire ?")).toBeVisible();
      
      // Click 'Ignorer' right away without selecting any required inputs
      const skipBtn = page.getByRole('button', { name: "Ignorer" });
      await skipBtn.click();

      // Ensure form status lock
      await expect(skipBtn).toBeDisabled();

      // Should bypass Zod min(1) and redirect to home successfully
      await expect(page).toHaveURL('/');
  });

  test('Browser Back Button Navigation State History', async ({ page }) => {
       // Step 1
       await page.getByRole('button').nth(1).click(); // Select algo
       await page.getByRole('button', { name: "Suivant" }).click();

       // Step 2
       await expect(page).toHaveURL(/.*step=authors/);
       await page.getByRole('button').nth(3).click();
       await page.getByRole('button', { name: "Suivant" }).click();

       // Step 3
       await expect(page).toHaveURL(/.*step=reader/);

       // User hits browser REAL BACK button
       await page.goBack();
       
       // Should be on Step 2 Authors
       await expect(page).toHaveURL(/.*step=authors/);
       await expect(page.getByText('Quelles sont vos plumes favorites ?')).toBeVisible();

       // Native Back again
       await page.goBack();

       // Should be on Step 1 Categories
       await expect(page).toHaveURL(/.*step=categories/);
       await expect(page.getByText("Qu'aimez-vous lire ?")).toBeVisible();
  });

});
