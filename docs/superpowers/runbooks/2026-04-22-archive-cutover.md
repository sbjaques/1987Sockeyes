# Archive Public/Private Split — Cutover Runbook

**Purpose:** One-time operational checklist to bring the public/private split live. Executed by the user (Steve) once Plan 1 and Plan 2 are merged and green.

**Prerequisites met before this runbook:**
- `feature/archive-foundation` merged to `main` (Plan 1)
- Plan 2 executed — `media.json` populated, private media in R2, CF Worker written
- All tests green, both builds green

**Estimated duration:** ~1 hour for Phase 0 prep, ~30 min for Phase 3 cutover.

---

## Phase 0 — Infrastructure prep (safe to do anytime before cutover)

### Step 1 — Cloudflare account

If a Cloudflare account does not exist, create one at https://dash.cloudflare.com/sign-up. Note your account ID (dashboard → right sidebar).

### Step 2 — R2 bucket

In the CF dashboard:
1. R2 → Create bucket
2. Name: `1987sockeyes-private`
3. Location: Automatic (Americas)
4. Create

Create an R2 API token:
1. R2 → Manage R2 API Tokens → Create API Token
2. Permissions: Admin Read & Write
3. Specify bucket: `1987sockeyes-private`
4. TTL: Forever (for service use)
5. Save the Access Key ID + Secret Access Key — they are shown ONCE

Set local env vars for Plan 2 scripts:
```bash
export R2_ACCOUNT_ID="<your-account-id>"
export R2_ACCESS_KEY_ID="<token-key>"
export R2_SECRET_ACCESS_KEY="<token-secret>"
```

### Step 3 — Pages project: `sockeyes-public`

In the CF dashboard:
1. Workers & Pages → Create application → Pages → Connect to Git
2. Authorize GitHub for your `sbjaques/1987Sockeyes` repo
3. Project name: `sockeyes-public`
4. Production branch: `main`
5. Build command: **leave empty** — CI from this repo will upload the artifact directly
6. Build output directory: **leave empty**
7. Save

For CI deploys (from `.github/workflows/deploy-public.yml`):
- Create a CF API token at https://dash.cloudflare.com/profile/api-tokens → Create Token → "Edit Cloudflare Workers" template
- Add these as repo secrets on `1987Sockeyes`:
  - `CLOUDFLARE_API_TOKEN` (the token)
  - `CLOUDFLARE_ACCOUNT_ID` (from step 1)

### Step 4 — Pages project: `sockeyes-archive`

In the CF dashboard:
1. Create a new private GitHub repo: `sbjaques/1987Sockeyes-archive-dist`. Empty, no README needed — CI pushes artifacts in.
2. CF dashboard → Workers & Pages → Create application → Pages → Connect to Git
3. Project name: `sockeyes-archive`
4. Select the new `1987Sockeyes-archive-dist` repo
5. Production branch: `main`
6. Build command: **leave empty** (the repo holds pre-built static files)
7. Build output directory: `/` (or leave empty)
8. Save

For CI deploys (from `.github/workflows/deploy-private.yml`):
- Generate a GitHub fine-grained personal access token scoped to `1987Sockeyes-archive-dist` with "Contents: Read and write"
- Add as repo secret on `1987Sockeyes`:
  - `ARCHIVE_DIST_PAT` (the GH PAT)

### Step 5 — Cloudflare Access on the archive site

1. CF dashboard → Zero Trust → Access → Applications → Add an application → Self-hosted
2. Application name: "Sockeyes Archive"
3. Application domain: `archive.87sockeyes.win`
4. Identity providers: One-time PIN (email OTP) — default, no extra config needed
5. Save, then add a policy:
   - Policy name: "Allowlisted emails"
   - Action: Allow
   - Rules: Include → Emails → add your email address (`sbjaques@yahoo.com`)
6. Save the policy

Test: visit `archive.87sockeyes.win` in an incognito window. You should be redirected to a CF Access email-OTP prompt.

### Step 6 — CF Worker for media

1. Install Wrangler: `npm install -g wrangler` (or use `npx wrangler`)
2. From the repo: `cd cf-worker && wrangler deploy`
3. Bind the R2 bucket: the `wrangler.toml` already declares it; confirm in CF dashboard → Workers & Pages → `sockeyes-archive-media` → Settings → Variables and Secrets → R2 Bucket Bindings
4. Route the worker behind the archive domain:
   - CF dashboard → Workers & Pages → `sockeyes-archive-media` → Triggers → Custom Domains
   - Add: `archive.87sockeyes.win/media/*`
5. Apply the SAME Access policy to the worker:
   - Zero Trust → Access → Applications → Add → self-hosted
   - Application domain: `archive.87sockeyes.win/media/*`
   - Apply the same "Allowlisted emails" policy
   - This ensures R2 fetches go through Access, not around it

### Step 7 — DNS

1. Ensure the domain `87sockeyes.win` is on Cloudflare (add as a zone if not already there). Follow CF's nameserver instructions at your registrar.
2. DNS records:
   - `87sockeyes.win` (root) → CNAME → `sockeyes-public.pages.dev` (proxied via CF)
   - `archive.87sockeyes.win` → CNAME → `sockeyes-archive.pages.dev` (proxied via CF)
3. CF handles SSL automatically.

### Step 8 — Verify deploy workflows

- Push a trivial commit to `main` on `1987Sockeyes`
- Watch Actions tab:
  - `Deploy public site to Cloudflare Pages` → green
  - `Deploy private archive artifacts` → green
- `87sockeyes.win` serves the public site
- `archive.87sockeyes.win` prompts CF Access sign-in; after sign-in, serves the private site

If either deploy fails: check that the secrets from Steps 3/4 exist and match.

---

## Phase 3 — Cutover (coordinated ~30 min)

Execute this window when both builds are green and all content is final.

### Pre-cutover checklist (before starting)

- [ ] `main` branch is green (CI + both deploys succeeding)
- [ ] `archive.87sockeyes.win` loads correctly after CF Access sign-in; all private items play/download
- [ ] Local `npm run dev` and `npm run dev:private` both look correct
- [ ] `1987Sockeyes-images` companion repo still public — do NOT flip yet
- [ ] You are currently in the worktree / main and working directory is clean

### Step 1 — Final public-site smoke test

Point a browser at `87sockeyes.win`:
- [ ] Landing loads, SeasonArc + ExploreGrid display
- [ ] "Read the full story →" navigates to `/#/the-season`
- [ ] All 8 Season Story chapters render
- [ ] `/#/the-season/the-run` shows PlayoffTimeline with breadcrumb
- [ ] `/#/hall-of-fame` shows Sequeira photos (full) and locked video cards
- [ ] Click a locked video card → LockedLightbox opens with descriptionLong, sign-in CTA, no URL
- [ ] `/#/vault` shows all public items + locked private items with 🔒 badge
- [ ] Image-ID linkify still resolves to raw JPGs on the still-public `1987Sockeyes-images` repo (sanity check before we flip it)

### Step 2 — Private-site smoke test

Sign in via CF Access at `archive.87sockeyes.win`:
- [ ] Private ribbon shows "Private archive · signed in" above the header
- [ ] All pages load as on public, but private items now open the full lightbox
- [ ] Video cards play media (Worker → R2)
- [ ] Newspaper scan items open the full-res scan
- [ ] Attribution (paper, headline, byline, imageId) visible on private items in captions

### Step 3 — Flip `1987Sockeyes-images` repo from public to private

1. https://github.com/sbjaques/1987Sockeyes-images → Settings → scroll to "Danger Zone" → Change repository visibility → Make private
2. Confirm

**This is the point of no return.** The linkify on the public site stops resolving to raw JPGs the moment this happens. The new public site's linkify (unchanged from Plan 1, still falls back to OCR markdown or newspapers.com) continues working. Private items in media.json with `imageId` attribution would resolve via /media/ through the Worker on the private site; on the public site those stay as locked-lightbox stubs.

### Step 4 — Retire the old GitHub Pages site

Old site: `https://sbjaques.github.io/1987Sockeyes/`. Two options:
- **Leave it.** It'll serve a stale version of the pre-Plan-1 site forever for free. Does no harm but also is stale. Acceptable.
- **Disable it.** GitHub → `1987Sockeyes` → Settings → Pages → Source → Deploy from a branch → set to None. Saves. The `sbjaques.github.io/1987Sockeyes/` URL returns 404.

Recommended: **Disable it.** Once `87sockeyes.win` is live, bookmarks should flow to the new site.

### Step 5 — Post-cutover smoke (repeat Step 1 checks)

- [ ] Public site still works
- [ ] Private site still works
- [ ] Linkify on public site no longer 404s on the old companion-repo JPG URLs (since those items are stripped from public bundle anyway)

### Step 6 — Update DNS TTLs back to longer (optional)

If you lowered DNS TTLs in Phase 0 for a fast cutover, set them back to 1 hour now.

---

## Rollback plan

If something goes critically wrong mid-cutover:

### Rollback to "old site"
1. `1987Sockeyes-images`: re-make public. Linkify on both old and new public sites resumes working.
2. Re-enable GitHub Pages on `1987Sockeyes`: Settings → Pages → Source → `main` / `(root)`.
3. DNS: revert `87sockeyes.win` CNAME to point at wherever it was before (or leave pointing at CF Pages — the public site is still functional).

### Rollback to "new site only" (private tier disabled)
If the private tier has issues but the public tier is fine:
1. Public site remains at `87sockeyes.win` (no change needed).
2. Private tier: disable the Pages deploy workflow OR remove the Access policy to return 404 on archive.87sockeyes.win.

### Rollback the codebase
If the foundation branch needs to be reverted:
1. `git revert feature/archive-foundation..main` on main (or individual commits)
2. Let CI rebuild + redeploy
3. Disable the private deploy workflow

No destructive operations needed for rollback — all pieces are additive on CF side.

---

## Post-cutover maintenance

### Adding a new archive user

1. CF dashboard → Zero Trust → Access → Applications → Sockeyes Archive → Policies → "Allowlisted emails"
2. Add the email
3. Save. No code change, no deploy.

### Adding new media

1. Drop the file into the appropriate Drive staging folder
2. Run `node scripts/inventory-drive-staging.mjs` → inventory updated
3. Run `node scripts/upload-private-media-to-r2.mjs` → uploaded to R2 (if private)
4. Run `node scripts/draft-media-descriptions.mjs` → new draft(s)
5. Review draft(s)
6. Run `node scripts/promote-drafts-to-media-json.mjs` → media.json updated
7. Commit, push. CI builds both tiers, private Worker auto-resolves via R2.

### Takedown (if copyright holder contacts)

1. Delete the R2 object: `wrangler r2 object delete 1987sockeyes-private/scans/<id>.jpg`
2. Remove the media.json entry OR flip `access` to `'public'` and commit a public-safe redacted version
3. Push. CI rebuilds; item disappears (or becomes public) on next deploy.

---

## Open questions to settle during Phase 0 (not blocking cutover)

- **Worker caching.** Currently the Worker sets `cache-control: private, max-age=3600`. Consider whether longer caching or tiered caching via CF is appropriate for the video files.
- **Bandwidth monitoring.** CF R2 egress is billed. Watch the R2 dashboard for unexpected bandwidth spikes; could indicate scraping or a misconfigured Access policy.
- **Phase 2 backlog pages** (Archive Access Request, About, HOF ceremony expansion, etc.) — separate brainstorming after the cutover stabilizes.
