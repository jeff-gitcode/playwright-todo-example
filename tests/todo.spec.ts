import { test, expect } from '@playwright/test';

/**
 * TodoMVC E2E tests — see https://demo.playwright.dev/todomvc/
 *
 * Demonstrates:
 *  - User-facing locators (getByRole, getByPlaceholder, getByTestId)
 *  - Web-first assertions (auto-retry)
 *  - Auto-waiting (no fixed sleeps)
 *  - Test isolation (fresh app state per test)
 *
 * DOM notes for this implementation:
 *  - Each todo: <li data-testid="todo-item"> with checkbox aria-label="Toggle Todo",
 *    label data-testid="todo-title", delete button aria-label="Delete".
 *  - The footer (counter + filters) is not rendered while the list is empty.
 *  - Use getByTestId('todo-item') for todos — getByRole('listitem') would also
 *    match the footer's filter <li> elements.
 */

const TODO_INPUT = /What needs to be done\?/;

test.beforeEach(async ({ page }) => {
  await page.goto('/todomvc/');
});

test('starts with an empty todo list', async ({ page }) => {
  await expect(page.getByPlaceholder(TODO_INPUT)).toBeVisible();
  await expect(page.getByTestId('todo-item')).toHaveCount(0);
  // Footer (counter + filters) is not rendered when there are no todos.
  await expect(page.getByTestId('todo-count')).toHaveCount(0);
});

test('can add a single todo', async ({ page }) => {
  const input = page.getByPlaceholder(TODO_INPUT);
  await input.fill('Buy groceries');
  await input.press('Enter');

  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByTestId('todo-title')).toHaveText('Buy groceries');
  await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
});

test('can add multiple todos', async ({ page }) => {
  const input = page.getByPlaceholder(TODO_INPUT);

  for (const item of ['Buy groceries', 'Walk the dog', 'Write docs']) {
    await input.fill(item);
    await input.press('Enter');
  }

  await expect(page.getByTestId('todo-item')).toHaveCount(3);
  await expect(page.getByTestId('todo-count')).toHaveText('3 items left');
});

test('can complete a todo', async ({ page }) => {
  const input = page.getByPlaceholder(TODO_INPUT);
  await input.fill('Buy groceries');
  await input.press('Enter');

  await page.getByRole('checkbox', { name: 'Toggle Todo' }).check();

  await expect(page.getByTestId('todo-item')).toHaveClass(/completed/);
  await expect(page.getByTestId('todo-count')).toHaveText('0 items left');
});

test('can filter active vs completed', async ({ page }) => {
  const input = page.getByPlaceholder(TODO_INPUT);

  await input.fill('Active task');
  await input.press('Enter');
  await input.fill('Done task');
  await input.press('Enter');

  // Complete the second item
  await page.getByRole('checkbox', { name: 'Toggle Todo' }).nth(1).check();

  // TodoMVC keeps all items in the DOM and hides filtered-out ones via CSS,
  // so assert visibility rather than count.
  const activeItem = page.getByTestId('todo-item').filter({ hasText: 'Active task' });
  const doneItem = page.getByTestId('todo-item').filter({ hasText: 'Done task' });

  // Filter: Active
  await page.getByRole('link', { name: 'Active' }).click();
  await expect(activeItem).toBeVisible();
  await expect(doneItem).toBeHidden();

  // Filter: Completed
  await page.getByRole('link', { name: 'Completed' }).click();
  await expect(activeItem).toBeHidden();
  await expect(doneItem).toBeVisible();

  // Filter: All
  await page.getByRole('link', { name: 'All' }).click();
  await expect(activeItem).toBeVisible();
  await expect(doneItem).toBeVisible();
});

test('can delete a todo', async ({ page }) => {
  const input = page.getByPlaceholder(TODO_INPUT);
  await input.fill('Temporary task');
  await input.press('Enter');

  // Hover the item to reveal the destroy button, then click it
  const item = page.getByTestId('todo-item');
  await item.hover();
  await item.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByTestId('todo-item')).toHaveCount(0);
});

test('can clear completed todos', async ({ page }) => {
  const input = page.getByPlaceholder(TODO_INPUT);

  await input.fill('Keep me');
  await input.press('Enter');
  await input.fill('Clear me');
  await input.press('Enter');

  // Complete the second item
  await page.getByRole('checkbox', { name: 'Toggle Todo' }).nth(1).check();

  await page.getByRole('button', { name: 'Clear completed' }).click();

  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByTestId('todo-title')).toHaveText('Keep me');
});
