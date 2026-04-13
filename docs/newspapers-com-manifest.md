# newspapers.com Retrieval Manifest — 1987 Richmond Sockeyes

**Purpose:** Shopping list for the newspapers.com subscription. Every article here either fills a gap in box-score data, enriches a player profile, or provides primary-source narrative for the championship run. Work through sections in order — Section 3 (box score priorities) gives the highest data density per article retrieved.

**Master search URL:**
`https://www.newspapers.com/search/#query=%22Richmond+Sockeyes%22&dr_year=1987-1987`

**Per-publication filter URLs (where publication IDs are known):**
- Vancouver Sun (pub 1226): `https://www.newspapers.com/search/#query=%22Richmond+Sockeyes%22&dr_year=1987-1987&publication_id=1226`
- The Province (pub 1236): `https://www.newspapers.com/search/#query=%22Richmond+Sockeyes%22&dr_year=1987-1987&publication_id=1236`
- Star Phoenix / Saskatoon StarPhoenix (pub 738): `https://www.newspapers.com/search/#query=%22Richmond+Sockeyes%22&dr_year=1987-1987&publication_id=738`
- Leader-Post / Regina Leader-Post (pub 726): `https://www.newspapers.com/search/#query=%22Richmond+Sockeyes%22&dr_year=1987-1987&publication_id=726`
- Times Colonist / Victoria (pub 234): `https://www.newspapers.com/search/#query=%22Richmond+Sockeyes%22&dr_year=1987-1987&publication_id=234`
- Red Deer Advocate (pub 3034): `https://www.newspapers.com/search/#query=%22Richmond+Sockeyes%22&dr_year=1987-1987&publication_id=3034`
- Richmond Review: search `https://www.newspapers.com/search/#query=%22Richmond+Sockeyes%22&dr_year=1987-1987` — the Review is a community paper; availability varies by year.
- Nanaimo Daily News: search `https://www.newspapers.com/search/#query=%22Richmond+Sockeyes%22&dr_year=1987-1989`
- Kansas City Star (pub 804): `https://www.newspapers.com/search/#query=%22Richmond+Sockeyes%22&dr_year=1997-1997&publication_id=804`

---

## Section 1 — Already Scanned Locally (OCR Text Needed)

These articles exist as JPEGs in `G:/My Drive/87 Sockeyes/Newspaper Articles/` and are catalogued in `src/data/media.json`. Retrieving them on newspapers.com gives parseable OCR text — goal scorers, assists, times, game stats — that cannot be read reliably from the JPEGs alone.

### Red Deer Advocate

| Media ID | Date | Expected Page | Title / Description | What it provides | Why it matters | Suggested search |
|---|---|---|---|---|---|---|
| `red-deer-advocate-1987-04-09-richmond-vs-red-deer` | 1987-04-09 | B1 or C1 (sports) | Richmond vs. Red Deer, Doyle Cup Game 1 recap | Game narrative, probable box score | First game of the Doyle Cup series; goal scorers for G1 needed | `"Richmond Sockeyes" site:newspapers.com` on Advocate pub 3034, date 1987-04-09 |
| `red-deer-advocate-1987-04-13-richmond-vs-red-deer` | 1987-04-13 | B1/C1 | Richmond vs. Red Deer, mid-series recap | Game narrative | Doyle Cup series coverage, mid-series context | Same pub, date 1987-04-13 |
| `red-deer-advocate-1987-04-18-richmond-vs-red-deer` | 1987-04-18 | B1/C1 | Richmond vs. Red Deer, late-series game report | Game narrative | Doyle Cup near-elimination game context | Same pub, date 1987-04-18 |
| `red-deer-advocate-1987-04-18-richmond-vs-red-deer-box` | 1987-04-18 | B2/C2 (box scores page) | Box score, April 18 Doyle Cup game | Full box: goal scorers + assists + times | Critical for games.json stat extraction for this game | Same pub, date 1987-04-18 |
| `red-deer-advocate-1987-04-19-box-score` | 1987-04-19 | B2/C2 | Box score, April 19 Doyle Cup game | Full box: goal scorers + assists + times | Critical for stat extraction; likely Game 7 or final game of series | Same pub, date 1987-04-19 |

### Nanaimo Daily News

| Media ID | Date | Expected Page | Title / Description | What it provides | Why it matters | Suggested search |
|---|---|---|---|---|---|---|
| `nanaimo-daily-news-1987-02-26-richmond-vs-nanaimo` | 1987-02-26 | C1/D1 | Richmond vs. Nanaimo, regular season | Game recap, probable box score | Regular season context; Nanaimo vs. Richmond rivalry | `"Richmond Sockeyes"` Nanaimo Daily News, Feb 1987 |
| `nanaimo-daily-news-1989-03-21-frank-furlan-quotes` | 1989-03-21 | C1/D1 | Frank Furlan retrospective feature | Player quotes, retrospective narrative | Frank Furlan bio enrichment; retrospective on 1987 title | `"Frank Furlan" "Sockeyes"` Nanaimo Daily News, Mar 1989 |

### Quesnel Cariboo Observer

| Media ID | Date | Expected Page | Title / Description | What it provides | Why it matters | Suggested search |
|---|---|---|---|---|---|---|
| `quesnel-cariboo-observer-1987-04-08-sockeyes` | 1987-04-08 | B1/C1 | Sockeyes in Doyle Cup — Cariboo Observer coverage | Game narrative from Quesnel perspective | Context on Sockeyes from a northern BC paper; likely covered the Mowat Cup series vs. Quesnel | `"Richmond Sockeyes"` Cariboo Observer, Apr 1987 |

### Richmond Review

| Media ID | Date | Expected Page | Title / Description | What it provides | Why it matters | Suggested search |
|---|---|---|---|---|---|---|
| `richmond-review-1987-02-27-sockeyes-photo` | 1987-02-27 | A1 or B1 | Sockeyes team photo with caption | Caption text; roster IDs from caption | Caption may name specific players in photo — roster enrichment | `"Richmond Sockeyes"` Richmond Review, Feb 1987 |
| `richmond-review-1987-05-13-centennial-cup` | 1987-05-13 | A1 (front page) | Centennial Cup championship coverage — main article | Championship narrative, score details, quotes | Primary local record of the title win | `"Richmond Sockeyes" "Centennial Cup"` Richmond Review, May 1987 |
| `richmond-review-1987-05-13-centennial-cup-page-2` | 1987-05-13 | A2/B1 | Centennial Cup coverage, page 2 | Extended narrative, probable box score | Continued championship coverage; stat extraction | Same issue |
| `richmond-review-1987-05-13-centennial-cup-page-3` | 1987-05-13 | A3/B2 | Centennial Cup coverage, page 3 | Extended coverage, stats, team notes | Third page often has statistical wrap-up | Same issue |
| `richmond-review-1987-05-13-banquet` | 1987-05-13 | B1/C1 | Sockeyes championship banquet coverage | Quotes, awards presented, personnel listed | Identifies award recipients and provides character quotes | Same issue |
| `richmond-review-1987-05-13-hervey-romeo` | 1987-05-13 | B1/C1 | Hervey and Romeo feature article | Player profiles, MVP/All-Star context | Matt Hervey (All-Star D) + Frank Romeo (tournament MVP) — bio enrichment for both | Same issue |
| `richmond-review-1987-09-23-sockeyes` | 1987-09-23 | B1/C1 | Sockeyes post-championship follow-up, September 1987 | End-of-season wrap, player departures | Documents which players moved on; season retrospective | `"Richmond Sockeyes"` Richmond Review, Sep 1987 |

### Star Phoenix (Saskatoon)

| Media ID | Date | Expected Page | Title / Description | What it provides | Why it matters | Suggested search |
|---|---|---|---|---|---|---|
| `star-phoenix-1987-05-05-centennial-cup-quote` | 1987-05-05 | D1/E1 | Centennial Cup — player/coach quote feature | Direct quotes; context around round-robin loss to Humboldt | Primary quote material for narrative; coaching strategy context | Pub 738, date 1987-05-05 |
| `star-phoenix-1987-05-06-humboldt-handshake-debate` | 1987-05-06 | D1/E1 | Humboldt handshake controversy | Incident narrative, quotes | Documents a significant moment in the tournament — enriches game narrative | Pub 738, date 1987-05-06 |
| `star-phoenix-1987-05-07-centennial-cup` | 1987-05-07 | D1/E1 | Centennial Cup day 5 coverage | Game recap, probable box score for Richmond vs. Pembroke RR | Box score for round-robin Game 3 (Richmond 4, Pembroke 1, May 7) | Pub 738, date 1987-05-07 |
| `star-phoenix-1987-05-11-centennial-cup` | 1987-05-11 | D1/E1 | Centennial Cup final — main narrative | Championship game story, quotes, context | Primary game narrative for the title game | Pub 738, date 1987-05-11 |
| `star-phoenix-1987-05-11-centennial-cup-box` | 1987-05-11 | D2/E2 | Centennial Cup final box score | Full box: goal scorers, assists, times, goalies | HIGHEST PRIORITY: stat extraction for the final (Richmond 5, Humboldt 2) | Pub 738, date 1987-05-11 |

### Leader-Post (Regina)

| Media ID | Date | Expected Page | Title / Description | What it provides | Why it matters | Suggested search |
|---|---|---|---|---|---|---|
| `leader-post-1987-05-08-centennial-cup` | 1987-05-08 | D1/E1 | Centennial Cup coverage | Game recap and/or box score for May 7 round-robin | Cross-reference box score for Richmond vs. Pembroke (4-1); second source for Centennial stats | Pub 726, date 1987-05-08 |

### The Province (Vancouver)

| Media ID | Date | Expected Page | Title / Description | What it provides | Why it matters | Suggested search |
|---|---|---|---|---|---|---|
| `province-1987-03-25-richmond-vs-kelowna-photo` | 1987-03-25 | D1/E1 | Richmond vs. Kelowna — photo + caption | Photo caption, game context | BCJHL final coverage; player identification from action photo | Pub 1236, date 1987-03-25 |
| `province-1987-04-29-richmond-vs-humboldt-photo` | 1987-04-29 | D1/E1 | Richmond vs. Humboldt Abbott Cup — photo | Photo caption, players identified | Abbott Cup series context; player ID | Pub 1236, date 1987-04-29 |
| `province-1987-04-30-richmond-vs-humboldt` | 1987-04-30 | D1/E1 | Richmond vs. Humboldt Abbott Cup recap | Game narrative, probable box score | Abbott Cup game coverage; stat extraction | Pub 1236, date 1987-04-30 |

### The Vancouver Sun

| Media ID | Date | Expected Page | Title / Description | What it provides | Why it matters | Suggested search |
|---|---|---|---|---|---|---|
| `vansun-1987-03-25-sockeyes-beat-kelowna` | 1987-03-25 | D1/E1 | Sockeyes defeat Kelowna — BCJHL final clincher | Game narrative, score, key plays | Mowat Cup / BCJHL Final clincher story | Pub 1226, date 1987-03-25 |
| `vansun-1987-04-08-photo-vs-red-deer` | 1987-04-08 | D1/E1 | Photo: Sockeyes vs. Red Deer | Photo caption; game context | Doyle Cup series photo; player ID | Pub 1226, date 1987-04-08 |
| `vansun-1987-04-09-red-deer-fan-incident` | 1987-04-09 | D1/E1 | Red Deer fan incident report | Incident narrative, disciplinary context | Documents a notable off-ice incident during Doyle Cup series | Pub 1226, date 1987-04-09 |
| `vansun-1987-04-29-mcdougall-headbutt` | 1987-04-29 | D1/E1 | McDougall headbutt incident | Incident report, player name + context | Documents notable incident involving Sockeyes player McDougall in Abbott Cup final | Pub 1226, date 1987-04-29 |
| `vansun-1987-05-02-sockeyes-profile-page-1` | 1987-05-02 | D1 or special section | Sockeyes team profile ahead of Centennial Cup — Page 1 | Full team profile: roster bios, season narrative | HIGH VALUE: player bios, coach quotes, season context — enriches every player page | Pub 1226, date 1987-05-02 |
| `vansun-1987-05-02-sockeyes-profile-page-2` | 1987-05-02 | D2 or special section | Sockeyes team profile — Page 2 | Continuation: stats, individual profiles | HIGH VALUE: player stats, hometowns, draft statuses, quotes | Pub 1226, date 1987-05-02 |
| `vansun-1987-05-04-centennial-cup` | 1987-05-04 | D1/E1 | Centennial Cup preview/tournament opener coverage | Tournament preview or Game 1 (May 3 vs. Dartmouth) recap | Box score for Richmond 7, Dartmouth 3 opening game | Pub 1226, date 1987-05-04 |
| `vansun-1987-05-07-centennial-cup-vs-humboldt` | 1987-05-07 | D1/E1 | Centennial Cup: Richmond vs. Humboldt round-robin | Game recap for Richmond 1, Humboldt 6 loss on May 5 | Box score for round-robin loss; context around the handshake controversy | Pub 1226, date 1987-05-07 |
| `vansun-1987-05-08-lumber-kings` | 1987-05-08 | D1/E1 | Pembroke Lumber Kings feature ahead of Centennial semi | Opponent profile; preview context | Enriches Pembroke semi-final context; press coverage of the matchup | Pub 1226, date 1987-05-08 |
| `vansun-1987-05-11-centennial-cup` | 1987-05-11 | D1/E1 | Centennial Cup final coverage — Sun main story | Championship narrative, quotes, highlights | Primary championship game story from largest BC paper | Pub 1226, date 1987-05-11 |
| `vansun-1987-05-11-sockeyes-win-centennial-cup` | 1987-05-11 | A1 or D1 | "Sockeyes Win Centennial Cup" — front page / banner | Score, key players named, triumph narrative | First draft of the record; named goal scorers probable | Pub 1226, date 1987-05-11 |

### Times Colonist (Victoria)

| Media ID | Date | Expected Page | Title / Description | What it provides | Why it matters | Suggested search |
|---|---|---|---|---|---|---|
| `times-colonist-1987-05-04-sockeyes-vs-dartmouth` | 1987-05-04 | D1/E1 | Sockeyes vs. Dartmouth Fuel Kids, Centennial Cup RR Game 1 | Recap + probable box score | Box score for Richmond 7, Dartmouth 3; Times Colonist often ran full boxes for BC teams in national tournaments | Pub 234, date 1987-05-04 |
| `times-colonist-1987-05-08-sockeyes-vs-pembroke` | 1987-05-08 | D1/E1 | Sockeyes vs. Pembroke, round-robin recap | Recap for Richmond 4, Pembroke 1 (May 7) | Game narrative; cross-reference for box | Pub 234, date 1987-05-08 |
| `times-colonist-1987-05-08-sockeyes-vs-pembroke-box` | 1987-05-08 | D2/E2 | Box score: Sockeyes vs. Pembroke RR | Full box: goal scorers + assists | Stat extraction for May 7 round-robin game | Pub 234, date 1987-05-08 |

### Kansas City Star

| Media ID | Date | Expected Page | Title / Description | What it provides | Why it matters | Suggested search |
|---|---|---|---|---|---|---|
| `kansas-city-star-1997-04-17-statement-about-richmond` | 1997-04-17 | D1/C1 | 10-year retrospective mention of Richmond Sockeyes | Retrospective narrative; likely mentions Steve Jaques during his Kansas City Blades years | Context connecting the 1987 title to Jaques's IHL career; quote material | Pub 804, date 1997-04-17, query `"Richmond Sockeyes"` |

### Retrospective / Post-1987 Clippings

| Media ID | Date | Expected Page | Title / Description | What it provides | Why it matters | Suggested search |
|---|---|---|---|---|---|---|
| `spokesman-review-1988-10-01-sockeyes` | 1988-10-01 | D1/E1 | Richmond Sockeyes mention — Spokane Spokesman-Review | Retrospective; likely a Spokane hockey column mentioning the 1987 champions | Minor enrichment; cross-border junior hockey coverage context | `"Richmond Sockeyes"` Spokesman-Review, Oct 1988 |

---

## Section 2 — Likely Exists, Not Yet Scanned

These articles almost certainly appeared in print but are not yet in the local JPEG collection. Retrieving from newspapers.com provides both text and image.

### BCJHL Regular Season and Mowat Cup (March 1987)

The Sockeyes swept Kelowna Packers in the BCJHL final and swept Quesnel Millionaires in the Mowat Cup. Daily game coverage appeared in both Vancouver papers and locally.

| Publication | Date Range | Expected Page | Description | What it provides | Why it matters | Search terms |
|---|---|---|---|---|---|---|
| Vancouver Sun | 1987-03-01 to 1987-03-23 | D1/E1 | Day-by-day BCJHL regular season game recaps | Regular season scores, goal scorers | games.json has no regular season entries; these fill the gap | Pub 1226, `"Richmond Sockeyes"`, Mar 1987 |
| The Province | 1987-03-01 to 1987-03-23 | D1/E1 | BCJHL regular season recaps | Second-source scores and scorers | Cross-reference for Van Sun data | Pub 1236, `"Richmond Sockeyes"`, Mar 1987 |
| Richmond Review | 1987-03-01 to 1987-03-23 | B1/C1 | Local BCJHL game coverage | Home-team perspective; local colour | Most detailed local coverage; likely includes attendance, minor stats | `"Richmond Sockeyes"` Richmond Review, Mar 1987 |
| Vancouver Sun | 1987-03-26 to 1987-03-31 | D1/E1 | Mowat Cup vs. Quesnel — game-by-game | Box scores for both Mowat Cup games | Stat extraction for Mowat Cup sweep | Pub 1226, `"Richmond Sockeyes" "Quesnel"`, Mar-Apr 1987 |
| The Province | 1987-03-26 to 1987-03-31 | D1/E1 | Mowat Cup vs. Quesnel | Second source for box scores | Cross-reference | Pub 1236, same query |
| Richmond Review | 1987-04-01 to 1987-04-08 | A1/B1 | Mowat Cup coverage | Local celebration coverage; player quotes | Primary source for community context around the Mowat Cup win | Richmond Review, Apr 1987 |

### Doyle Cup — Missing Games (April 1987)

games.json shows the Doyle Cup as a 4-3 series win over Red Deer Rustlers. We have media for April 9, 13, 18 (x2), and 19. **Games 2, 3, 4, 5, and 6 are likely unscanned.**

| Publication | Date | Expected Page | Description | What it provides | Why it matters | Search terms |
|---|---|---|---|---|---|---|
| Red Deer Advocate | 1987-04-10 | B1/C1 | Doyle Cup Game 2 recap (night after Apr 9) | Box score, narrative | Goal scorers for Game 2 | Pub 3034, date 1987-04-10 |
| Red Deer Advocate | 1987-04-11 or 1987-04-12 | B1/C1 | Doyle Cup Game 3 or 4 recap | Box score, narrative | Goal scorers for missing games | Pub 3034, dates 1987-04-11 to 1987-04-12 |
| Red Deer Advocate | 1987-04-14 to 1987-04-17 | B1/C1 | Doyle Cup Games 4-6 recaps | Box scores, game narratives | All remaining games before the Apr 18-19 conclusion we have | Pub 3034, dates 1987-04-14 through 1987-04-17 |
| Vancouver Sun | 1987-04-10 to 1987-04-18 | D1/E1 | Doyle Cup series coverage, all games | Game recaps; box scores may appear the next day | Secondary source for each game; Van Sun often ran brief boxes | Pub 1226, `"Richmond Sockeyes" "Red Deer"`, Apr 1987 |
| The Province | 1987-04-10 to 1987-04-18 | D1/E1 | Doyle Cup series coverage, all games | Secondary source | Cross-reference box scores | Pub 1236, same query |
| Quesnel Cariboo Observer | 1987-04-09 to 1987-04-20 | B1/C1 | Doyle Cup series — any remaining coverage | Northern BC perspective | Already have Apr 8; more editions may exist | `"Richmond Sockeyes"` Cariboo Observer, Apr 1987 |

### Abbott Cup — Missing Games (April 1987)

games.json records the Abbott Cup series as a final vs. Humboldt Broncos. We have media for only April 29-30 (near the end). **All earlier Abbott Cup games are unscanned.** The Abbott Cup was a best-of-seven Western Canadian Junior A championship hosted in Richmond.

| Publication | Date | Expected Page | Description | What it provides | Why it matters | Search terms |
|---|---|---|---|---|---|---|
| Vancouver Sun | 1987-04-20 to 1987-04-28 | D1/E1 | Abbott Cup Games 1-6 (each played at Richmond Coliseum or Humboldt) | Box scores, game narratives | Complete Abbott Cup box score record for games.json | Pub 1226, `"Richmond Sockeyes" "Humboldt"`, Apr 1987 |
| The Province | 1987-04-20 to 1987-04-28 | D1/E1 | Abbott Cup games 1-6 | Box scores | Cross-reference | Pub 1236, same query |
| Richmond Review | 1987-04-22 to 1987-04-29 | A1/B1 | Abbott Cup local coverage | Home-team perspective; probable box scores | Local paper gives most thorough coverage of home-ice games | Richmond Review, Apr 1987 |
| Humboldt Journal (or Humboldt Broadcaster) | 1987-04-20 to 1987-04-30 | B1/C1 | Abbott Cup from Humboldt's perspective | Away-game box scores; opponent perspective | Humboldt paper would have covered the series thoroughly; may have box scores Sun/Province missed | Search `"Humboldt Broncos" "Richmond"` in Saskatchewan papers, Apr 1987 |
| Star Phoenix | 1987-04-20 to 1987-04-30 | D1/E1 | Abbott Cup series coverage from Saskatoon | Box scores for any games played in Humboldt | Star Phoenix covered Humboldt as regional team | Pub 738, `"Richmond Sockeyes" "Humboldt"`, Apr 1987 |
| Leader-Post | 1987-04-20 to 1987-04-30 | D1/E1 | Abbott Cup from Regina perspective | Series results | Secondary Saskatchewan source | Pub 726, same query |

### Centennial Cup — Missing Dates (May 1987)

Tournament held May 1-10 in Humboldt, SK. We have media for May 4, 5, 6, 7, 8, 11. **Missing: May 1-3 (arrival, preview, opening night) and May 9 (semifinal vs. Pembroke).**

| Publication | Date | Expected Page | Description | What it provides | Why it matters | Search terms |
|---|---|---|---|---|---|---|
| Star Phoenix | 1987-05-01 to 1987-05-03 | D1/E1 | Tournament arrival / preview pieces | Pre-tournament profiles, bracket, team previews | Context and coach/player quotes pre-tournament | Pub 738, `"Richmond Sockeyes"`, May 1-3 1987 |
| Star Phoenix | 1987-05-04 | D1/E1 | Centennial Cup Game 1: Richmond 7, Dartmouth 3 | Full box score and narrative | Box score for RR Game 1 — currently no box score in collection | Pub 738, date 1987-05-04 |
| Star Phoenix | 1987-05-06 | D1/E1 | Centennial Cup: Richmond vs. Humboldt recap (May 5) | Box score for Richmond 1, Humboldt 6 | RR loss box score | Pub 738, date 1987-05-06 (separate from handshake piece already held) |
| Star Phoenix | 1987-05-09 | D1/E1 | Centennial Cup semifinal preview or round-robin wrap | Standings wrap, semifinal matchup announcement | Context for how Richmond got to the semi despite the RR loss | Pub 738, date 1987-05-09 |
| Star Phoenix | 1987-05-10 | D1/E1 | Centennial Cup semifinal: Richmond 9, Pembroke 3 (May 9) | **Full box score for the 9-3 semifinal win** | CRITICAL: games.json shows this game with no sources at all — highest-priority unfound article | Pub 738, date 1987-05-10 |
| Leader-Post | 1987-05-04 to 1987-05-10 | D1/E1 | Centennial Cup daily coverage | Additional box scores; may be fuller than Star Phoenix some days | Second source for tournament stat extraction | Pub 726, `"Richmond Sockeyes"`, May 1987 |
| Vancouver Sun | 1987-05-05 to 1987-05-10 | D1/E1 | Centennial Cup daily coverage | BC team perspective; daily recaps | Primary BC paper covering their team | Pub 1226, `"Richmond Sockeyes"`, May 1987 |
| The Province | 1987-05-05 to 1987-05-10 | D1/E1 | Centennial Cup daily coverage | Second BC source | Cross-reference | Pub 1236, same query |
| Times Colonist | 1987-05-09 to 1987-05-10 | D1/E1 | Centennial Cup semifinal coverage | Box score for May 9 semifinal | Victoria paper tracked BC teams at national tournaments | Pub 234, dates 1987-05-09 to 1987-05-10 |
| Richmond Review | 1987-05-06 to 1987-05-12 | A1/B1 | Tournament week coverage from Richmond | Pre-final/banquet coverage; community angle | Would have run daily updates; local quotes from families, community | `"Richmond Sockeyes"` Richmond Review, May 1987 |

### Opponent City Papers

The Abbott Cup opponents were the **Humboldt Broncos** (SK). The Centennial Cup opponents were **Dartmouth Fuel Kids** (NS) and **Pembroke Lumber Kings** (ON).

| Publication | Date Range | Expected Page | Description | What it provides | Why it matters | Search terms |
|---|---|---|---|---|---|---|
| Humboldt Journal | 1987-04-20 to 1987-05-12 | A1/B1 | Local coverage of Humboldt Broncos vs. Richmond in both Abbott Cup and Centennial Cup | Away-game boxes; opponent's perspective; detailed local stats | Humboldt paper is the most likely source of game-by-game boxes for Humboldt home games | `"Richmond Sockeyes"` OR `"Humboldt Broncos"` + series context |
| Pembroke Daily Observer | 1987-05-07 to 1987-05-10 | B1/C1 | Pembroke Lumber Kings' Centennial Cup coverage | Box scores for RR and semi vs. Richmond | Pembroke paper likely ran full boxes; opponent city for two Richmond games | `"Richmond Sockeyes" "Lumber Kings"` Pembroke paper, May 1987 |
| Dartmouth Herald / Halifax Chronicle-Herald | 1987-05-03 to 1987-05-05 | D1/E1 | Dartmouth Fuel Kids at Centennial Cup | Box score for Richmond 7, Dartmouth 3 | Dartmouth paper is the most likely source of the RR Game 1 full box | `"Richmond Sockeyes" "Fuel Kids"` Nova Scotia papers, May 1987 |

### Anniversary / Retrospective Articles

| Publication | Approx. Date | Description | What it provides | Search terms |
|---|---|---|---|---|
| Richmond Review | 2007 (May) | 20th anniversary piece on the 1987 championship | Quotes from surviving players/coaches; retrospective narrative | `"Richmond Sockeyes" "20th"` OR `"1987"` Richmond Review, May 2007 |
| Richmond Review | 2012 (May) | 25th anniversary | Player whereabouts 25 years on | `"Richmond Sockeyes" "25th"` Richmond Review, May 2012 |
| Richmond Review | 2017 (May) | 30th anniversary | 30-year retrospective; may include team reunion | `"Richmond Sockeyes" "30th"` OR `"1987"` Richmond Review, May 2017 |
| Richmond Review | 2022 (May) | 35th anniversary | Most recent retrospective | `"Richmond Sockeyes" "35th"` Richmond Review, May 2022 |
| Vancouver Sun | 2007, 2012, 2017 | Anniversary features | Broader BC sports retrospective; may include Kurtenbach angle | `"Richmond Sockeyes" "Centennial Cup"` Van Sun, 2007/2012/2017 |
| Nanaimo Daily News | 1989 | Frank Furlan retrospective (already have one; more may exist) | Additional Furlan quotes post-championship | `"Frank Furlan"` Nanaimo Daily News, 1988-1990 |

---

## Section 3 — Box Score Priority Extraction

Ranked by importance for filling stat gaps in `games.json`. All five Centennial Cup games currently have scores but no goal-scorer-level detail. The Doyle Cup has partial coverage. The Abbott Cup is almost entirely missing.

### Tier 1 — Critical (game currently has zero sources in games.json)

**1. Centennial Cup Semifinal: Richmond 9, Pembroke 3 — May 9, 1987**
- Game ID: `1987-05-09-pembroke-semifinal`
- Current sources: **none**
- Best bets: Star Phoenix (pub 738) May 10, 1987 • Leader-Post May 10, 1987 • Times Colonist May 10, 1987 • Pembroke Daily Observer May 10, 1987
- Search: `https://www.newspapers.com/search/#query=%22Richmond+Sockeyes%22&dr_year=1987-1987&publication_id=738` → navigate to May 10

**2. Centennial Cup Round-Robin Game 1: Richmond 7, Dartmouth 3 — May 3, 1987**
- Game ID: `1987-05-03-dartmouth-round-robin`
- Current sources: `times-colonist-1987-05-04-sockeyes-vs-dartmouth` and `vansun-1987-05-04-centennial-cup` (images only, no OCR text yet)
- Best bets: Star Phoenix May 4 (pub 738) • Times Colonist May 4 (pub 234) • Vancouver Sun May 4 (pub 1226) • Halifax Chronicle-Herald May 4
- Priority: OCR-extract the two JPEG articles already held; also check Star Phoenix for their box

### Tier 2 — High Priority (article held locally as JPEG, OCR needed now)

**3. Centennial Cup Final Box Score — May 10, 1987**
- Game ID: `1987-05-10-humboldt-final` (Richmond 5, Humboldt 2)
- Scanned article: `star-phoenix-1987-05-11-centennial-cup-box` — **retrieve OCR text from this article on newspapers.com immediately**
- Second source: Vancouver Sun May 11 (pub 1226) — check their sports section for box
- What to parse: goal scorers, assists, power plays, penalties, goalie stats

**4. Centennial Cup Round-Robin Game 3: Richmond 4, Pembroke 1 — May 7, 1987**
- Game ID: `1987-05-07-pembroke-round-robin`
- Scanned articles: `times-colonist-1987-05-08-sockeyes-vs-pembroke-box` and `leader-post-1987-05-08-centennial-cup`
- Retrieve OCR for both — cross-reference goal scorers

**5. Centennial Cup Round-Robin Game 2: Richmond 1, Humboldt 6 — May 5, 1987**
- Game ID: `1987-05-05-humboldt-round-robin`
- Scanned articles: `star-phoenix-1987-05-05-centennial-cup-quote` and `star-phoenix-1987-05-07-centennial-cup`
- Note: the May 5 quote piece is less likely to have the box than the May 6 edition — search Star Phoenix May 6 specifically for box score

### Tier 3 — Important (Abbott Cup series, currently nearly no box scores)

**6-12. Abbott Cup Games 1-7 vs. Humboldt Broncos (late April 1987)**
- Game ID: `1987-abbott-cup-vs-humboldt-series`
- Best sources in order: Vancouver Sun D1 each morning after the game • The Province D1 • Humboldt Journal B1 (for Humboldt home games) • Star Phoenix D1 • Richmond Review (weekly — may batch several games)
- Search: Pub 1226 and 1236, `"Richmond Sockeyes" "Humboldt"`, dates April 20-30 1987
- Key: determine how many games were in the series and their exact dates first (Abbott Cup program already scanned may list the schedule)

### Tier 4 — Supplementary (Doyle Cup, partially covered)

**13-17. Doyle Cup Games 1-7 vs. Red Deer Rustlers (April 9-19, 1987)**
- Game ID: `1987-doyle-cup-vs-red-deer-series`
- Already have: Apr 9, 13, 18 (2x), 19
- Missing: approximately Games 2, 3, 4, 5, 6 (April 10-17)
- Best source: Red Deer Advocate (pub 3034) daily — check every edition April 10-17
- Secondary: Vancouver Sun (pub 1226) April 10-17

**18-19. Mowat Cup vs. Quesnel Millionaires (late March / early April 1987)**
- Game ID: `1987-mowat-cup-vs-quesnel-series`
- Currently no sources at all
- Best bet: Vancouver Sun and The Province, late March/early April 1987; Quesnel Cariboo Observer (already have Apr 8 — check for late March editions)

**20. BCJHL Final vs. Kelowna Packers (March 1987)**
- Game ID: `1987-03-24-kelowna-bcjhl-clincher`
- Currently have: Van Sun and Province photo for Mar 25; no box score
- Best bet: Vancouver Sun March 25 (pub 1226) sports section — often ran full minor hockey boxes

---

## Section 4 — Player Profile Priority Articles

### Dave Tomlinson (id: `dave-tomlinson`) — F, #11

Top priority. 108-point regular season, captain, BU scholarship, NHL career, now Vancouver Canucks/Seattle Kraken broadcaster.

| Publication | Approx. Date | Description | Search terms |
|---|---|---|---|
| Vancouver Sun | Fall 1987 | Boston University commitment announcement | `"Dave Tomlinson" "Boston University"` Van Sun, Aug-Oct 1987 |
| Vancouver Sun / Province | 1989 | NHL Supplemental Draft — Toronto Maple Leafs selection | `"Dave Tomlinson"` Van Sun or Province, June 1989 |
| Vancouver Sun / Province | 1991-92 | NHL debut with Toronto Maple Leafs | `"Dave Tomlinson"` + `"Maple Leafs"` Van Sun, 1991 |
| Vancouver Sun | 1987-05-02 | Already held: `vansun-1987-05-02-sockeyes-profile-page-1` and page 2 — OCR this first | retrieve OCR now |
| Richmond Review | 1987-05-13 | Championship banquet — likely mentions Tomlinson as captain | retrieve OCR for `richmond-review-1987-05-13-banquet` |

### Matt Hervey (id: `matt-hervey`) — D, #22

Centennial Cup All-Star defenceman; 35 NHL games (Jets, Bruins, Lightning).

| Publication | Approx. Date | Description | Search terms |
|---|---|---|---|
| Winnipeg Free Press | 1988-89 | NHL debut with Winnipeg Jets — game debut notes | `"Matt Hervey"` Winnipeg Free Press, 1988-89 season |
| Boston Globe / Province | 1991-92 | Boston Bruins signing / debut | `"Matt Hervey"` Globe or Province, 1991 |
| Vancouver Sun | 1987-05-02 | Profile piece pages 1-2 (already held) | OCR-extract; Hervey likely named as mid-season pickup | retrieve OCR |
| Richmond Review | 1987-05-13 | `richmond-review-1987-05-13-hervey-romeo` — already scanned, OCR needed | retrieve OCR now — highest-value profile piece for Hervey |
| Whittier Daily News (California) | 1987 | Local Whittier CA coverage of local boy making good | `"Matt Hervey"` Whittier Daily News, 1987 |

### Frank Romeo (id: `frank-romeo`) — G, #29

Tournament MVP at the 1987 Centennial Cup.

| Publication | Approx. Date | Description | Search terms |
|---|---|---|---|
| Star Phoenix | 1987-05-11 | MVP announcement coverage | `"Frank Romeo" "MVP"` Star Phoenix, May 11, 1987 |
| Richmond Review | 1987-05-13 | Hervey/Romeo feature (already held: `richmond-review-1987-05-13-hervey-romeo`) | OCR extract — will have MVP context and Romeo quotes |
| Vancouver Sun | 1987-05-11 or 1987-05-12 | Championship game story likely names Romeo prominently | `"Frank Romeo"` Van Sun, May 11-12 1987 |
| Leader-Post | 1987-05-11 | Tournament MVP named in Regina paper | `"Frank Romeo"` Leader-Post, May 11-12 1987 |

### Orland Kurtenbach (id: `orland-kurtenbach`) — Head Coach

Former Canucks captain; his hiring as Sockeyes coach was a news story. The Canucks Ring of Honour induction in 2010 would have triggered retrospectives mentioning 1987.

| Publication | Approx. Date | Description | Search terms |
|---|---|---|---|
| Vancouver Sun | Fall 1986 | Kurtenbach named head coach of Richmond Sockeyes | `"Orland Kurtenbach" "Richmond"` Van Sun, Aug-Oct 1986 |
| Richmond Review | Fall 1986 | Local coverage of Kurtenbach hiring | `"Kurtenbach"` Richmond Review, Sep-Oct 1986 |
| Vancouver Sun | 1987-05-11 or 1987-05-12 | Championship reaction — Kurtenbach coach quotes | `"Kurtenbach"` Van Sun, May 1987 |
| Vancouver Sun | 1986-87 season preview | BCJHL season preview — likely features Kurtenbach coaching angle | `"Orland Kurtenbach" "Sockeyes"` Van Sun, Oct-Nov 1986 |
| Vancouver Sun | October 2010 | Canucks Ring of Honour induction — retrospective on career including 1987 coaching | `"Orland Kurtenbach" "Ring of Honour"` Van Sun, Oct 2010 |

### Jason Phillips (id: `jason-phillips`) — F, #9

Tournament Top Scorer and Most Sportsmanlike; selected to All-Star team.

| Publication | Approx. Date | Description | Search terms |
|---|---|---|---|
| Star Phoenix | 1987-05-11 | Tournament awards announcement — Top Scorer, Sportsmanlike | `"Jason Phillips"` Star Phoenix, May 11-12 1987 |
| Vancouver Sun | 1987-05-12 | Awards wrap-up | `"Jason Phillips"` Van Sun, May 12 1987 |
| Richmond Review | 1987-05-13 | Championship coverage likely names Phillips prominently | retrieve OCR for centennial cup pieces |

### Mike McCormick (id: `mike-mccormick`) — D, #6

50 points in 51 games from the blue line; moved to UND (NCAA WCHA).

| Publication | Approx. Date | Description | Search terms |
|---|---|---|---|
| Vancouver Sun | Fall 1987 | University of North Dakota commitment | `"Mike McCormick" "North Dakota"` Van Sun, Aug-Oct 1987 |
| Vancouver Sun | 1987-05-02 | May 2 profile piece (already held) | OCR extract — McCormick likely profiled given offensive output |

---

## Section 5 — Extraction Protocol

Follow these steps for each article retrieved on newspapers.com:

1. Search for the article using the publication filter URL and date range provided above.
2. Click through to the specific page image.
3. Use the newspapers.com built-in **Clip** tool (scissors icon) to select the article region.
4. Choose **"Copy text"** or **"Download text"** to get the OCR-generated plain text.
5. Note the full image URL from your browser address bar (format: `https://www.newspapers.com/image/XXXXXXXXX/`).
6. Save as a new file at this path: `docs/extractions/<media-id-or-slug>.md`

**File format:**

```md
# <Headline as printed>
**Publication:** Vancouver Sun
**Date:** 1987-05-11
**Page:** D1
**URL:** https://www.newspapers.com/image/XXXXXXXXX/

## Text
<paste OCR'd text exactly as returned — do not clean up yet>

## Notes
<your observations: box score found? player names legible? any obvious OCR errors to flag?>
```

**Naming convention for slugs not already in media.json:**
- Format: `<publication-short>-<YYYY-MM-DD>-<2-3 word descriptor>`
- Examples: `star-phoenix-1987-05-10-semi-box`, `red-deer-advocate-1987-04-11-doyle-g2`

7. Commit each file individually or in batches by game/series:

```
git add docs/extractions/
git commit -m "docs: add OCR extraction — <series> <date range>"
```

**Parsing notes for box scores:**
- Look for lines with format: `<time> <player> (assist1, assist2)` — these are goal lines
- Power play goals often noted as `(pp)` or `power play`; shorthanded as `(sh)` or `short-handed`
- Goalie lines: `<name> W/L <shots> <saves>`
- If OCR garbles a name, leave `[?]` inline and flag in Notes — do not guess

**After extracting, update games.json:**
- Add the extraction file slug to the `sources` array for the matching game
- Add goal scorer data to `highlights` array pending a proper stats schema addition

---

*Manifest generated 2026-04-12. Source data: `src/data/media.json` (47 entries), `src/data/games.json` (9 game records), `src/data/roster.json` (26 personnel). All article dates and page references are best estimates based on publication conventions of the era — verify against actual issues.*
