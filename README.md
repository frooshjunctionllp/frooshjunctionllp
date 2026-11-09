This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database and application state

Configure `MONGODB_URI` and `MONGODB_DB` in `.env.local` or your hosting environment. An optional `MONGODB_DIRECT_URI` (a standard `mongodb://` replica-set URI from your database provider) takes precedence when SRV DNS is unreliable. Never commit either connection string. The previous hardcoded direct connection was moved into the ignored local environment file; configure it separately on your host if needed.

The root `AppStateProvider` shares the catalog, customers, sales, workers, offers, orders and current staff session across the customer, admin and staff portals. Form and cart state remain local. Storage writes notify mounted consumers; browser storage events synchronize open tabs. Reads do not trigger network requests. Initial synchronization and order polling deduplicate overlapping requests, and cache revisions protect local writes from older responses.

Menu mutations wait for database confirmation before updating the cache. A failed save keeps the form open and displays the error. Category deletion is blocked while products still refer to it. Empty product/category collections remain empty: normal reads no longer reinsert demo data. New installations should initialize their catalog deliberately using the repository's setup tooling.

Run `npm test` for the storage and persistence regression tests, `npx tsc --noEmit` for type checking, and `npm run build` for production verification.

## Remaining audit findings

- The existing authentication architecture still trusts browser-stored roles, exposes worker PINs to the client, and does not enforce server sessions on management API routes. Server-side authorization, secure session cookies and password hashing require a dedicated authentication migration. The login/state fixes do not make those APIs access-controlled.
- The installed Next.js version reports a known security vulnerability during build/dev startup and should receive a security upgrade before deployment.
- Customer passes, offers and reward vouchers still rely on browser storage for parts of their lifecycle. They do not provide durable synchronization between different devices.
- Customer, staff and sale writes outside menu management still use legacy background persistence; server failures can be missed by those screens.
- Repository-wide ESLint checks still report legacy issues in other screens and scripts. The shared state, request helper, menu management, database connection and storage regression tests are checked separately.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
