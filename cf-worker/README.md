# Sockeyes Archive Media Worker

Resolves `archive.87sockeyes.win/media/<path>` to objects in the `1987sockeyes-private` R2 bucket. Runs behind the same Cloudflare Access policy as the archive site, so only authenticated users can fetch media.

## Deploy (one-time)

1. `npm install -g wrangler` (or use `npx wrangler`)
2. `wrangler login` — authenticates to your Cloudflare account
3. `cd cf-worker && wrangler deploy`
4. In the CF dashboard → Workers & Pages → `sockeyes-archive-media` → Triggers → Custom Domains: add `archive.87sockeyes.win/media/*`
5. In CF Zero Trust → Access → Applications: add `archive.87sockeyes.win/media/*` to the same Access policy as the main archive page

## Verify

After deploy, an authenticated request to `https://archive.87sockeyes.win/media/videos/test.mp4` should either stream the video (if present in R2) or return 404 (if not). An unauthenticated request should be intercepted by Access and redirected to sign-in.
