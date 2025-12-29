import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*sign-in/);
  });

  // Note: For full auth testing, we would typically mock the Supabase session 
  // or use a test user. Since we are in a setup phase, we'll keep it simple.
});

test.describe('Landing Page', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Geo Tracker/i);
  });
});

