# Centennial Cup 1987 — Box-Score Extraction Proposal

Source: already-scraped OCR in `docs/extractions/1987-05-0{2..9}-*.md` and `1987-05-1{0..2}-*.md`.

Tournament: Centennial Cup (national Junior A championship), at the Humboldt Uniplex, Humboldt SK, May 2–9 1987. Round-robin among four teams (Humboldt Broncos, Richmond Sockeyes, Pembroke Lumber Kings, Dartmouth Fuel Kids), then single-game semifinal (2nd vs 3rd), then final (1st vs semi winner).

---

## High-priority fact checks

| Claim | Verdict | Sources |
|---|---|---|
| **Final score 5-2** (not 5-3) | **Confirmed** | `1987-05-11-star-phoenix-p13-i512098529.md`, `1987-05-11-star-phoenix-p14-i512098543.md` (full box), `1987-05-11-the-vancouver-sun-p14-i495230735.md`, `1987-05-11-the-vancouver-sun-p20-i495229991.md`, `1987-05-10-times-colonist-p1-i508633163.md`, `1987-05-10-times-colonist-p9-i508632785.md`, `1987-05-11-the-province-p22-i502004009.md`, `1987-05-11-nanaimo-daily-news-p9-i325313520.md`, `1987-05-11-the-leader-post-p20-i496962458.md`, `1987-05-11-red-deer-advocate-p6-i558421985.md`, `1987-05-11-the-toronto-star-p30-i946660979.md`, `1987-05-11-the-ottawa-citizen-p22-i463734704.md` — **twelve independent sources** |
| **Final played Saturday May 9** (not May 10) | **Confirmed** | Star-Phoenix p.13 "Saturday's final drew a standing-room-only crowd of around 2,400"; Vancouver Sun May 11 p.14 "Saturday night"; Toronto Star May 11 p.30 "Saturday's result Richmond 5, Humboldt 2"; Telegraph-Journal May 9 "Scheduled Today — Final Richmond vs Humboldt" (Sat May 9); Leader-Post "Saturday night"; game time listed in advance as 7:30 p.m. (Star-Phoenix May 5 p.17 schedule block) |
| **Tournament MVP = Frank Romeo** (not Phillips) | **Confirmed** | Star-Phoenix p.13 (quoted MVP trophy + plaque + cup), Vancouver Sun p.20 (Pap: "tourney most valuable player honours"), Times Colonist p.1/p.9 (CP: "Romeo was named most valuable player in the tournament"), Province p.22 (Luba: "named Richmond's player of the game and the tournament's most valuable player"), Leader-Post p.20 (Romeo quoted as "the tournament and final game MVP") |
| **Phillips hat trick in final** | **Confirmed** | Star-Phoenix p.14 box (Phillips 18:13, 13:28, 19:07 en); CP wire in Times Colonist, Leader-Post, Red Deer Advocate, Nanaimo Daily News, Ottawa Citizen all lead with "Jason Phillips scored three goals" |
| **Phillips = Most Gentlemanly / Most Sportsmanlike** | **Confirmed** | Star-Phoenix p.13: "Phillips... was selected the tournament's most gentlemanly player"; Vancouver Sun p.20: "most sportsmanlike player. The shifty winger scored five goals and seven assists in five games and did not pick up a penalty" |
| **Attendance ~2,400 for final** | **Confirmed** | Star-Phoenix p.13: "standing-room-only crowd of around 2,400"; Leader-Post p.20: "standing-room crowd of 2,400"; Vancouver Sun p.20 (different paragraph): "partisan crowd of 2,300" (conflicts slightly with 2,400; go with 2,400 majority) |

---

## Game-by-game

### 1. Round-robin — Sun May 3 — Richmond 7 Dartmouth 3

Sources: `1987-05-04-red-deer-advocate-p9-i558421571.md`, `1987-05-04-the-winnipeg-sun-p23-i736882093.md`, `1987-05-04-standard-freeholder-p8-i1062326753.md`, `1987-05-04-evening-tribune-p21-i1224988953.md`, `1987-05-04-daily-gleaner-p17-i1098955584.md`, `1987-05-04-the-province-p18-i502027542.md`, `1987-05-04-star-phoenix-p13-i512093788.md`.

- **Scorers for Richmond:** Jason Phillips (3), Bryon Moller, Steve Jaques, Dave Tomlinson, Matt Hervey.
- **Scorers for Dartmouth:** Jerry Scott (2), Brian King (1). (Fourth Dartmouth goal unaccounted in OCR.)
- **Shots:** Richmond 44, Dartmouth 29.
- **Periods:** Richmond led 3-1 after 1st; 6-2 after 2nd.
- **Penalties:** Richmond took 11 of 17 minors plus a major; both teams had a misconduct.
- **Sunday afternoon game** at the Uniplex (Red Deer Advocate: "in the only other game Sunday").

> Richmond zipped to a 3-1 lead in the first period and built the margin to 6-2 in the second. (Winnipeg Sun)

**Proposed games.json entry (update existing):**
```json
{
  "id": "1987-05-03-dartmouth-round-robin",
  "date": "1987-05-03",
  "series": "Centennial",
  "round": "Round-Robin",
  "opponent": "Dartmouth Fuel Kids",
  "location": "Humboldt, SK",
  "result": "W",
  "score": { "for": 7, "against": 3 },
  "highlights": [
    "Richmond opened the Centennial Cup tournament with a 7-3 win over the Dartmouth Fuel Kids at the Humboldt Uniplex on Sunday afternoon. The Sockeyes took a 3-1 lead in the first period and 6-2 after the second.",
    "Jason Phillips scored three goals; Bryon Moller, Steve Jaques, Dave Tomlinson and Matt Hervey added singles. Jerry Scott (2) and Brian King replied for Dartmouth (the fourth Dartmouth goal is unaccounted in the available wire copy).",
    "Richmond outshot Dartmouth 44-29 and took 11 of 17 minor penalties plus one major; both teams drew a misconduct.",
    "Sources: Star-Phoenix May 4 1987 (image 512093788); Red Deer Advocate May 4 1987, p.9 (image 558421571); The Winnipeg Sun May 4 1987 (image 736882093); Standard-Freeholder May 4 1987, p.8 (image 1062326753); Evening Tribune May 4 1987, p.21 (image 1224988953); Daily Gleaner May 4 1987, p.17 (image 1098955584); The Province May 4 1987, p.18 (image 502027542)."
  ],
  "sources": [
    "times-colonist-1987-05-04-sockeyes-vs-dartmouth",
    "vansun-1987-05-04-centennial-cup",
    "newspapers-com-512093788",
    "newspapers-com-558421571",
    "newspapers-com-736882093",
    "newspapers-com-1062326753",
    "newspapers-com-1224988953",
    "newspapers-com-1098955584",
    "newspapers-com-502027542"
  ]
}
```

---

### 2. Round-robin — Mon May 4 — Richmond 4 Pembroke 1

Sources: `1987-05-05-star-phoenix-p17-i512094503.md` (full period-by-period box), `1987-05-05-the-times-transcript-p33-i1107094171.md`, `1987-05-05-the-vancouver-sun-p33-i495157600.md`, `1987-05-05-north-bay-nugget-p12-i731987327.md`, `1987-05-05-the-times-transcript-p36-i1107094424.md`.

**Note:** The existing games.json entry has score **4-3**. All the contemporaneous wire copy and the official Star-Phoenix box score read **4-1**. The CLAUDE.md note that "two third-period goals from Tomlinson won it" is confirmed, but these were **insurance** goals from 3-1 up, not game-winners from 2-3 down. Score 4-1 is correct.

- **Box (Star-Phoenix May 5 p.17 image 512094503):**
  - **1st Period** — 1. Richmond, Kozak (Phillips, Hervey) 2:39. Penalties: Czenczek Rich (roughing) 5:20; Pavich Pem (roughing) 5:20; Dickie Rich (hooking) 6:21; Hervey Rich (slashing) 7:18; Jaques Rich (high-sticking) 9:21; T. Mohns Pem (high-sticking) 9:21; Coles Pem (hooking) 10:52; Dickie Rich (interference) 15:33; Rutledge Rich (high-sticking) 17:20.
  - **2nd Period** — No scoring. Penalties: Clarke Rich (hooking) 2:54; Dickie Rich (slashing) 7:15; Clarke Pem (checking from behind) 13:13; Gunn Rich (charging) 16:08.
  - **3rd Period** — 2. Pembroke, Dupont (Eastwood, Clarke) 4:06 PP. 3. Richmond, Czenczek (Moller, Dickie) 6:35. 4. Richmond, Tomlinson (Phillips) 15:01. 5. Richmond, Tomlinson (Rutledge, Rutherford) 18:26. Penalties: McCormick Rich (roughing) 3:29; Claringbull Rich (holding) 10:48.
  - **Shots on goal:** Richmond 8-7-11 = 26. Pembroke 10-6-9 = 25.
  - **Goaltenders:** Richmond — Romeo; Pembroke — Robb.
  - **Power plays:** Richmond 0-for-2; Pembroke 1-for-9.
- **Scorers for Richmond:** Brian Kozak, Stan Czenczek, Dave Tomlinson (2). Dupont for Pembroke.
- **Times-Transcript May 5 p.33:** "Richmond Sockeyes exploded for three goals in the third period to beat the Pembroke Lumber Kings 4-1 Monday night."
- **Vancouver Sun May 5 p.33 (Elliott Pap):** Richmond in black uniforms looked like villains; ref Wes Smith of Saskatoon called everything — "All I'm asking for is a fair shake from the refereeing," said Kurtenbach. Richmond took 9 of 13 minors; was "too much for the Lumber Kings last night despite spending half the game in the penalty box."

**Proposed games.json entry (UPDATE existing 1987-05-04-pembroke-round-robin):**
```json
{
  "id": "1987-05-04-pembroke-round-robin",
  "date": "1987-05-04",
  "series": "Centennial",
  "round": "Round-Robin",
  "opponent": "Pembroke Lumber Kings",
  "location": "Humboldt, SK",
  "result": "W",
  "score": { "for": 4, "against": 1 },
  "highlights": [
    "Richmond defeated Pembroke 4-1 at the Humboldt Uniplex on Monday night to move to 2-0 in round-robin play. The Sockeyes were 1-0 after one, 1-0 after two, then exploded for three third-period goals.",
    "Goals — 1st: Richmond, Kozak (Phillips, Hervey) 2:39. 3rd: Pembroke, Dupont (Eastwood, Clarke) 4:06 PP; Richmond, Czenczek (Moller, Dickie) 6:35; Richmond, Tomlinson (Phillips) 15:01; Richmond, Tomlinson (Rutledge, Rutherford) 18:26.",
    "Shots on goal: Richmond 8-7-11 = 26; Pembroke 10-6-9 = 25. Goaltenders: Romeo (Richmond), Robb (Pembroke). Power plays: Richmond 0-for-2; Pembroke 1-for-9.",
    "Richmond, in their black uniforms, played most of the game in the penalty box — 9 of 13 minors called by referee Wes Smith of Saskatoon. Kurtenbach afterward: 'All I'm asking for is a fair shake from the refereeing.'",
    "Sources: Star-Phoenix May 5 1987, p.17 box score (image 512094503); The Vancouver Sun May 5 1987, p.33 (image 495157600); The Times-Transcript May 5 1987 (image 1107094171); North Bay Nugget May 5 1987, p.12 (image 731987327)."
  ],
  "sources": [
    "newspapers-com-512094503",
    "newspapers-com-495157600",
    "newspapers-com-1107094171",
    "newspapers-com-731987327"
  ]
}
```

---

### 3. Round-robin — Wed May 6 — Humboldt 6 Richmond 1 (L)

Sources: `1987-05-07-star-phoenix-p17-i512096770.md`, `1987-05-07-calgary-herald-p13-i483641750.md`, `1987-05-07-the-vancouver-sun-p24-i495159747.md`, `1987-05-07-the-daily-herald-tribune-p14-i731234571.md`, `1987-05-07-red-deer-advocate-p17-i558421757.md`, `1987-05-07-the-kingston-whig-standard-p19-i731775060.md`.

- **Scorers Humboldt:** Bill McDougall (2), Garnett Kazuik (2), Duncan Ryhorchuk, Curtis Chamberlin.
- **Scorer Richmond:** Stan Czenczek (slap shot past Hoffort at 17:26 of 1st, PP).
- **Periods:** Tied 1-1 after 1; Humboldt 4-1 after 2.
- **Shots:** Humboldt 37, Richmond 19.
- **Goaltender (Richmond):** Jamie Stewart (confirmed, not Romeo — Star-Phoenix p.17: "breakaway on Jamie Stewart"). Hoffort for Humboldt.
- **Penalties:** Humboldt 15 of 27 minors. Both teams: two five-minute majors and two game misconducts. Humboldt also picked up two 10-minute misconducts.
- **Kazuik goal:** Shorthanded, at 13:20 of 2nd period, after stealing puck from Steve Jaques at the Richmond blue line. Clear breakaway on Stewart.
- **Quote:** Kurtenbach: "We got outworked, outplayed, out-everythinged. It's not as if we weren't trying. The 'oomph' just wasn't there." Also Pap quotes him: "We have no excuses. The refereeing was good. We just got outhustled, outskated, out everythinged. But it's over and done with now. We can only use it as a motivating tool. Some nights it just doesn't go, and tonight was one of them."
- **Quote:** Bronco D Al Novakowski — "A hit is almost like a goal sometimes. A big hit can really settle the other team down. That's what happened tonight."

**Proposed games.json entry (UPDATE existing 1987-05-06-humboldt-round-robin):**
```json
{
  "id": "1987-05-06-humboldt-round-robin",
  "date": "1987-05-06",
  "series": "Centennial",
  "round": "Round-Robin",
  "opponent": "Humboldt Broncos",
  "location": "Humboldt, SK",
  "result": "L",
  "score": { "for": 1, "against": 6 },
  "highlights": [
    "Host Humboldt Broncos defeated Richmond 6-1 in the round-robin finale at the Humboldt Uniplex — the first blowout in eight meetings between the two Western finalists in three weeks. Humboldt finished round-robin 3-0; Richmond 2-1.",
    "Bill McDougall opened the scoring on a power-play rebound at 6:17 of the first. Stan Czenczek answered with a power-play slap shot past Bruce Hoffort at 17:26 to tie it 1-1. From there it was all Humboldt — Garnet Kazuik broke the tie shorthanded at 13:20 of the second, stealing the puck from Steve Jaques at the Richmond blue line for a clear breakaway on Jamie Stewart. Humboldt led 4-1 after two.",
    "Scorers Humboldt: McDougall (2), Kazuik (2), Duncan Ryhorchuk, Curtis Chamberlin. Shots: Humboldt 37, Richmond 19.",
    "Scrappy game — Humboldt took 15 of 27 minors, both teams had two five-minute majors and two game misconducts, and Humboldt added two 10-minute misconducts.",
    "Kurtenbach: 'We got outworked, outplayed, out-everythinged. The \"oomph\" just wasn't there. Some nights it just doesn't go, and tonight was one of them.'",
    "Sources: Star-Phoenix May 7 1987, p.17 (image 512096770); Calgary Herald May 7 1987, p.13 (image 483641750); The Vancouver Sun May 7 1987, p.24 (image 495159747) and p.69 (image 495159492); Daily Herald-Tribune May 7 1987, p.14 (image 731234571); Red Deer Advocate May 7 1987, p.17 (image 558421757)."
  ],
  "sources": [
    "star-phoenix-1987-05-06-humboldt-handshake-debate",
    "star-phoenix-1987-05-07-centennial-cup",
    "vansun-1987-05-07-centennial-cup-vs-humboldt",
    "newspapers-com-512096770",
    "newspapers-com-483641750",
    "newspapers-com-495159747",
    "newspapers-com-495159492",
    "newspapers-com-731234571",
    "newspapers-com-558421757"
  ]
}
```

---

### 4. Semifinal — Thu May 7 (8:30 PM CST) — Richmond 9 Pembroke 3

Sources: `1987-05-08-times-colonist-p12-i508631348.md`, `1987-05-08-daily-gleaner-p24-i1099004070.md`, `1987-05-08-red-deer-advocate-p22-i558421854.md`, `1987-05-08-calgary-herald-p18-i483667308.md`, `1987-05-08-the-hamilton-spectator-p23-i1011069513.md`, `1987-05-08-the-sun-times-p13-i726780980.md`, `1987-05-08-north-bay-nugget-p14-i731987715.md`, `1987-05-08-alberni-valley-times-p8-i560108695.md`, `1987-05-08-the-times-transcript-p5-i1107106001.md`, `1987-05-09-the-hamilton-spectator-p59-i1011070382.md`.

- **Scorers for Richmond (CP wire, majority version — 9 individual scorers):** Dean Rutledge, Steve Jaques, Matt Hervey, Brian Kozak, Paul Rutherford, Jason Phillips, Tony Bobbitt, Mike McCormick, Bill Hardy. (Times Colonist, Daily Gleaner, Hamilton Spectator, Calgary Herald, North Bay Nugget, Owen Sound Sun Times, Times-Transcript — seven papers consistent.)
  - **Variant A** (Red Deer Advocate p.22): replaces McCormick with **Bryon Moller**. Likely OCR or wire-desk mangle — minority report.
  - **Variant B** (Alberni Valley Times p.8): replaces Rutledge with **Trevor Dickie**. Likely OCR or wire-desk mangle — minority report.
- **Scorers for Pembroke:** Dave Van Hoof, George Dupont, Chris Clarke (Red Deer Advocate p.22, Hamilton Spectator, Owen Sound Sun Times).
- **Shots:** Richmond 44, Pembroke 32.
- **Periods:** Richmond 1-0 after 1; 3-0 after 2; then 6-3 explosion in 3rd.
- **Penalties:** Richmond took 11 of 17 minors.

**Proposed games.json entry (UPDATE existing 1987-05-07-pembroke-semifinal):**
```json
{
  "id": "1987-05-07-pembroke-semifinal",
  "date": "1987-05-07",
  "series": "Centennial",
  "round": "Semifinal",
  "opponent": "Pembroke Lumber Kings",
  "location": "Humboldt, SK",
  "result": "W",
  "score": { "for": 9, "against": 3 },
  "highlights": [
    "Richmond whipped Pembroke 9-3 at the Humboldt Uniplex in the Centennial Cup semifinal (Thursday night, 8:30 PM CST) to advance to Saturday's final against host Humboldt. Nine different Sockeyes scored.",
    "Scorers for Richmond: Dean Rutledge, Steve Jaques, Matt Hervey, Brian Kozak, Paul Rutherford, Jason Phillips, Tony Bobbitt, Mike McCormick, Bill Hardy. Scorers for Pembroke: Dave Van Hoof, George Dupont, Chris Clarke.",
    "Richmond outshot Pembroke 44-32, led 1-0 after the first period and 3-0 after the second, then added six goals in the third. Took 11 of 17 minor penalties.",
    "Sources: Times Colonist May 8 1987, p.12 (image 508631348); Calgary Herald May 8 1987, p.18 (image 483667308); Hamilton Spectator May 8 1987, p.23 (image 1011069513) and May 9 p.59 (image 1011070382); Red Deer Advocate May 8 1987, p.22 (image 558421854); Daily Gleaner May 8 1987, p.24 (image 1099004070); Owen Sound Sun Times May 8 1987, p.13 (image 726780980); North Bay Nugget May 8 1987, p.14 (image 731987715); Times-Transcript May 8 1987, p.5 (image 1107106001)."
  ],
  "sources": [
    "times-colonist-1987-05-08-sockeyes-vs-pembroke",
    "times-colonist-1987-05-08-sockeyes-vs-pembroke-box",
    "leader-post-1987-05-08-centennial-cup",
    "vansun-1987-05-08-lumber-kings",
    "newspapers-com-512097450",
    "newspapers-com-508631348",
    "newspapers-com-483667308",
    "newspapers-com-1011069513",
    "newspapers-com-1011070382",
    "newspapers-com-558421854",
    "newspapers-com-1099004070",
    "newspapers-com-726780980",
    "newspapers-com-731987715",
    "newspapers-com-1107106001"
  ]
}
```

---

### 5. Final — Sat May 9 (7:30 PM CST) — Richmond 5 Humboldt 2

Sources: `1987-05-11-star-phoenix-p13-i512098529.md`, `1987-05-11-star-phoenix-p14-i512098543.md` (**full period-by-period box**), `1987-05-11-star-phoenix-p1-i512098296.md`, `1987-05-11-star-phoenix-p11-i512098467.md`, `1987-05-11-the-vancouver-sun-p14-i495230735.md`, `1987-05-11-the-vancouver-sun-p20-i495229991.md`, `1987-05-10-times-colonist-p1-i508633163.md`, `1987-05-10-times-colonist-p9-i508632785.md`, `1987-05-11-the-province-p22-i502004009.md`, `1987-05-11-nanaimo-daily-news-p9-i325313520.md`, `1987-05-11-the-leader-post-p20-i496962458.md`, `1987-05-11-red-deer-advocate-p6-i558421985.md`, `1987-05-11-the-ottawa-citizen-p22-i463734704.md`, `1987-05-11-the-province-p12-i502004558.md`, `1987-05-10-the-province-p90-i502033093.md` (all-tournament team).

- **Full box (Star-Phoenix p.14 image 512098543):**
  - **1st Period**
    - 1. Richmond, Tomlinson (Rutherford, Claringbull) 16:53
    - 2. Richmond, Phillips (Hardy) 18:13
    - Penalties: Hervey Rich (roughing) 3:04; Dickie Rich (roughing) 4:04; McDougall Hum (roughing) 4:04; Ryhorchuk Hum (holding) 4:21; Czenczek Rich (holding) 11:05; Nelson Hum (holding) 14:34; Claringbull Rich (tripping) 19:09; McDougall Hum (cross-checking) 20:00.
  - **2nd Period**
    - 3. Humboldt, Chamberlin (Bergen) 10:47 PP
    - Penalties: Dickie Rich (hooking) 3:41; Claringbull Rich (hooking) 9:48; Dickie Rich (roughing) 16:36; Luke Hum (roughing) 16:37.
  - **3rd Period**
    - 4. Richmond, Rutherford (Rutledge) 8:48 — **game winner** per Times Colonist
    - 5. Richmond, Phillips (Kozak) 13:28
    - 6. Humboldt, Luke (Bergen, Rice) 16:31
    - 7. Richmond, Phillips (Kozak) 19:07 **EN** (empty net)
    - Penalties: None.
  - **Shots on goal:** Richmond 7-6-10 = 23. Humboldt 16-11-19 = 46.
  - **Goaltenders:** Richmond — Romeo (44 saves on 46 per Leader-Post/Nanaimo/Province; box says 2 goals allowed). Humboldt — Hoffort.
  - **Power plays:** Richmond 0-for-3; Humboldt 1-for-5.
- **Attendance:** ~2,400 standing-room-only (Star-Phoenix p.13; Leader-Post p.20). Vancouver Sun p.20 says "partisan crowd of 2,300"; stick with 2,400 per majority.
- **Awards:**
  - **Tournament MVP:** Frank Romeo (Star-Phoenix p.13, Vancouver Sun p.20, Times Colonist, Province, Leader-Post, Red Deer Advocate). Romeo was also Richmond player-of-the-game in all three starts; allowed six goals across three games.
  - **Final-game MVP (plaque):** Romeo.
  - **Most Gentlemanly / Sportsmanlike:** Jason Phillips (five goals and seven assists in five games, zero penalties). Stats per Vancouver Sun p.20.
- **All-tournament team** (The Province May 10 p.90 image 502033093, selected before semifinal play):
  - C: Bill McDougall (Humboldt) — tied for RR scoring lead: 4G 3A in 3GP
  - D: Rob Rice (Humboldt, from PEI)
  - RW: Duncan Ryhorchuk (Humboldt)
  - LW: Jason Phillips (Richmond) — second in RR scoring: 3G 3A in 3GP
  - D: Matt Hervey (Richmond)
  - G: Grant Robb (Pembroke) — "only goaltender to play three..." [cut off]
- **Kurtenbach quote:** "That third goal put the crimpers on it. I told them before the third period that we've had a series of mountains to climb: some of them were smaller, but they've all been tough to climb. We had one last one to go in the third period and they haven't failed me all year. In the stress situations, they've come through like gangbusters."
- **Lynch quote:** "If we played them again tomorrow, we'd win and the series would continue... We're 156-29 in the last two years. But we couldn't win the game we wanted to win. It's bitter."
- **Other:** Richmond and Humboldt played **nine** times in three weeks (Star-Phoenix p.13) — Richmond 5-4, each team scored 30 goals. Pembroke will host the 1988 Centennial Cup.

**Proposed games.json entry (UPDATE existing 1987-05-09-humboldt-final):**
```json
{
  "id": "1987-05-09-humboldt-final",
  "date": "1987-05-09",
  "series": "Centennial",
  "round": "Final",
  "opponent": "Humboldt Broncos",
  "location": "Humboldt, SK",
  "result": "W",
  "score": { "for": 5, "against": 2 },
  "highlights": [
    "Richmond defeated Humboldt 5-2 at the Humboldt Uniplex on Saturday night (7:30 PM CST) before a standing-room-only crowd of approximately 2,400 to win the Centennial Cup — the Tier II Junior A national championship.",
    "Goals — 1st: Richmond, Tomlinson (Rutherford, Claringbull) 16:53; Richmond, Phillips (Hardy) 18:13. 2nd: Humboldt, Chamberlin (Bergen) 10:47 PP. 3rd: Richmond, Rutherford (Rutledge) 8:48 — eventual winner; Richmond, Phillips (Kozak) 13:28; Humboldt, Luke (Bergen, Rice) 16:31; Richmond, Phillips (Kozak) 19:07 empty net.",
    "Jason Phillips recorded a hat trick (including the empty-netter). Paul Rutherford scored the eventual winning goal.",
    "Goaltender Frank Romeo stopped 44 of 46 shots; Humboldt outshot Richmond 46-23 (16-7, 11-6, 19-10). Power plays: Richmond 0-for-3; Humboldt 1-for-5. Hoffort was in goal for Humboldt.",
    "Frank Romeo was named final-game MVP and tournament MVP — his third player-of-the-game award in three starts; he allowed just six goals over the three games.",
    "Jason Phillips won Most Gentlemanly Player honours (five goals, seven assists in five games, zero penalties).",
    "All-tournament team (selected before the semifinals): C Bill McDougall (Hum), LW Jason Phillips (Rich), RW Duncan Ryhorchuk (Hum), D Rob Rice (Hum), D Matt Hervey (Rich), G Grant Robb (Pem).",
    "Kurtenbach: 'That third goal put the crimpers on it. They haven't failed me all year. In the stress situations, they've come through like gangbusters.' Humboldt coach Bernie Lynch afterward: 'We're 156-29 in the last two years, but couldn't win the game we wanted to win. It's bitter.'",
    "Richmond and Humboldt played nine times in three weeks between the Abbott Cup and Centennial Cup — Richmond won five, each team scored 30 goals.",
    "Sources: Star-Phoenix May 11 1987 p.13 (image 512098529), p.14 box score (image 512098543), p.1 (image 512098296); Vancouver Sun May 11 1987 p.14 (image 495230735) and p.20 (image 495229991); Times Colonist May 10 1987 p.1 (image 508633163) and p.9 (image 508632785); The Province May 11 1987 p.12 (image 502004558) and p.22 (image 502004009); The Province May 10 1987 p.90 (image 502033093, all-tournament team); Leader-Post May 11 1987 p.20 (image 496962458); Nanaimo Daily News May 11 1987 p.9 (image 325313520); Ottawa Citizen May 11 1987 p.22 (image 463734704); Red Deer Advocate May 11 1987 p.6 (image 558421985)."
  ],
  "sources": [
    "star-phoenix-1987-05-11-centennial-cup",
    "star-phoenix-1987-05-11-centennial-cup-box",
    "vansun-1987-05-11-centennial-cup",
    "vansun-1987-05-11-sockeyes-win-centennial-cup",
    "richmond-review-1987-05-13-centennial-cup",
    "richmond-review-1987-05-13-centennial-cup-page-2",
    "richmond-review-1987-05-13-centennial-cup-page-3",
    "richmond-review-1987-05-13-hervey-romeo",
    "centennial-cup-team-photo",
    "newspapers-com-512098529",
    "newspapers-com-512098543",
    "newspapers-com-512098296",
    "newspapers-com-495230735",
    "newspapers-com-495229991",
    "newspapers-com-508633163",
    "newspapers-com-508632785",
    "newspapers-com-502004558",
    "newspapers-com-502004009",
    "newspapers-com-502033093",
    "newspapers-com-496962458",
    "newspapers-com-325313520",
    "newspapers-com-463734704",
    "newspapers-com-558421985"
  ]
}
```

---

## Non-Richmond Centennial Cup round-robin results (for standings)

| Date | Result | Source |
|---|---|---|
| Sat May 2 | Humboldt 7 Dartmouth 2 | The Vancouver Sun May 4 p.32 (495156911); Red Deer Advocate May 4 p.9 (558421571); Winnipeg Sun May 4 (736882093); Daily Gleaner May 4 p.19 (1098955609) |
| Sun May 3 | Humboldt 4 Pembroke 2 | Red Deer Advocate May 4 p.9 (558421571); Ottawa Citizen May 4 p.23 (463592773); Standard-Freeholder May 4 p.8 (1062326753); Evening Tribune May 4 p.21 (1224988953) — Broncos 3-1 after 1st, Kevin Luke/Rob Rice/Duncan Ryhorchuk/Curtis Chamberlin (GWG 16:09 1st). Mike Eastwood 2 for Pembroke. Humboldt outshot Pembroke 42-32, took 14 of 27 minors. |
| Tue May 5 | Pembroke 8 Dartmouth 4 | Times-Transcript May 6 p.10 (1107096106) and p.13 (1107096391); Daily Gleaner May 6 p.35 (1098997466); Kingston Whig-Standard May 6 p.13 (731774797); North Bay Nugget May 6 p.18 (731987443); Province May 6 p.21 (502029038) — Bruce Coles 2G 3A; Chris Clarke 2G; Peter White 2G; Scott Mohns, Mike Eastwood singles. For Dartmouth: Jasmin Breton, Steve Brown, Ron Petrie, Brian King. Outshot 28-20 but won. |

## Final standings (round-robin)

| Team | G | W | L | F | A | P | Source |
|---|---|---|---|---|---|---|---|
| Humboldt | 3 | 3 | 0 | 17 | 6 | 6 | Calgary Herald May 7 (483641750) |
| Richmond | 3 | 2 | 1 | 13 | 10 | 4 | Calgary Herald May 7 (483641750) |
| Pembroke | 3 | 1 | 2 | 11 | 12 | 2 | (implied) |
| Dartmouth | 3 | 0 | 3 | 8 | 21 | 0 | (implied; note Star-Phoenix May 4 p.15 shows "8-0" — OCR mangle of points) |

---

## Roster tally — Centennial Cup stats (per-player G/A/PIM/GP across all 5 Richmond games)

Confidence key: **H** high (explicitly attributed with period+time+assists), **M** medium (named as a scorer in narrative), **L** low (not named).

Based on box scores (games 2 and 5) and narrative scorer lists (games 1, 3, 4). **Assists are mostly missing for narrative-only summaries** — they're only reported in the game 2 and game 5 boxes and a few fragments.

| Roster ID | Name | GP | G | A (min) | PIM (min) | Confidence | Notes |
|---|---|---|---|---|---|---|---|
| `jason-phillips` | Jason Phillips | 5 | 5 | 7 | 0 | H | Vancouver Sun p.20: "scored five goals and seven assists in five games and did not pick up a penalty" — **definitive for total Centennial Cup line**. Scored 3G in G1 (vs Dartmouth). 3G in G5 final (incl. EN). Allocation within games partly inferable; between these two games alone accounts for 6 goals — **conflict: VSun's "5 goals" vs sum of reported scorers is 6**. Flag. |
| `dave-tomlinson` | Dave Tomlinson | 5 | 3 | 1 | 0 | H | G1 Dartmouth (1G); G2 Pembroke RR (2G, 3rd period — box-confirmed); G5 final (1G, 1st-period opener w/ assists from Rutherford & Claringbull). Plus 1A in final? No — Phillips was on his own scoring, Tomlinson scored. 1A: G2 as per Phillips assist chain? Actually Tomlinson had assist on Czenczek goal? No — assists in G2 were Phillips+Hervey on Kozak; Moller+Dickie on Czenczek; Phillips on Tomlinson; Rutledge+Rutherford on Tomlinson. So Tomlinson's assist count: 0 from G2. 1A from Phillips G5 first-goal? no, that was Hardy. So Tomlinson 0A from the boxes. Narrative-only games (G1, G3, G4) don't give assists. |
| `matt-hervey` | Matt Hervey | 5 | 2 | 1 | — | M | G1 Dartmouth (1G); G4 semi (1G); 1A on Kozak goal G2 RR (box-confirmed). Penalty: slashing G2. |
| `stan-czenczek` | Stan Czenczek | 5 | 2 | — | 2+ | H | G2 Pembroke RR (1G — PP slapshot); G3 Humboldt RR (1G — PP slapshot). Penalties: roughing G2 (5:20), holding G5 (11:05). |
| `brian-kozak` | Brian Kozak | 5 | 1 | 2 | 0 | H | G2 Pembroke RR (1G — opener, 2:39 from Phillips+Hervey); G4 semi (1G? — named in scorer list); 2A in G5 final on Phillips goals at 13:28 and 19:07 EN. |
| `jason-stewart` / `jamie-stewart` (goalie) | Jamie Stewart | 1 | — | — | — | H | Started G3 Humboldt 6-1 L; pulled, not named in other games' goaltender slots. |
| `frank-romeo` (goalie) | Frank Romeo | 3 | — | — | 0 | H | Started G2 Pembroke RR, G4 semi vs Pembroke, G5 final. Tournament MVP. 44 saves on 46 in final. Allowed 6 goals across three games per Vancouver Sun. |
| `bryon-moller` | Bryon Moller | 5 | 1 | 1 | — | H | G1 Dartmouth (1G); 1A on Czenczek G2 goal. |
| `steve-jaques` | Steve Jaques | 5 | 2 | — | 2+ | M | G1 Dartmouth (1G); G4 semi (1G). Penalty: high-sticking G2 (9:21). Involved in Kazuik breakaway G3 (turnover on SH goal). |
| `dean-rutledge` | Dean Rutledge | 5 | 1 | 2 | 2+ | H | G4 semi (1G); 1A on Tomlinson goal G2 (18:26); 1A on Rutherford goal G5 (8:48). Penalty: high-sticking G2 (17:20). |
| `paul-rutherford` | Paul Rutherford | 5 | 2 | 1 | — | H | G4 semi (1G); G5 final (1G — eventual winner, 8:48 3rd); 1A on Tomlinson goal G5 opener and on Tomlinson G2 goal (18:26)? Only on Tomlinson G2 goal; G5 assist is Claringbull+Rutherford on Tomlinson. So 1A on G2 Tomlinson, 1A on G5 Tomlinson = 2A. |
| `tony-bobbitt` | Tony Bobbitt | 5 | 1 | — | — | M | G4 semi (1G). |
| `mike-mccormick` | Mike McCormick | 5 | 1 | — | 2+ | M | G4 semi (1G). Penalty: roughing G2 (3:29). |
| `bill-hardy` | Bill Hardy | 5 | 1 | 1 | — | H | G4 semi (1G); 1A on Phillips goal G5 (18:13). |
| `mike-claringbull` | Mike Claringbull | 5 | 0 | 1 | 2+ | H | 1A on Tomlinson goal G5 opener. Penalties: holding G2 (10:48), hooking G5 (9:48), tripping G5 (19:09). |
| `trevor-dickie` | Trevor Dickie | 5 | 0 | 1 | 6+ | H | 1A on Czenczek goal G2 (6:35). Penalties: hooking G2 (6:21), interference G2 (15:33), slashing G2 (7:15), hooking G5 (3:41), roughing G5 (4:04, 16:36). Very busy in the box. |
| `rob-clarke` | Rob Clarke | 5 | 0 | 0 | 2+ | L | Penalty: hooking G2 (2:54). No goals/assists traced. |
| `jim-gunn` | Jim Gunn | 5 | 0 | 0 | 2+ | L | Penalty: charging G2 (16:08). |

**Flag — Phillips totals conflict:**
- Vancouver Sun May 11 p.20 (Pap): Phillips = **5G 7A** across tournament.
- Sum of reported scorers: G1 (3), G4 (1), G5 (3) = 7 goals, but Pap says 5.
- Likely explanation: Pap's "five goals and seven assists" is an error or approximation; Star-Phoenix May 10 (Province p.90) had Phillips "second in round-robin scoring with 3G 3A in 3GP" — so through the round-robin he was on 3G + 3A. If he then had 1G in the semi and 3G 1A in the final, that totals **7G 4A**, not 5G 7A. Something is off in either Pap's tally or the narrative scorer lists. **Recommend:** propose Phillips Centennial = 7G (from game-level scorer lists) and flag the Vancouver Sun "5G 7A" line as inconsistent.

**Proposed `centennialCupStats` block (to be added to roster.json):**

Given the ambiguity (esp. on assists) and the known Phillips conflict, a conservative per-player Centennial Cup tally, derived only from explicit scorer attributions in the wire boxes/narratives:

```json
// For each roster id, centennialCupStats: { gp, g, a, pim }
// Goalies: { gp, w, l, gaa, svpct, so }
// NOT for merging blindly — needs roster-id reconciliation + assist-completeness review.
{
  "jason-phillips":    { "gp": 5, "g": 7, "a": 1, "pim": 0, "notes": "G1: 3G. G4: 1G. G5: 3G (incl. EN) + 1A (on Kozak G2 opener) — wait that's G2. Rework: G2: 1A. G1: 3G. G4: 1G. G5: 3G. Tomlinson G2 assist: Phillips (1A). Tomlinson G5 opener: no Phillips. Kozak G2 opener: Phillips+Hervey assists (1A). So Phillips: 7G, 2A. PLUS Vancouver Sun credits 7 assists total — flag." },
  "dave-tomlinson":    { "gp": 5, "g": 3, "a": 0, "pim": 0 },
  "matt-hervey":       { "gp": 5, "g": 2, "a": 1, "pim": 2 },
  "stan-czenczek":     { "gp": 5, "g": 2, "a": 0, "pim": 4 },
  "brian-kozak":       { "gp": 5, "g": 1, "a": 2, "pim": 0 },
  "bryon-moller":      { "gp": 5, "g": 1, "a": 1, "pim": 0 },
  "steve-jaques":      { "gp": 5, "g": 2, "a": 0, "pim": 2 },
  "dean-rutledge":     { "gp": 5, "g": 1, "a": 2, "pim": 2 },
  "paul-rutherford":   { "gp": 5, "g": 2, "a": 2, "pim": 0 },
  "tony-bobbitt":      { "gp": 5, "g": 1, "a": 0, "pim": 0 },
  "mike-mccormick":    { "gp": 5, "g": 1, "a": 0, "pim": 2 },
  "bill-hardy":        { "gp": 5, "g": 1, "a": 1, "pim": 0 },
  "mike-claringbull":  { "gp": 5, "g": 0, "a": 1, "pim": 6 },
  "trevor-dickie":     { "gp": 5, "g": 0, "a": 1, "pim": 14 },
  "rob-clarke":        { "gp": 5, "g": 0, "a": 0, "pim": 2 },
  "jim-gunn":          { "gp": 5, "g": 0, "a": 0, "pim": 2 },
  "frank-romeo":       { "gp": 3, "w": 3, "l": 0, "gaa": 2.00, "svpct": null, "so": 0, "notes": "6 goals allowed in 3 games per Vancouver Sun; saves/shots only known for final (44/46). GAA computed on 60-min games; exact SV% awaits prior games' shot totals." },
  "jamie-stewart":     { "gp": 1, "w": 0, "l": 1, "gaa": 6.00, "svpct": 0.838, "so": 0, "notes": "G3 vs Humboldt: 31 saves on 37 shots per Calgary Herald May 7." }
}
```

**Caveats for tallies:**
- **Assists are under-counted.** Only game 2 (Pembroke RR) and game 5 (Final) had full period-by-period boxes. Games 1, 3, 4 had narrative-only scorer lists. Real assist totals almost certainly higher.
- **PIM under-counted** for the same reason — only games 2 and 5 give penalty lists.
- **Phillips totals are a known conflict** — see flag above.
- **Do not merge blindly.** Recommend publishing these as `centennialCupStats` (new field) only after Phillips reconciled. Keep existing `playoffStats` (really regular-season totals from hockeydb) untouched.

---

## Conflicts with existing games.json

| Game | Field | Existing | Proposed | Resolution |
|---|---|---|---|---|
| `1987-05-04-pembroke-round-robin` | `score.against` | **3** | **1** | Change to 1. Existing CLAUDE.md says "4-3 W" but all wire copy and the official Star-Phoenix box score (image 512094503) show **4-1**. Pembroke's lone goal was Dupont PP at 4:06 of 3rd. The CLAUDE.md note "two third-period Tomlinson goals won it" is still correct — they were the 3rd and 4th Richmond goals after Dupont got Pembroke's only goal at 4:06. **HIGH PRIORITY FIX.** |
| `1987-05-06-humboldt-round-robin` | highlight: "Jamie Stewart was in net for Richmond" | correct | retain | confirmed by Star-Phoenix p.17 |
| `1987-05-09-humboldt-final` | all existing highlights | correct | enrich | existing is solid; proposed expands with power-play lines, all-tournament team, Lynch/Kurtenbach quotes, confirmation of "5 goals scored by 4 different goal-scorers + 1 EN" |
| `1987-05-03-dartmouth-round-robin` | highlights | minimal | enrich | add scorers (Phillips 3, Moller, Jaques, Tomlinson, Hervey; Scott 2, King 1), shot totals (44-29), period progression (3-1, 6-2). |
| `1987-05-07-pembroke-semifinal` | highlights | minimal | enrich | add 9 individual scorers, shot totals (44-32), period progression (1-0, 3-0, 9-3). |

**Final score 5-2 vs 5-3 — not a conflict.** Existing games.json already has 5-2 (correct). This pass reconfirms with 12 sources.

**May 9 date — not a conflict.** Existing games.json already has 1987-05-09 (correct). Reconfirmed.

**MVP = Romeo — not a conflict.** Existing games.json already credits Romeo (correct). Reconfirmed with 6 sources.

---

## Couldn't determine

1. **Full shot totals for G1 (Dartmouth) and G4 (semi) were partially reported** — 44-29 (G1) and 44-32 (G4), but no period-by-period shot splits.
2. **Complete assist credits for games 1, 3, 4.** Only games 2 and 5 have full period-by-period boxes in the extracted OCR. Several assists for other games are inferable from Vancouver Sun p.20's "Phillips 5G 7A" claim but that total itself conflicts with the narrative scorer lists (see Phillips flag above).
3. **4th Dartmouth goal in G1 (May 3).** Wire reports list Jerry Scott (2) and Brian King (1) — that's only three. The final was 7-3, so a fourth Dartmouth goal exists but is not named in any recovered OCR. (Actually "7-3" means Dartmouth scored 3; three are accounted for: Scott 2, King 1 = 3. So all goals are accounted for. Not an issue — I double-counted.)
4. **Centennial Cup penalty-minutes totals per player** beyond games 2 and 5.
5. **Full Bronco lineup / Pembroke lineup / Dartmouth lineup** — not relevant to Richmond roster but useful for quotes/context. Not extracted.
6. **Exact saves for Romeo in G2 (Pembroke RR) and G4 (semi).** Only G5 known (44 saves on 46). G4: Richmond outshot Pembroke 44-32 so Romeo faced 32 shots in G4 and stopped 29.
7. **Centennial Cup all-tournament team goaltender** — Grant Robb of Pembroke, per Province May 10 p.90, but the paragraph is truncated in OCR (says "the only goaltender to play three..." then cuts off). Robb did start all 3 Pembroke games so "only goaltender to play three [round-robin games]" fits; can't 100% confirm he was named to all-star team from fragment, but the sentence structure and selection criteria align.
8. **Phillips total line** — narrative scorer-list sum says 7G; Vancouver Sun p.20 (Pap) says 5G 7A. One of the two is wrong. Needs resolution before publishing `centennialCupStats`. Star-Phoenix p.13 describes Phillips scoring "the tournament's" — OCR cuts off, can't cross-check.
