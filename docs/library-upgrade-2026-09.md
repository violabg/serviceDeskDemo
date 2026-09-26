# Library upgrade — 2026-09-26

Versions were checked against the npm registry's published release tags.

| Package | Before | After |
| --- | --- | --- |
| Next.js / eslint-config-next | 16.2.12 | 16.3.6 |
| React / React DOM | 19.2.8 | 19.3.0 |
| Neon Auth | 0.4.2-beta | 0.5.0-beta |
| Neon Auth UI | bundled compatibility imports | 0.3.0-beta |
| Neon serverless driver | 1.1.0 | 1.1.0 (already latest) |
| Prisma / client / Neon adapter | 7.9.1 | 7.10.0 |
| shadcn CLI | 4.16.0 | 4.21.0 |
| Base UI | 1.6.0 | 1.8.0 |

## Behavior

- Enabled [Partial Prefetching](https://nextjs.org/docs/app/guides/adopting-partial-prefetching) alongside existing Cache Components. Default Next.js links prefetch a reusable app shell; request-dependent content streams after navigation. Dynamic route parameters already resolve behind Suspense. No explicit full-prefetch links needed migration.
- Added an anonymous dashboard loading skeleton in place of a blank layout fallback. Server authentication and permission checks still run before protected content renders. Actor-scoped caches and mutation invalidation remain intact.
- Audited all 16 installed shadcn components against the current `base-vega` registry with the CLI. Applied the breadcrumb list markup and checkbox/field focus improvements. Preserved equivalent components, the existing theme, local `cn()` utility, and Base UI composition. Updated breadcrumb consumers to avoid nested list items.
- Migrated Neon UI imports and Tailwind styles to `@neondatabase/auth-ui`. Wired its provider to Next.js navigation and router refresh on session changes.
- Removed effect-driven sidebar state updates and subscribed to mobile media queries using `useSyncExternalStore`. A navigation regression test verifies newly active groups reopen while other user toggles persist.
- Next.js 16.3's default build caching and rendering improvements apply automatically. Existing TypeScript 7 CLI checking remains enabled. Additional experimental compiler/offline features were not enabled.

## Dependency compatibility

`.pnpmfile.cjs` supplies TypeScript 6.0.3 to ESLint's compiler-API consumers while the app retains TypeScript 7.0.2. It also gives auth plugins their required Better Call and Zod dependencies. Workspace overrides align Better Auth's core/API-key packages with the 1.6.23 version pinned by Neon Auth and its UI. These address the parser crash and authentication peer mismatches observed during the upgrade.

React type overrides align all dependencies to `@types/react` and `@types/react-dom` 19.3.0. Prisma Studio's chart dependencies had retained a second React type version (19.2.17), which can conflict with experimental `React.Key` augmentations in editor JSX checks. Both the TypeScript 7 CLI and TypeScript 6 compiler-API tooling are checked against the unified dependency graph. If an open editor retains the earlier diagnostic, restart its TypeScript server to reload the installed declarations.

Prisma's generated client was regenerated. No schema migration, database write, cloud resource change, or deployment was performed.

## Verification

- Typecheck and scoped lint passed.
- Full lint passed with one existing React Hook Form `watch()` / React Compiler warning in `new-ticket-form.tsx`.
- Focused navigation/login regression: 4 files, 11 tests passed.
- Full regression: 14 files, 75 tests passed.
- Production build passed; dashboard/admin/ticket routes remain partially prerendered.
- Next.js DevTools MCP compilation diagnostics reported no issues.
- React Doctor reported no findings in the changed scope.
- Browser checks covered the public home page, GitHub sign-in UI, unauthenticated Tickets redirect, and the real Neon Auth session endpoint (HTTP 200).
- In production, holding back the login request still allowed navigation from the home page to `/login` to display its two prefetched skeletons; releasing the request rendered the sign-in UI without browser errors.

## Verification limits

Next.js DevTools MCP was available and used for documentation, diagnostics, and browser automation. Neon and shadcn MCP tools were not exposed in this conversation, including after the Neon availability recheck; their official documentation and CLI were used instead.

No authenticated browser session was available, so authenticated dashboard navigation, GitHub OAuth completion, and database mutations were not exercised. Next.js Instant Insights cannot validate protected page content on an anonymous request that redirects to login; validate these routes with an authorized session. No validation opt-outs were added.

`pnpm peers check` retains an upstream TypeScript 5 peer warning from `@triplit/logger`, a transitive development dependency. The runtime authentication peer mismatches were resolved.
