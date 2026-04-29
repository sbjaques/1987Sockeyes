# Scan editorial-pass — cost debrief (2026-04-25)

What the Anthropic API spend during the 2026-04-25 session went toward, and the architecture that produced it.

## Whose account paid

Your account. The verifier script (`scripts/verify-scan-drafts.mjs`) reads `ANTHROPIC_API_KEY` from `.env.local` at the repo root — the same key the original drafter (`scripts/draft-media-descriptions.mjs`) used to create the descriptions in the first place. `CLAUDE.md` lists it under **Secrets**:

> `CLOUDFLARE_API_TOKEN` · `CLOUDFLARE_ACCOUNT_ID` · `R2_*` · `ANTHROPIC_API_KEY`

The "credit balance is too low" error mid-pass came from your prepaid API balance running out, which is why you topped up at console.anthropic.com → Plans & Billing.

## What the tokens were spent on

The editorial pass on 225 scans flagged `needsReview: true` in [src/data/media.json](../../src/data/media.json). For each scan, the verifier sent **Sonnet 4.6** three things:

1. **System prompt** with project context + the 35-name Sockeyes roster (so the model could distinguish Sockeyes-relevant articles from adjacent-column OCR noise on the same page).
2. **OCR text** for the scan, loaded from `src/content/private/ocr/*.md` matched on `imageId` (capped at ~6KB).
3. **Existing AI-drafted fields** to verify: `descriptionShort`, `descriptionLong`, `attribution.headline`, `attribution.byline`.

Sonnet returned structured JSON via tool-use (`verify_scan_draft`): a verdict (`accurate` / `needs-fix` / `uncertain`), Sockeyes relevance, list of issues, and corrected text where applicable. The applier (`scripts/apply-scan-reviews.mjs`) wrote those corrections into `media.json` with schema-length safety on `descriptionShort` (20-400 chars) and `descriptionLong` (80-2000 chars).

## Spend breakdown — ~$4.23 total

All Sonnet 4.6 (`$3/M` input, `$15/M` output):

| Pass | Items written | Input tokens | Output tokens | Approx cost |
|---|---:|---:|---:|---:|
| Smoke test | 3 | 8,048 | 1,579 | $0.05 |
| Pass 1 — concurrency 8 (hit Sonnet's 30K ITPM rate limit at item ~199) | 78 | 224,874 | 49,761 | $1.42 |
| Pass 2 — concurrency 1, ran until prepaid credit depleted | 34 | 105,793 | 25,475 | $0.70 |
| Pass 3 — after credit top-up, finished the rest | 110 | 335,708 | 70,330 | $2.06 |

**Cache hit rate: 0%.** My system prompt landed just under Sonnet 4.6's 2048-token cache-prefix minimum, so prompt caching never kicked in. If we run another batch, padding the system prompt past that threshold would drop input cost roughly 10× on every call after the first — a free ~$2 saving on the next 225-scan-sized pass.

## Outcome

Of 225 scans verified:
- **41** confirmed accurate (no text change, just `needsReview` flipped to false)
- **179** had corrections applied (typically wrong AI-drafted headlines/bylines, or descriptions that summarized adjacent-column noise instead of the Sockeyes-relevant article)
- **5** left flagged `needsReview: true` — all genuine OCR-fragment cases (truncated mid-word, only tail-end of recap captured, adjacent-column bleed-through). These need human eyes on the actual scan, not Sonnet errors.

The 5 still flagged: `scan-473040181`, `scan-496394992`, `scan-558336879`, `scan-558464326`, `scan-688061731`.

Audit trail at [docs/curation/reviews/](reviews/) (one JSON per scan) + summary at [scan-review-report.json](scan-review-report.json).

## Why Sonnet 4.6 and not Haiku 4.5

Haiku is ~3× cheaper. The reason for using Sonnet:

- Haiku **drafted** the descriptions in the first place ([scripts/draft-media-descriptions.mjs](../../scripts/draft-media-descriptions.mjs)). Verifying Haiku's output with Haiku would overlap blind spots — same training data, same hallucination tendencies.
- Sonnet at ~$0.02/scan was acceptable for catching the things Haiku missed.

Cost trade-off if we use Haiku next time: ~$1.30 vs ~$4.20 for a 225-scan pass. Quality on the first pass showed Sonnet caught real issues (e.g., AI-drafted descriptions about a Stan Czenczek recruitment article missed two fellow BC freshmen the OCR mentioned). Future batches are your call — Haiku is fine for verifying scans that **didn't** come from Haiku, otherwise default to Sonnet.

## Why a separate script and not Claude Code chat

- 225 × ~3K tokens of OCR + drafts wouldn't fit through this conversation cleanly — Claude Code's context window would fill up several times over.
- The script's per-item JSON files (`docs/curation/reviews/<id>.json`) give a durable audit trail. Chat-based review wouldn't produce that artifact.
- Resumability: the script skips files already on disk, so when the rate limit and credit-exhaustion errors interrupted runs, re-running picked up exactly where it left off.
- Concurrency: the script can run 8 requests in parallel (when not rate-limited). Chat is sequential.

## What this didn't cost you

- The original Haiku drafting work that created the 225 descriptions in the first place — that ran in earlier sessions, not 2026-04-25.
- Anything Claude Code did directly in chat (planning, file edits, git operations). That's billed separately on your Claude Code subscription, not the prepaid API key.

## Reusable for future passes

`scripts/verify-scan-drafts.mjs` + `scripts/apply-scan-reviews.mjs` are general-purpose. They process whatever scans currently have `needsReview: true` in `media.json`. To re-run on the 5 stragglers, or on any new private scans added later:

```bash
VERIFY_CONCURRENCY=1 node scripts/verify-scan-drafts.mjs   # writes per-item reviews
node scripts/apply-scan-reviews.mjs                         # applies confident verdicts
```

`VERIFY_CONCURRENCY=1` is the safe default given Sonnet 4.6's 30K ITPM limit at standard tier; bump higher if your tier allows.

`MAX_ITEMS=N` env var caps how many items get reviewed in one run (was used for the 3-item smoke test).
