# src/pages

**Purpose:** Page Object Model (POM) — one class per screen/component.

| File           | What goes here                                                             |
| -------------- | -------------------------------------------------------------------------- |
| `BasePage.ts`  | Base class with shared actions (navigate, wait, screenshots, URL asserts). |
| `LoginPage.ts` | Example page object — **locators and actions together**.                   |

**Guideline:** Every screen gets a class extending `BasePage`. Keep locators inside the page object (never in a separate locators folder) so they can't drift from the actions. Expose semantic actions (`login()`) not raw clicks.
