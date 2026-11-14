This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Mobile CSS compatibility

The student portal intentionally uses Tailwind CSS 3.4 with Autoprefixer. Tailwind 4
requires newer browser features (native CSS layers, modern color functions and
registered custom properties) that can leave older phones with missing styles.
Keep the 3.4 version constraint unless the supported devices are reviewed first.

The CSS build targets Chrome/Edge 90+, Firefox 88+, Safari 14.1+ and iOS 14.5+
through `browserslist` in `package.json`. Theme extensions live in
`tailwind.config.js`. Custom `@layer base` rules are flattened at build time;
do not ship native CSS layers or v4-only `@theme` rules to these browsers.
New viewport units should have a `vh` fallback, and essential layout should not
depend on `:has()` selectors.

Run `npm run test:css` to check that the compiled stylesheet stays compatible
and retains the portal's core styles and mobile height fallbacks.

These are CSS compilation targets, not a guarantee that every app feature runs
on those browsers. Next.js 16 officially supports Chrome/Edge/Firefox 111+ and
Safari 16.4+; verify affected devices when testing the complete application.

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
