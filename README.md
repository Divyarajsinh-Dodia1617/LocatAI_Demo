# LocatAI Demo — AI-Powered Self-Healing Test Automation

A Playwright test automation framework demonstrating **AI-powered self-healing locators** using [`@testnexus/locatai`](https://www.npmjs.com/package/@testnexus/locatai). When your CSS selectors break due to UI refactors, LocatAI automatically finds the correct element using AI — no manual maintenance required.

This demo tests the [Sauce Demo](https://www.saucedemo.com) e-commerce site across **three modes**: standard Playwright, AI-only, and self-healing.

---

## Table of Contents

- [Quick Start](#quick-start)
- [How LocatAI Works](#how-locatai-works)
- [The Three Modes](#the-three-modes)
  - [AI-Only Mode](#1-ai-only-mode)
  - [Self-Healing Mode](#2-self-healing-mode)
  - [Mixed Mode](#3-mixed-mode)
- [Configuration & Settings](#configuration--settings)
  - [Environment Variables](#environment-variables)
  - [Fixture Options](#fixture-options)
  - [AI Provider Setup](#ai-provider-setup)
- [Project Structure](#project-structure)
- [Self-Heal Cache](#self-heal-cache)
- [Running Tests](#running-tests)
- [Writing Your Own Tests](#writing-your-own-tests)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install chromium

# 3. Set up environment
cp .env.example .env
# Edit .env with your AI provider credentials

# 4. Run standard tests (no AI)
npm test

# 5. Run LocatAI tests (with AI self-healing)
npm run test:locatai
```

---

## How LocatAI Works

When you call a LocatAI method like `page.locatai.click(locator, 'Submit button')`, the following happens:

```
┌─────────────────────────────────────────────────────────────┐
│  1. TRY ORIGINAL SELECTOR                                   │
│     Attempt the provided locator with a quick 1s timeout     │
│     ✓ Success → execute action, done                         │
│     ✗ Fail → continue to step 2                              │
├─────────────────────────────────────────────────────────────┤
│  2. CHECK CACHE                                              │
│     Look up .self-heal/healed_locators.json for a            │
│     previously healed strategy for this action + URL + desc  │
│     ✓ Cache hit & valid → execute action, done               │
│     ✗ Cache miss or stale → continue to step 3               │
├─────────────────────────────────────────────────────────────┤
│  3. COLLECT DOM CANDIDATES                                   │
│     Gather up to 80 interactive elements from the page       │
│     (buttons, inputs, links, etc.) with their attributes     │
├─────────────────────────────────────────────────────────────┤
│  4. RANK & FILTER                                            │
│     Score candidates by text match, tag type, ARIA roles,    │
│     and test-id presence — keep top 40 (saves ~20-30% tokens)│
├─────────────────────────────────────────────────────────────┤
│  5. ASK AI                                                   │
│     Send the candidates + your description to the AI model   │
│     AI returns up to 3 locator strategies with confidence    │
├─────────────────────────────────────────────────────────────┤
│  6. VALIDATE & EXECUTE                                       │
│     Try each strategy: must match exactly 1 visible element  │
│     First valid strategy wins → cache it → execute action    │
└─────────────────────────────────────────────────────────────┘
```

The healed locator is cached to `.self-heal/healed_locators.json`, so subsequent runs reuse it instantly without calling the AI again.

---

## The Three Modes

### 1. AI-Only Mode

**No selectors at all.** You describe what you want in plain English, and LocatAI finds it purely through AI.

```typescript
// Pass an empty string as the selector — AI does everything
await page.locatai.fill('', 'Username input field', 'standard_user');
await page.locatai.fill('', 'Password input field', 'secret_sauce');
await page.locatai.click('', 'Login button');
```

**When to use:**
- Rapid prototyping when you don't know the selectors
- Testing third-party UIs where you can't control the DOM
- Exploratory testing

**Demo tests:** [`tests/locatai/ai-only.test.ts`](tests/locatai/ai-only.test.ts)

---

### 2. Self-Healing Mode

**Provide a selector + a semantic description.** LocatAI tries the selector first. If it breaks, AI heals it using the description.

```typescript
// The selector #wrong-username-id is intentionally BROKEN
// When it fails, LocatAI uses 'Username input field' to find the real element
await page.locatai.fill(
  page.locator('#wrong-username-id'),
  'Username input field',
  'standard_user'
);

await page.locatai.click(
  page.locator('.nonexistent-login-btn'),
  'Login button'
);
```

**When to use:**
- Existing test suites where selectors go stale after UI refactors
- Long-lived projects with frequent frontend changes
- CI pipelines where broken tests block releases

**What happens in practice:**
1. First run: selector `#wrong-username-id` fails → AI finds `[data-test="username"]` → caches it
2. Second run: cached strategy is reused instantly (no AI call)
3. If UI changes again and cache becomes stale → AI re-heals automatically

**Demo tests:** [`tests/locatai/self-healing.test.ts`](tests/locatai/self-healing.test.ts)

---

### 3. Mixed Mode

**Use standard Playwright for stable selectors and LocatAI only where you need it.** This is the most pragmatic approach for real projects.

```typescript
// Standard Playwright — stable selector, no AI needed
await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

// LocatAI AI-only — third-party widget with unreliable selectors
await page.locatai.click('', 'Add to cart button for Sauce Labs Bike Light');

// LocatAI chainable locator — selector might break
const cartButton = page.locatai.locator(
  '[data-test="wrong-checkout"]',
  'Checkout button'
);
await cartButton.click();
```

**When to use:**
- Gradually adopting LocatAI in an existing test suite
- Mixing stable internal selectors with flaky third-party ones
- Teams that want AI fallback without rewriting all tests

**Demo tests:** [`tests/locatai/mixed-mode.test.ts`](tests/locatai/mixed-mode.test.ts)

---

## Configuration & Settings

### Environment Variables

Create a `.env` file (see `.env.example`):

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SELF_HEAL` | Yes (for AI) | `0` | Set to `1` to enable AI self-healing |
| `AI_SELF_HEAL` | Alternative | — | Set to `true` (same as `SELF_HEAL=1`) |
| `AI_PROVIDER` | Yes (for AI) | `openai` | AI provider: `openai`, `anthropic`, `google`, `local` |
| `AI_API_KEY` | Yes* | — | API key for your provider (*not needed for `local`/Ollama) |
| `AI_MODEL` | No | Provider default | Override the default model |
| `OLLAMA_HOST` | No | `http://127.0.0.1:11434` | Custom Ollama server URL |

### Fixture Options

When creating the LocatAI fixture, you can pass programmatic overrides:

```typescript
import { createLocatAIFixture } from '@testnexus/locatai';

export const test = base.extend({
  ...createLocatAIFixture({
    // Override env vars programmatically
    enabled: true,                // Override SELF_HEAL env var
    provider: 'google',           // Override AI_PROVIDER
    model: 'gemini-2.5-flash',    // Override AI_MODEL
    apiKey: 'your-key',           // Override AI_API_KEY

    // Performance tuning
    maxCandidates: 80,            // Max DOM elements to collect (default: 80)
    maxAiTries: 4,                // Max AI strategies to validate (default: 4)
    timeout: 5000,                // Locator timeout in ms (default: 5000)

    // Cache paths
    cacheFile: '.self-heal/healed_locators.json',   // Healed locator cache
    reportFile: '.self-heal/heal_events.jsonl',      // Event log
  }),
});
```

#### What You Can Tweak

| Setting | Default | Effect of Increasing | Effect of Decreasing |
|---------|---------|---------------------|---------------------|
| `maxCandidates` | `80` | More elements analyzed → better accuracy, higher token cost | Fewer elements → faster, cheaper, may miss elements |
| `maxAiTries` | `4` | More strategies validated → higher success rate | Fewer attempts → faster failure |
| `timeout` | `5000` ms | More time for elements to appear | Faster failure on missing elements |
| Quick timeout | `1000` ms (internal) | — | — (not configurable) |
| Rank filter | Top `40` (internal) | — | — (reduces tokens by ~20-30%) |

### AI Provider Setup

#### OpenAI (Default)

```env
AI_PROVIDER=openai
AI_API_KEY=sk-...
AI_MODEL=gpt-5-nano          # optional, this is the default
SELF_HEAL=1
```

#### Anthropic (Claude)

```env
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-...
AI_MODEL=claude-sonnet-4-20250514   # optional, this is the default
SELF_HEAL=1
```

#### Google (Gemini)

```env
AI_PROVIDER=google
AI_API_KEY=AIza...
AI_MODEL=gemini-2.5-flash    # optional, this is the default
SELF_HEAL=1
```

#### Local LLM (Ollama) — Free, No API Key

```env
AI_PROVIDER=local
AI_MODEL=gemma3:4b            # optional, this is the default
SELF_HEAL=1
# OLLAMA_HOST=http://127.0.0.1:11434   # optional, only if non-default
```

**Recommended Ollama models (performance-tested):**

| Model | Size | Speed | Notes |
|-------|------|-------|-------|
| `llama3.2:3b` | 2.0 GB | Fast | Best overall: fast + accurate |
| `mistral` | 4.1 GB | Slow (~1.4 min) | Most accurate |
| `gemma3:4b` | 3.3 GB | Medium (~53s) | Balanced |

**Provider aliases:** `openai`/`gpt`, `anthropic`/`claude`, `google`/`gemini`, `local`/`ollama` — both forms work.

---

## Project Structure

```
LocatAI_Demo/
├── .env.example                          # Environment template
├── .self-heal/
│   ├── healed_locators.json              # Cached AI-healed locators
│   └── heal_events.jsonl                 # Healing event log
├── playwright.config.ts                  # Playwright config (Chromium, baseURL)
├── tsconfig.json                         # TypeScript config with path aliases
├── src/
│   ├── fixtures/
│   │   ├── test.fixture.ts               # Standard Playwright fixture
│   │   └── locatai.fixture.ts            # LocatAI-enhanced fixture
│   ├── pages/                            # Page Object Model
│   │   ├── base.page.ts                  # Shared header, sidebar, nav
│   │   ├── login.page.ts                 # Login form
│   │   ├── inventory.page.ts             # Product listing
│   │   ├── product-detail.page.ts        # Single product view
│   │   ├── cart.page.ts                  # Shopping cart
│   │   ├── checkout-info.page.ts         # Shipping details form
│   │   ├── checkout-overview.page.ts     # Order summary
│   │   └── checkout-complete.page.ts     # Order confirmation
│   └── utils/
│       ├── constants.ts                  # URLs, sort options
│       └── test-data.ts                  # Users, products, checkout data
├── tests/
│   ├── login.test.ts                     # Standard login tests
│   ├── inventory.test.ts                 # Standard inventory tests
│   ├── cart.test.ts                      # Standard cart tests
│   ├── e2e/
│   │   └── complete-purchase.test.ts     # Full end-to-end purchase
│   └── locatai/
│       ├── ai-only.test.ts              # AI-only mode (no selectors)
│       ├── self-healing.test.ts         # Self-healing mode (broken selectors)
│       └── mixed-mode.test.ts           # Mixed Playwright + LocatAI
```

---

## Self-Heal Cache

The `.self-heal/` directory persists AI-healed locators across test runs.

### `healed_locators.json`

A JSON file mapping `action::url::description` to the winning locator strategy:

```json
{
  "fill::https://www.saucedemo.com/::Username input field": {
    "type": "testid",
    "value": "username",
    "context": "Username input field"
  },
  "click::https://www.saucedemo.com/inventory.html::Shopping cart icon": {
    "type": "css",
    "selector": "a.shopping_cart_link",
    "context": "Shopping cart icon"
  }
}
```

**Strategy types the AI can return:**

| Type | Playwright Equivalent | Example |
|------|----------------------|---------|
| `testid` | `page.getByTestId('value')` | `data-testid="username"` |
| `role` | `page.getByRole('button', { name: 'Submit' })` | Accessible role + name |
| `label` | `page.getByLabel('Email')` | Associated label text |
| `placeholder` | `page.getByPlaceholder('Enter email')` | Input placeholder |
| `text` | `page.getByText('Sign In')` | Visible text content |
| `altText` | `page.getByAltText('Logo')` | Image alt text |
| `title` | `page.getByTitle('Close')` | Title attribute |
| `css` | `page.locator('a.nav-link')` | Any CSS selector |

### `heal_events.jsonl`

A newline-delimited JSON log of every healing event — useful for debugging and analytics:

```json
{
  "ts": "2026-04-12T05:11:44.175Z",
  "action": "fill",
  "contextName": "Username input field",
  "url": "https://www.saucedemo.com/",
  "used": "healed",
  "success": true,
  "confidence": 1,
  "strategy": { "type": "testid", "value": "username" },
  "tokenUsage": { "inputTokens": 887, "outputTokens": 286, "totalTokens": 1173 }
}
```

**Tip:** Delete `healed_locators.json` to force LocatAI to re-heal all locators from scratch. The event log in `heal_events.jsonl` is append-only and safe to truncate.

---

## Running Tests

```bash
# Standard Playwright tests (no AI)
npm test                      # All tests, headless
npm run test:headed           # All tests, visible browser
npm run test:ui               # Playwright interactive UI

# Individual suites
npm run test:login            # Login tests only
npm run test:inventory        # Inventory tests only
npm run test:cart             # Cart tests only
npm run test:e2e              # End-to-end purchase flow

# LocatAI tests (requires SELF_HEAL=1 and AI provider configured)
npm run test:locatai          # All AI-powered tests
npm run test:locatai:headed   # AI tests with visible browser
```

---

## Writing Your Own Tests

### Step 1: Set Up the Fixture

```typescript
// src/fixtures/locatai.fixture.ts
import { test as base } from '@playwright/test';
import { createLocatAIFixture, type LocatAIPage } from '@testnexus/locatai';

export const test = base.extend<{ page: LocatAIPage }>({
  ...createLocatAIFixture(),
});

export { expect } from '@playwright/test';
```

### Step 2: Write Tests

```typescript
import { test, expect } from '../src/fixtures/locatai.fixture';

test('login with AI-only mode', async ({ page }) => {
  await page.goto('/');

  // AI finds elements from descriptions alone
  await page.locatai.fill('', 'Username input', 'standard_user');
  await page.locatai.fill('', 'Password input', 'secret_sauce');
  await page.locatai.click('', 'Login button');

  await expect(page).toHaveURL(/inventory/);
});

test('login with self-healing', async ({ page }) => {
  await page.goto('/');

  // If selectors break, AI heals them
  await page.locatai.fill(
    page.locator('#might-change'),
    'Username input',
    'standard_user'
  );
  await page.locatai.fill(
    page.locator('#might-also-change'),
    'Password input',
    'secret_sauce'
  );
  await page.locatai.click(
    page.locator('.old-login-btn'),
    'Login button'
  );

  await expect(page).toHaveURL(/inventory/);
});
```

### Available LocatAI Methods

```typescript
// Actions
await page.locatai.click(target, 'description');
await page.locatai.fill(target, 'description', 'value');
await page.locatai.selectOption(target, 'description', 'value');
await page.locatai.check(target, 'description');
await page.locatai.uncheck(target, 'description');
await page.locatai.dblclick(target, 'description');
await page.locatai.hover(target, 'description');
await page.locatai.focus(target, 'description');

// Chainable locator
const el = page.locatai.locator('.selector', 'description');
await el.click();
await el.fill('value');

// Force click (skips visibility check)
await page.locatai.click(target, 'description', { force: true });
```

Where `target` is either:
- `''` (empty string) — AI-only mode
- `page.locator('selector')` — self-healing mode

---

## Console Output

When LocatAI heals a locator, you'll see output like this:

```
✦ LocatAI

├─ ⚡ CLICK Submit button
│  ⬡ analyzing 16 elements (filtered from 24)...
│  ↳ received 892 chars
│
├─ ✓ Submit button
│  → getByRole("button", { name: "Submit" })
│  ↑ 1350 input · 180 output · 1530 total tokens
└──────────────────────────────────────────────
```

On subsequent runs with a cache hit:
```
├─ ✓ Submit button (cached)
│  → getByRole("button", { name: "Submit" })
```

---

## License

MIT
