# BJOT public search visibility

## Deployment configuration

- Set `SITE_URL` to the preferred public HTTPS origin. The default is `https://www.bjotofficial.com`, from the existing BJOT content configuration. All canonical, social, schema and sitemap URLs use this value. Do not use a Vercel preview address.
- Optionally set `GOOGLE_SITE_VERIFICATION` to the content value of the Google Search Console HTML verification tag. DNS domain verification is also supported by Search Console and does not need this variable.
- Keep `BACKEND_URL` configured: public tutor biographies and other marketing content come from `/public/content` and revalidate every 60 seconds.
- Redirect alternate production domains to the chosen domain in the hosting provider. Keep preview deployments protected or noindexed through the hosting provider.

## What is indexed

The homepage, About / tutor page, UTME preparation guide, testimonials and support page each have their own title, description, canonical URL and sharing metadata. They are listed in `/sitemap.xml`, advertised by `/robots.txt`. Both endpoints and the guide are public in `src/proxy.ts`.

The root layout defaults to `noindex, follow`, keeping login, registration, tests, results and student tools out of search listings. Public editorial pages opt into indexing through `publicMetadata`. Do not block portal HTML in robots.txt: crawlers must be able to see the noindex directive. Authentication remains separate from indexing controls.

About, support and testimonials pages return noindex metadata if their CMS content cannot be loaded. The homepage and study guide retain useful static content during an outage. Never add empty, login-only or nonexistent routes to the sitemap.

The homepage describes the organization and website with JSON-LD. About uses CMS staff names, roles and biographies for Person entities linked to visible tutor anchors. A staff member's `course` is an academic background field, so it is not treated as a subject they teach. No ratings, credentials or score guarantees are invented. JSON-LD escapes `<` before embedding CMS content.

FAQ answers are included in server-rendered HTML even when collapsed. The hero text is initially visible. The guide and homepage overview provide useful content about study plans and choosing tutorials without asserting an unsupported “best in Nigeria” ranking.

## After publishing

1. Check anonymous requests to `/`, `/about-us`, `/utme-preparation-guide`, `/support`, `/testimonials`, `/robots.txt` and `/sitemap.xml`. Confirm canonical URLs use the intended host and sitemap/robots return 200 without login redirects.
2. Verify the production property in Google Search Console and submit `sitemap.xml`. Inspect the homepage, About and guide URLs, then request indexing.
3. Check structured data using Google's Rich Results Test and Schema.org's validator. General Person and EducationalOrganization markup does not guarantee a rich result.
4. Keep tutor names, roles, biographies and contact details accurate in the CMS. Add only genuine qualifications, teaching specialties and public profile links when available. Verify published testimonials and outcome claims.
5. Use Search Console queries and page reports to see which BJOT, tutor and UTME searches bring impressions and clicks. Improve useful subject lessons and guides over time; avoid repetitive keyword pages.

SEO supports discovery and understanding; search engines decide indexing, snippets and rankings. Sitemap order or a priority value cannot force higher placement.

References: [Google SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization), [sitemap submission](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Next.js metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata).
