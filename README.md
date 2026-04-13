# 1987 Richmond Sockeyes Eternal Archive

A permanent, static archive of the 1987 Richmond Sockeyes Centennial Cup championship team.

Live site (once deployed): `https://<your-username>.github.io/1987Sockeyes/`

## Stack
Vite · React · TypeScript · Tailwind CSS · React Router (HashRouter) · Vitest · GitHub Pages

## Develop
```
npm install
npm run dev
```

## Test
```
npm test
```

## Validate data
```
npm run validate:data
```

## Build
```
npm run build
```

## Deployment
Push to `main` → GitHub Actions builds and deploys to Pages automatically. Ensure **Settings → Pages → Source** is set to **GitHub Actions**.

## Data
All content lives in `src/data/*.json`. Each file is schema-validated via AJV in CI.
- `roster.json` — players, coaches, staff (playoff stats)
- `games.json` — playoff game log (Mowat → Doyle → Abbott → Centennial)
- `media.json` — newspaper clippings, souvenir programs, photos

## Adding content
1. Edit the relevant JSON file.
2. Run `npm run validate:data` locally.
3. Commit and push — CI + deploy kick off.

## Source materials
Primary sources: Centennial Cup Souvenir Program (1987), Abbott Cup Souvenir Program (1987), contemporaneous newspaper coverage from The Vancouver Sun, The Province, Richmond Review, Red Deer Advocate, Star Phoenix, Leader Post, Times Colonist, and Nanaimo Daily News.
