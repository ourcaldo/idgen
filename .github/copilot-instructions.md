# Project Guidelines

## Project Overview
This project is a Vite + Vanilla JavaScript student ID card generator for SMKN 1 NGAWI.
Main capabilities are form-to-card live sync, random student generation from external APIs, QR generation, photo upload, and PNG export.

## Build And Run
- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build production assets: `npm run build`
- Preview production build: `npm run preview`

## Architecture
- Main UI markup is in `index.html`.
- Core behavior is in `src/main.js` (DOM bindings, API calls, QR code, PNG export, reset flow).
- Active styling is in `style.css` (root-level file linked by `index.html`).
- `src/style.css` is Vite starter CSS and is not used by the current page.
- Static assets are in `public/`.
- Dev API proxy rules are in `vite.config.js`.

## Coding Conventions
- Keep UI text in Indonesian unless a task explicitly requests language changes.
- Preserve existing DOM id-based wiring patterns in `src/main.js` (for example `fieldMap` and direct `getElementById` updates).
- Prefer small, localized edits over refactors because many features rely on specific element IDs and event listeners.
- Keep CSS changes in `style.css` and reuse existing CSS variables in `:root`.

## External API Conventions
- Use Vite proxy paths for API calls in browser code:
  - `/api/namefake/...`
  - `/api/freepik/...`
- Do not call external API origins directly from frontend code unless explicitly requested.
- Treat random identity responses as potentially malformed; keep defensive validation in place.

## Known Pitfalls
- `html2canvas` export depends on CORS-related options; keep `useCORS: true` and `allowTaint: true` unless there is a verified alternative.
- PNG filename currently uses NISN; handle empty values safely when changing export behavior.
- Freepik API key is currently hardcoded in source; prefer moving it to `VITE_` env variables if working on security-related tasks.
- There is no automated test setup yet (`package.json` has no `test` script).

## File Priorities For Common Tasks
- UI structure changes: `index.html`
- UI styling changes: `style.css`
- Data flow, API, QR, export, reset logic: `src/main.js`
- Dev server/API proxy issues: `vite.config.js`

## Agent Behaviour

### Context Recovery After Compaction (MANDATORY)

When context is compacted, recover full context BEFORE continuing:

1. Check auto-memory at `~/.claude/projects/c--Users-Administrator-Desktop-indexnow-dev/memory/`
2. Use claude-mem MCP tools (`search`, `timeline`, `get_observations`) if available
3. Read JSONL transcript at `~/.claude/projects/*/[session-id].jsonl` for specific details
4. NEVER rely solely on compacted summary. Do NOT ask the user to repeat information discussed earlier.

### Git Commit Scope Rules

- Commit and push after every change, including small changes.
- Before every push, run `git status` and `git diff` to check for user changes in the working tree.
- Stage files explicitly; do not use broad staging that can include secrets or generated files.
- Exclude `__pycache__/`, `*.pyc`, `node_modules/`, `.next/`, `dist/` unless explicitly asked.
- Use Conventional Commits with proper type, scope, and description.

### Planning Rule

For non-trivial tasks (3+ steps or architectural decisions), write a comprehensive markdown plan with step-by-step tasks, goals, and acceptance criteria. Store plans in `docs/plans/`. Do not execute code until explicitly told to implement.

### Change Log Rules

For every implementation/change, update `docs/log/log-changes.md` before commit/push. Each log entry must include:

- Date time
- Short description
- What you do
- File path that changes

Log entries appended in reverse-chronological order (newest first).

### Verification Before Done

Never mark a task complete without proving it works. Run `pnpm type-check`, check for errors, demonstrate correctness.

### No Lazy Fixes

- Always find and fix root causes. Never apply temporary workarounds or band-aids.
- When fixing a file, check all other files that import from or depend on the changed code. Trace the full impact.
- Senior developer standards: would a staff engineer approve this change?

### Simplicity & Minimal Impact

- Make every change as simple as possible. Minimal code impact.
- Changes touch only what's necessary. Avoid introducing bugs.
- When changing shared code (`packages/*`), verify all consumer apps still work.

### Self-Improvement Loop

After ANY correction from the user, save the lesson to auto-memory (`~/.claude/projects/.../memory/`). Review memory at session start. Never repeat the same mistake.

### Dev-Only Editing Policy

Make ALL code/config/docs changes in the dev repo only. Do NOT edit files directly in production (`/root/indexnow-prod`). Use the Production Promotion Flow to deploy.

### Workflow Orchestration

- Plan Mode: Enter plan mode for any non-trivial task. If something goes sideways, STOP and re-plan immediately.
- Subagent Strategy: Use subagents for research, exploration, and parallel analysis. One task per subagent. Keep main context window clean.
- Autonomous Bug Fixing: When given a bug report, just fix it. Point at logs/errors/failing tests, then resolve. Zero hand-holding required.
- Demand Elegance (Balanced): For non-trivial changes, pause and consider if there's a more elegant approach. Skip for simple, obvious fixes.

### Build + Restart After Code Changes

After changes to app or package code (NOT docs/config-only changes):

1. Build: `pnpm --filter <app> build` (or `pnpm build` for cross-package changes) to verify no errors
2. Restart: `pm2 restart <app-name>` if running on VPS
3. Verify: `pm2 status` to confirm the app is online

### Generated Documents

All generated markdown documents (reports, PRDs, audits, plans) go in the `docs/` folder with descriptive filenames (date prefix when relevant).

### PR Checklist

```bash
pnpm type-check   # No type errors
pnpm lint         # No warnings
pnpm test         # Tests pass
pnpm build        # Build succeeds
```

No new `as any` casts. Conventional commit messages. Changeset added if a package's public API changed.

## Lessons & Principles (Mandatory)

These are hard-won rules from past mistakes. Each is a PRINCIPLE to follow - violating any is a blocking issue.

### Principle 1: External Service Proxy - ZERO Exceptions

Browser/client code must NEVER directly call any external service. Every external service interaction MUST go through `apps/api` route handlers. Direct calls bypass rate limiting, activity logging, IP tracking, security audit trails, and error handling.

How to verify (for EVERY change involving service calls):

1. Grep the frontend codebase for direct SDK calls: `supabase.auth.*`, `supabase.from(`, `paddle.*`, `sendgrid.*`, direct HTTP to external APIs.
2. If found, it's a bug. Route it through an API endpoint.
3. Only acceptable client-side Supabase calls: `onAuthStateChange()`, `getSession()`, `setSession()`, `signOut({ scope: 'local' })`.
4. Middleware Edge functions (server-side) are exempt - they can't call the API (circular dependency).

### Principle 2: Verify Actual Call Chains - Don't Trust Code Is Wired Up

Before modifying or relying on any backend route, VERIFY it has actual callers. Grep for the endpoint constant, the URL pattern, and `fetch(` calls across all apps/packages. Zero callers = dead code. Flag it.

### Principle 3: Database Types Are Manually Managed - Always Update Them

`packages/shared/src/types/database.ts` is the single source of truth. NOT auto-generated. When changing DB schema, always update Row/Insert/Update types and convenience aliases.

### Principle 4: Never Destroy Git History

Never create root commits on repos with existing history. Never force-push without verifying local history includes all remote commits. Before ANY push: `git fetch origin && git log origin/main --oneline -5`. Default to `git pull --rebase origin main`.

### Principle 5: Dead Code Cleanup Must Be Complete

When removing a feature or table, remove ALL traces - types, aliases, schema references, barrel exports, route files, hook files, component references. No orphaned code.

### Principle 6: Await All Critical Operations in Route Handlers

In Next.js Route Handlers, always `await` critical DB operations. Fire-and-forget `.then()` may never resolve because Next.js tears down execution context after response. Use BullMQ for truly non-blocking background work.

### Principle 7: Never Defer Implementation Tasks - Only Defer Live Testing

Complete ALL implementation tasks. Never defer code changes to a separate cleanup PR or later. The only deferrable tasks are those requiring a running deployment (live/E2E testing).

### Principle 8: Commit + Push + Rebuild Is ONE Atomic Action Chain

After committing and pushing, ALWAYS immediately rebuild and restart. Never stop after `git push`. Full chain: `git commit` -> `git push` -> `pnpm build` -> restart apps (PM2 or dev server).

### Principle 9: Load Skills Before Every Task

Before each message AND each to-do item, scan `.claude/skills/` and load relevant skill files. Skills contain domain-specific procedures that prevent common mistakes.

### Principle 10: Generated Documents Go in `/docs` - Never in Project Root

All generated markdown (reports, deep dives, PRDs, plans, audits) MUST be saved to `docs/` folder, not in the project root.

### Principle 11: No Direct Database Access - Use Supabase Client Only

No psql, no SQL editor, no REST API with raw SQL. All DB interactions go through Supabase JS client (`supabaseAdmin` or RLS-scoped clients). Schema changes require the user to run SQL in Supabase dashboard.

### Principle 12: Database Column Values Are Case-Sensitive - Match Stored Casing

When querying DB columns, match exact casing. Do NOT blindly `.toLowerCase()` or `.toUpperCase()` values in `.eq()` filters. Supabase/PostgreSQL `.eq()` is case-sensitive.

### Principle 13: Schema Files First, Then Migration SQL

When making DB changes, TWO things in order:

1. Update master schema files (`database-schema/database_schema.sql`) and matching shared types.
2. Provide migration SQL for user to run in Supabase SQL Editor.

### Principle 14: When a Report Has an Issue Tracker - Update It With Every Fix

Workflow for every fix: fix the code -> update issue status in report -> commit both together.

### Principle 15: Build + Commit + Push After EVERY Single Change - No Exceptions

After ANY code change - even a one-line CSS tweak - immediately: (1) build to verify, (2) `git add + commit + push`.

### Principle 16: Do Exactly What Is Asked - No Assumptions, No Extra Steps

Execute EXACTLY the user's instruction. Do not assume next steps, do not start additional work.

### Principle 17: Pixel-Perfect Attention to Detail

Before committing UI/design changes, inspect EVERY element: proper spacing/padding, buttons visible and clickable, proportions match reference.

### Principle 18: Verify CSS Variables Exist Before Using Them

When converting reference HTML/CSS, NEVER blindly copy CSS variable names. Verify each `var(--name)` exists in shared styles.

### Principle 19: Never Invent a Design Language - Match the Existing Site

Always check existing site's visual language first and match it. Never introduce new color schemes or patterns unless explicitly requested.

### Principle 20: When Unsure, ASK - Never Guess and Change Code

If not 100% certain which element or issue the user means, ASK before making code changes. Never guess.

### Principle 21: Tailwind Pseudo-Class Selectors Break Inside Wrappers

`last:`, `first:`, `odd:`, `even:` apply relative to the PARENT, not grandparent. If a component is wrapped, pseudo-classes evaluate within that wrapper.

### Sanity Data Rule: Never Use `as string` - Always Use `locStr()`

In Sanity mappers, NEVER cast with `as string`. Text fields can be locale objects, so always use locale-safe extraction.

## Design Reference - Marketing Website (apps/web)

### Approved Card Design Pattern: Background Visual + Content Overlay

The approved card style for bento grid feature cards uses a transparent SVG visual as the card background with content layered on top.

### Key CSS/structure:

- Outer: `relative bg-gray-50 rounded-3xl p-6 overflow-hidden`
- SVG: `absolute inset-0 w-full h-full pointer-events-none` with `preserveAspectRatio="none"`
- Gradient fill: `stopOpacity="0.07"` top -> `stopOpacity="0"` bottom
- Stroke line: `opacity="0.2"`, strokeWidth 1.5
- Content: `relative z-10` on top

### Rules:

- NO basic icons (SVG icon-in-a-box, emoji as visuals) - build mini UI mockups or use background visuals
- NO left-border accent cards (`border-l-*` quoted style)
- NO cards-inside-cards - visuals should be part of the card, not nested containers
- Visuals go below text (not side-by-side) for wide cards
- Use `bg-gray-50 rounded-3xl` for bento cards, `bg-white rounded-xl` for inner elements
- Color palette: orange-500 accent, gray-900 text, gray-500 secondary, gray-50 card bg
