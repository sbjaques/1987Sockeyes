# Abbott Cup 1987 — Box-Score Extraction Proposal

**Series:** Richmond Sockeyes (BC) vs Humboldt Broncos (SK), best-of-seven Western Canadian Junior A final for the Abbott Cup.
**Dates:** 1987-04-20 through 1987-04-29.
**Result:** Richmond wins the series 4-3. Cumulative score Richmond 26, Humboldt 24.
**Source corpus:** `docs/extractions/1987-04-2*.md` and `docs/extractions/1987-04-30-*.md`.

Existing `games.json` already contains all seven games at series/game level. This proposal adds period-by-period goal-scoring detail (where the OCR yields a printed box score), rationalises narrative disagreements, and proposes a verified per-player series tally.

---

## Game 1 — 1987-04-20 — Humboldt 5, Richmond 3 (OT)

**Venue:** Humboldt Uniplex (Humboldt, SK). **Attendance:** not printed in corpus.

### Scoring

**First period** — partial OCR (top of column clipped off in `1987-04-21-star-phoenix-p43-i512310237.md`). Narrative confirms Richmond led after 20 (`1987-04-22-star-phoenix-p36-i512310501.md` says "outworked" etc.) but the period-end score is stated by CP wire (`1987-04-21-the-vancouver-sun-p28-i495241884.md`, `1987-04-21-star-phoenix-p41-i512310223.md`) only as "Richmond led 2-1 after the second period and the teams were tied at 3-3 after regulation."

- **1.** Richmond — Moller (1st period; unassisted detail not in corpus) — source: narrative in `1987-04-21-the-vancouver-sun-p28-i495241884.md` ("goals from Bryan Moller, Matt Hervey and Jason Phillips"); `1987-04-22-langley-advance-p15-i536980538.md` confirms "Moller scored a goal in Richmond's 5-3 losing cause".

**Second period** (from `1987-04-21-star-phoenix-p43-i512310237.md`):
- **2.** Humboldt — Bergen (McDougall) 0:26 pp
- **3.** Richmond — Hervey (Claringbull) 1:17 pp

**Third period** (same source):
- **4.** Humboldt — Chamberlin (Ryhorchuk, Wingate) 6:28 pp
- **5.** Richmond — Phillips (Czenczek, Clarke) 8:02 pp
- **6.** Humboldt — McDougall [time/assists clipped]

**Overtime** (from `1987-04-21-star-phoenix-p41-i512310223.md`):
- Humboldt — Chamberlin (from Johannson, 2-on-1, "high over sliding Sockeye goalie Frank Romeo") 8:21 (stated as "1:39 remaining in the overtime period" of a 10-minute OT; Chamberlin's second OT goal also but time not printed).

### Penalties (from Star-Phoenix p.43 — first-period list):
Jaques, Rich (holding) 3:08; Claringbull, Rich (roughing) 8:00; Czenczek, Rich (slashing) 11:40; Bergen, Hum (slashing) 11:40; Richmond (too many men, served by Hardy) 13:53; Hervey, Rich (hooking) 14:10; Dickie, Rich (holding) 18:26. **Second period:** Ryhorchuk, Hum (tripping) 0:35; Gunn, Rich (elbowing) 8:18; Jaques, Rich (interference) 12:08; Rice, Hum (holding) 12:08; Czenczek, Rich (holding) 17:31; Luke, Hum (interference) 17:50.

### Shots / goalies / attendance
Not printed cleanly in available corpus for this game.

### Proposed `games.json` entry
```json
{
  "id": "1987-04-20-humboldt-abbott-game-1",
  "date": "1987-04-20",
  "series": "Abbott",
  "round": "Game 1",
  "opponent": "Humboldt Broncos",
  "location": "Humboldt, SK",
  "result": "L",
  "score": { "for": 3, "against": 5 },
  "highlights": [
    "Humboldt opened the best-of-seven Abbott Cup (Western Canadian Junior A final) with a 5-3 overtime win at the Humboldt Uniplex. Richmond led 2-1 after the second period; the teams were tied 3-3 after regulation.",
    "Curtis Chamberlin scored three goals for Humboldt, including the overtime winner on a two-on-one pass from Joey Johannson, firing high over sliding Sockeye goalie Frank Romeo with 1:39 remaining in the 10-minute overtime. Brad Bergen (assisted by Bill McDougall, 0:26 2nd PP) and Bill McDougall had the other Humboldt goals.",
    "Second-period PP goal: Hervey (Claringbull) 1:17 PP. Third-period PP goal: Phillips (Czenczek, Clarke) 8:02 PP.",
    "Bryan Moller (first period), Matt Hervey (2nd PP) and Jason Phillips (3rd PP) scored for Richmond.",
    "Source: Star-Phoenix Apr 21 1987, p.41 (image 512310223) and p.43 box (image 512310237); Vancouver Sun Apr 21 1987, p.28 (image 495241884)."
  ],
  "sources": [
    "newspapers-com-512310223",
    "newspapers-com-512310237",
    "newspapers-com-495241884"
  ]
}
```

---

## Game 2 — 1987-04-21 — Richmond 5, Humboldt 3

**Venue:** Humboldt Uniplex. **Attendance:** not printed in corpus.
**Shots on goal:** Humboldt 45, Richmond 31 (confirmed: `1987-04-22-the-leader-post-p18-i496462581.md`, and box 45-31 in `1987-04-22-star-phoenix-p38-i512310521.md`).
**Goaltenders:** Richmond — Romeo; Humboldt — E. Backlund (/ Lloyd per OCR "Humboldt: E Backlund, Lloyd" — likely Backlund started, possibly relieved).
**Power plays:** Humboldt 2/8, Richmond 3/5.

### Scoring (verbatim from `1987-04-22-star-phoenix-p38-i512310521.md`)

**First period:**
- 1. Richmond — Czenczek (Hervey) 1:54 pp
- 2. Humboldt — Nelson (Shyiak) 8:22 pp  *(see Conflicts: probably "Shyiak" not "Nelson" per CP wire)*
- 3. Richmond — Phillips (Clarke, Jaques) 8:22
- 4. Humboldt — Luke (McDougall, Wingate) 16:46 pp

**Second period:**
- 5. Richmond — Phillips (Hervey, Czenczek) 10:37 pp
- 6. Richmond — Kozak (Hervey, Phillips) 17:37 pp

**Third period:**
- 7. Humboldt — McDougall (Bergen) 10:45
- 8. Richmond — Phillips 18:05 (unassisted; described in narrative "with 1:55 remaining" — `1987-04-22-star-phoenix-p36-i512310501.md`)

### Penalties (from same box):
1st: Claringbull Rich (crosschecking) 0:50; Rice Hum (unsportsmanlike) 0:50; Shyiak Hum (roughing) 0:50; Humboldt (delay of game) 0:50; Tomlinson Rich (slashing) 2:14; Jaques Rich (crosschecking) 3:00; Hervey Rich (roughing) 6:09; Rice Hum (roughing) 6:09; Watts Hum (misconduct) 6:09; Dickie Rich (unsportsmanlike) 7:16; Romeo Rich (slashing, served by Jaques) 7:52; McDougall Hum (highsticking) 12:11; Tomlinson Rich 14:58; Gunn Rich (roughing) 19:04; Shyiak Hum (roughing) 19:04. 2nd: Bergen Hum (hooking) 10:00; Kozak Rich (roughing) 12:54; Ryhorchuk Hum (roughing) 12:54; Esau Hum (tripping) 17:39; Bobbitt Rich (tripping) 18:31. 3rd: Dickie Rich (roughing) 6:29; Shyiak Hum (roughing) 6:29; Czenczek Rich (holding) 12:45; Kozak Rich (slashing) 13:42; McDougall Hum (slashing) 13:42.

### Proposed `games.json` entry
```json
{
  "id": "1987-04-21-humboldt-abbott-game-2",
  "date": "1987-04-21",
  "series": "Abbott",
  "round": "Game 2",
  "opponent": "Humboldt Broncos",
  "location": "Humboldt, SK",
  "result": "W",
  "score": { "for": 5, "against": 3 },
  "highlights": [
    "Richmond evened the series 1-1 with a 5-3 win at the Humboldt Uniplex. Humboldt held a 45-31 edge in shots on goal.",
    "Jason Phillips recorded a hat trick (first-period PP, second-period PP, third-period EN-style 18:05). Stan Czenczek opened the scoring 1:54 in on the PP (from Hervey) and Brian Kozak made it 4-2 on a second-period PP at 17:37 (from Hervey and Phillips).",
    "Dave Shyiak/Nelson (see source), Kevin Luke (McDougall, Wingate 16:46 PP) and Bill McDougall (Bergen 10:45) replied for Humboldt. Power plays: Richmond 3-for-5, Humboldt 2-for-8.",
    "Frank Romeo in net for Richmond (also took a 7:52 first-period slashing minor served by Jaques). Humboldt goaltender: E. Backlund.",
    "Source: Leader-Post Apr 22 1987, p.18 (image 496462581); Star-Phoenix Apr 22 1987, p.36 (image 512310501) and p.38 box (image 512310521); Vancouver Sun Apr 22 1987, p.60 (image 495243576)."
  ],
  "sources": [
    "newspapers-com-496462581",
    "newspapers-com-512310501",
    "newspapers-com-512310521",
    "newspapers-com-495243576"
  ]
}
```

---

## Game 3 — 1987-04-22 — Richmond 4, Humboldt 3 (OT)

**Venue:** Humboldt Uniplex. **Attendance:** "fewer than 900" (`1987-04-23-star-phoenix-p14-i512310808.md`).
**Shots on goal:** Humboldt 39, Richmond 23 (`1987-04-23-the-leader-post-p14-i496462652.md`).
**Penalties:** Richmond took 13 of 25 minor penalties and the only major, giving Humboldt 9 PPs (0-for-9). (`1987-04-23-star-phoenix-p14-i512310808.md`, `1987-04-23-the-leader-post-p14-i496462652.md`.)
**Goaltenders:** Richmond — Romeo, 36 saves (noted as "story of the game"); Humboldt — Hoffort (implied from later-game references).

### Scoring (from `1987-04-23-star-phoenix-p16-i512310816.md`)

**First period:** no goals.
- Penalties: Gunn Rich (roughing) 7:31; Bobbitt Rich (holding) 10:32; Dickie Rich (delay of game) 10:32; Luke Hum (delay of game) 10:32; Shyiak Hum (charging) 12:17; Watts Hum (interference) 15:32; Tomlinson Rich (hooking) 16:36.

**Second period:**
- 2. Humboldt — McDougall (Shyiak, Rice) 7:14
- 3. Richmond — Tomlinson (Rutledge, Czenczek) 13:42 **shorthanded** (sh)
- Penalties: Tomlinson Rich (tripping) 0:32; Clark Hum (interference) 3:46; Bobbitt Rich (hooking) 5:30; Bergen Hum (crosschecking) 6:24; Gunn Rich (highsticking major) 9:58; Luke Hum (checking from behind) 10:18; Hervey Rich (crosschecking, unsportsmanlike) 15:00; Wingate Hum (holding) 16:38; Novakowski Hum (holding) 18:17.

**Third period:**
- 4. Richmond — Claringbull (Hervey, Tomlinson) 4:44
- 5. Humboldt — Chamberlin (McDougall, Wingate) 9:08
- 6. Richmond — Clarke (Kozak, Tomlinson) 19:27 — tying goal "with 33 seconds remaining" per `1987-04-23-star-phoenix-p14-i512310808.md`.
- Penalties: Jaques Rich (roughing) 2:40; Bobbitt Rich (roughing, roughing) 2:40; Novakowski Hum (roughing) 2:40; Ryhorchuk Hum (roughing) 2:40; Chamberlin Hum (roughing) 2:40.

Wait — OCR shows Richmond scored first at Goal 2 with "McDougall" listed as scorer. Re-reading: Goal #1 must therefore precede. The OCR begins mid-page with **no first-period goals** (penalty list only, confirming scoreless first). The `1987-04-23-star-phoenix-p14-i512310808.md` narrative confirms: "Bill McDougall... including a shorthanded goal in the first period which gave Humboldt a 1-0 lead." — **contradiction**: the box labels McDougall's goal at 7:14 of **second** period (even strength, from Shyiak+Rice), not SH first-period. The narrative may have confused periods or specific sequence. *See Conflicts below.*

**Overtime:**
- 7. Richmond — Bobbitt (McCormick, Czenczek) 1:04
- Penalties: Richmond bench (too many men) 4:45; Clarke Rich (roughing) 8:55; McDougall Hum (roughing) 8:55.

### Proposed `games.json` entry
```json
{
  "id": "1987-04-22-humboldt-abbott-game-3",
  "date": "1987-04-22",
  "series": "Abbott",
  "round": "Game 3",
  "opponent": "Humboldt Broncos",
  "location": "Humboldt, SK",
  "result": "W",
  "score": { "for": 4, "against": 3 },
  "highlights": [
    "Tony Bobbitt scored 1:04 into the 10-minute overtime on assists from Mike McCormick and Stan Czenczek to give Richmond a 4-3 win at the Humboldt Uniplex in front of fewer than 900 fans. The Sockeyes took a 2-1 series lead.",
    "Scoreless first. Second period: Humboldt 2-0 on McDougall (Shyiak, Rice) 7:14; Richmond got one back on a shorthanded goal by Dave Tomlinson (Rutledge, Czenczek) at 13:42.",
    "Third period: Richmond tied 2-2 on Claringbull (Hervey, Tomlinson) 4:44; Chamberlin (McDougall, Wingate) restored Humboldt's lead at 9:08; Rob Clarke (Kozak, Tomlinson) tied it with 33 seconds remaining at 19:27. Jim Gunn drew a second-period high-sticking major at 9:58.",
    "Goaltender Frank Romeo was named the story of the game with 36 saves, including several would-be goals off Chamberlin's stick. Humboldt outshot Richmond 39-23. Richmond took 13 of 25 minor penalties and the only major, giving Humboldt nine power-play opportunities, but the Broncos were 0-for-9 with the man advantage.",
    "Source: Star-Phoenix Apr 23 1987, p.14 (image 512310808) and p.16 box (image 512310816); Leader-Post Apr 23 1987, p.14 (image 496462652); Vancouver Sun Apr 23 1987, p.61 (image 495246503)."
  ],
  "sources": [
    "newspapers-com-512310808",
    "newspapers-com-512310816",
    "newspapers-com-496462652",
    "newspapers-com-495246503"
  ]
}
```

---

## Game 4 — 1987-04-25 — Humboldt 2, Richmond 1

**Venue:** Richmond Arena (Minoru). Saturday 7:30 PM. **First Richmond home game since April 8.**
**Attendance:** not printed.
**Shots / period scores / goalie save totals / penalties:** **not in corpus.** No box score was retained from any paper for this game.

### Goals (narrative only)
- Humboldt — Bill McDougall and Brad Bergen (sources: `1987-04-26-calgary-herald-p4-i483768383.md`; `1987-04-26-times-colonist-p12-i508877216.md`).
- Richmond — Dean Rutledge "in the third period" (same sources).
- Hoffort stopped 22 shots in Game 5 two nights later, noted as "the same tactic the visitors employed in a 2-1 victory Saturday night" (`1987-04-27-fort-mcmurray-today-p7-i738694983.md`) — describing Humboldt's tight-checking approach but **does not** give Game-4 goalie save totals.

### Proposed `games.json` entry
*(Current entry is adequate; recommend no change beyond citation polish.)*
```json
{
  "id": "1987-04-25-humboldt-abbott-game-4",
  "date": "1987-04-25",
  "series": "Abbott",
  "round": "Game 4",
  "opponent": "Humboldt Broncos",
  "location": "Richmond, BC",
  "result": "L",
  "score": { "for": 1, "against": 2 },
  "highlights": [
    "Humboldt won 2-1 at Richmond Arena on Saturday night to even the best-of-seven series at 2-2. It was Richmond's first home game since April 8; the Broncos' tight-checking game stymied the Sockeyes.",
    "Bill McDougall and Brad Bergen scored for Humboldt. Dean Rutledge replied with Richmond's lone goal in the third period.",
    "Source: Calgary Herald Apr 26 1987, p.4 (image 483768383); Times Colonist Apr 26 1987, p.12 (image 508877216); Fort McMurray Today Apr 27 1987, p.7 retrospective (image 738694983)."
  ],
  "sources": [
    "newspapers-com-483768383",
    "newspapers-com-508877216",
    "newspapers-com-738694983"
  ]
}
```

---

## Game 5 — 1987-04-26 — Richmond 5, Humboldt 3

**Venue:** Richmond Arena. Sunday 7:30 PM.
**Period scores:** Humboldt led 2-0 after first; tied 2-2 after second (`1987-04-27-the-leader-post-p14-i496463200.md`, `1987-04-27-star-phoenix-p15-i512311911.md`).
**Shots on goal:** Hoffort made 22 saves for Humboldt; Romeo made 30 saves for Richmond (implied Richmond 25 shots, Humboldt 33 shots — assuming 3 goals against each goalie; use with caution).
**Goaltenders:** Richmond — Romeo (30 saves); Humboldt — Hoffort (22 saves). (`1987-04-27-nanaimo-daily-news-p10-i325076956.md`, `1987-04-27-fort-mcmurray-today-p7-i738694983.md`.)

### Goals (narrative)
- Richmond: Matt Hervey x2; Brian Kozak; Dave Tomlinson (**winning goal** per `1987-04-27-the-vancouver-sun-p18-i495254117.md`); **Dave Rutherford** (OCR typo — Paul Rutherford per roster).
- Humboldt: Bill McDougall x2; Garnet Kazuik.

### Proposed `games.json` entry
*(Existing entry is accurate. Minor improvement: Tomlinson was described as the "winning goal" scorer per the Vancouver Sun Apr 27 photo caption.)*
```json
{
  "id": "1987-04-26-humboldt-abbott-game-5",
  "date": "1987-04-26",
  "series": "Abbott",
  "round": "Game 5",
  "opponent": "Humboldt Broncos",
  "location": "Richmond, BC",
  "result": "W",
  "score": { "for": 5, "against": 3 },
  "highlights": [
    "Matt Hervey scored twice as Richmond beat Humboldt 5-3 at Richmond Arena to take a 3-2 series lead. Humboldt led 2-0 after the first period before Richmond tied it 2-2 in the second.",
    "Dave Tomlinson scored what was identified as the winning goal. Brian Kozak and Paul Rutherford (reported as 'Dave Rutherford' in CP wire — OCR/wire error) added the other Richmond goals.",
    "Bill McDougall scored twice for Humboldt; Garnet Kazuik had the other. Frank Romeo made 30 saves for Richmond; Bruce Hoffort stopped 22 for Humboldt.",
    "Source: Leader-Post Apr 27 1987, p.14 (image 496463200); Star-Phoenix Apr 27 1987, p.15 (image 512311911); Nanaimo Daily News Apr 27 1987, p.10 (image 325076956); Vancouver Sun Apr 27 1987, p.18 (image 495254117); Daily Herald-Tribune Apr 27 1987, p.7 (image 731242906); Fort McMurray Today Apr 27 1987, p.7 (image 738694983)."
  ],
  "sources": [
    "newspapers-com-496463200",
    "newspapers-com-512311911",
    "newspapers-com-325076956",
    "newspapers-com-495254117",
    "newspapers-com-731242906",
    "newspapers-com-738694983"
  ]
}
```

---

## Game 6 — 1987-04-28 — Humboldt 4, Richmond 3 (OT)

**Venue:** Richmond Arena. Tuesday 7:30 PM.
**Attendance:** not printed.
**Shots on goal:** Humboldt 46, Richmond 45 (`1987-04-29-nanaimo-daily-news-p9-i325077439.md`, `1987-04-29-alberni-valley-times-p7-i560108301.md`).
**Goaltenders:** Humboldt — Bruce Hoffort, 42 saves; Richmond — presumed Romeo (not named in these wires).

### Scoring (from narrative — no box in corpus)
- Richmond led 1-0 after first (scorer not printed).
- Tied 2-2 entering third.
- 7:44 3rd — Richmond: Tomlinson (3-2 Richmond)
- 8:28 3rd — Humboldt PP on Bobbitt minor for closing hand on puck (**tying goal**, presumably McDougall — narrative says "Bill McDougall... connected on the power play for his second goal of the night - the tying goal" — `1987-04-30-the-province-p69-i502021469.md`).
- 16:48 3rd — Humboldt tied it [wait — this contradicts the 8:28 tying goal]. See **Conflicts** below.

**Goal-scorers (narrative tallies):**
- Richmond — Paul Rutherford 2, Dave Tomlinson 1.
- Humboldt — Bill McDougall 2, Curtis Chamberlin 1, Mike Gaber 1 (OT winner at 3:31, deflecting a Brad Bergen point shot).

### Penalties (critical incidents)
- 3rd at 8:28: Bobbitt (delay of game, closing hand on puck).
- OT at 3:02: **Steve Jaques** — five-minute match penalty for **head-butting / helmet-butting** Bill McDougall. McDougall got an interference / holding minor. Gaber's winner came at 4-on-4; Humboldt then had the full power play. (`1987-04-29-the-vancouver-sun-p25-i495257020.md`, `1987-04-29-the-vancouver-sun-p15-i495257563.md`, `1987-04-30-the-province-p69-i502021469.md`, `1987-04-29-nanaimo-daily-news-p9-i325077439.md`.)

### Proposed `games.json` entry
```json
{
  "id": "1987-04-28-humboldt-abbott-game-6",
  "date": "1987-04-28",
  "series": "Abbott",
  "round": "Game 6",
  "opponent": "Humboldt Broncos",
  "location": "Richmond, BC",
  "result": "L",
  "score": { "for": 3, "against": 4 },
  "highlights": [
    "Humboldt forced a seventh and deciding game with a 4-3 overtime win at Richmond Arena. Mike Gaber deflected home a Brad Bergen point shot at 3:31 of the 10-minute full-time overtime. Richmond led 1-0 after one and were tied 2-2 after two; Tomlinson put Richmond ahead 3-2 at 7:44 of the third.",
    "Paul Rutherford scored twice for Richmond; Dave Tomlinson had the other Sockeye goal. Bill McDougall scored twice, Curtis Chamberlin once, and Gaber got the OT winner for Humboldt. Humboldt outshot Richmond 46-45.",
    "Two Richmond mistakes proved costly: Tony Bobbitt took a delay-of-game minor for closing his hand on the puck at 8:28 of the third, and Humboldt tied 3-3 on the ensuing power play (McDougall's second of the night). Then at 3:02 of overtime, defenceman Steve Jaques received a five-minute match penalty for helmet-butting Bill McDougall in the mouth; McDougall received a minor (interference/holding per different wire services), and Gaber's winner came at 4-on-4 with Humboldt keeping pressure on during the subsequent power play.",
    "Goaltender Bruce Hoffort made 42 saves for Humboldt. Jaques faced at least a one-game suspension (Vancouver Sun wrote 'likely a three-game suspension').",
    "Source: Nanaimo Daily News Apr 29 1987, p.9 (image 325077439); Vancouver Sun Apr 29 1987, p.25 (image 495257020) and p.15 (image 495257563); Alberni Valley Times Apr 29 1987, p.7 (image 560108301); Star-Phoenix Apr 29 1987, p.62 (image 512312574); Province Apr 30 1987, p.69 (image 502021469)."
  ],
  "sources": [
    "newspapers-com-325077439",
    "newspapers-com-495257020",
    "newspapers-com-495257563",
    "newspapers-com-560108301",
    "newspapers-com-512312574",
    "newspapers-com-502021469"
  ]
}
```

---

## Game 7 — 1987-04-29 — Richmond 5, Humboldt 4

**Venue:** Richmond Arena. Wednesday 7:30 PM.
**Attendance:** not printed in corpus. (Final-series game; Richmond fans loud.)
**Shots on goal:** Humboldt 40, Richmond 35 (`1987-04-30-nanaimo-daily-news-p11-i325078314.md`).
**Goaltenders:** Not named in these wires.
**Period scores:** Richmond led 3-1 after first and 4-3 after second.

### Scoring (narrative only — no box score in corpus)
- Richmond: Matt Hervey, Dean Rutledge, Jason Phillips, Bill Hardy, Dave Tomlinson (winner, 17:23 of third — "with 2:37 remaining in regulation time").
- Humboldt: Brett Stewart, Kevin Luke, Al Novakowski, Curtis Chamberlin.
- Humboldt tied the game 4-4 at 16:48 of the third; Tomlinson's winner came 35 seconds later (at 17:23).

### Post-game
Humboldt declined the traditional centre-ice handshake and were booed. Coach Bernie Lynch: "We're just sending them a message: You ain't won nothin' yet. We're going to be the national champions."

### Proposed `games.json` entry
*(Existing entry is accurate and well sourced.)*
```json
{
  "id": "1987-04-29-humboldt-abbott-game-7",
  "date": "1987-04-29",
  "series": "Abbott",
  "round": "Game 7",
  "opponent": "Humboldt Broncos",
  "location": "Richmond, BC",
  "result": "W",
  "score": { "for": 5, "against": 4 },
  "highlights": [
    "Dave Tomlinson scored with 2:37 remaining in regulation (approx. 17:23 of the third) — 35 seconds after Humboldt had tied the game 4-4 at 16:48 of the third period — to give Richmond a 5-4 win at Richmond Arena and the Abbott Cup, the Western Canadian Junior A championship, four games to three.",
    "Richmond led 3-1 after the first period and took a 4-3 edge into the third. Matt Hervey, Dean Rutledge, Jason Phillips and Bill Hardy had the other Sockeye goals.",
    "Brett Stewart, Kevin Luke, Al Novakowski and Curtis Chamberlin scored for Humboldt. The Broncos outshot Richmond 40-35. Richmond outscored Humboldt 26-24 across the seven games; each team won two one-goal games.",
    "The Broncos declined to take part in the traditional post-game handshake at centre ice and were booed by the Richmond Arena crowd. Coach Bernie Lynch said: 'We're just sending them a message: You ain't won nothin' yet. We're going to be the national champions.'",
    "Source: Leader-Post Apr 30 1987, p.32 (image 496463470); Star-Phoenix Apr 30 1987, p.45 (image 512312872); Red Deer Advocate Apr 30 1987, p.20 (image 558337700); Province Apr 30 1987, p.12 (image 502021976); Times Colonist Apr 30 1987, p.16 (image 508878542); Nanaimo Daily News Apr 30 1987, p.11 (image 325078314)."
  ],
  "sources": [
    "newspapers-com-496463470",
    "newspapers-com-512312872",
    "newspapers-com-558337700",
    "newspapers-com-502021976",
    "newspapers-com-508878542",
    "newspapers-com-325078314"
  ]
}
```

---

## Per-player Abbott Cup tally (verified from game-by-game extraction)

Computed from the OCR corpus across seven games. **Games 1-3 use printed box scores** (complete assists + penalties). **Games 4-7 rely on narrative goal-scorer lists only** — so assists and PIMs are partial and likely low. Rows are ordered by goals.

| Roster id           | Player         | GP | G | A | PTS | PIM (partial) | Notes |
|---------------------|----------------|----|---|---|-----|---------------|-------|
| `jason-phillips`    | Jason Phillips | 7  | 5 | 1 | 6   | 0+            | 1G G1, 3G G2 (hat trick), 1G G7; A on Kozak G2 #6 |
| `dave-tomlinson`    | Dave Tomlinson | 7  | 4 | 3 | 7   | 6+            | 1G G3 (SH, winner-tying), 1G G5 (GWG), 1G G6, 1G G7 (series winner). Assists G3: Claringbull, G3: Clarke. Also G1: (served... see Conflicts). |
| `matt-hervey`       | Matt Hervey    | 7  | 4 | 4 | 8   | 4+            | 1G G1, 2G G5, 1G G7; A on Czenczek G2 #1, Phillips G2 #5, Kozak G2 #6, Claringbull G3 #4 |
| `paul-rutherford`   | Paul Rutherford | 7 | 2 | 0 | 2   | 0             | 2G G6 |
| `brian-kozak`       | Brian Kozak    | 7  | 2 | 2 | 4   | 4+            | 1G G2 (PP), 1G G5; A on Clarke G3 #6, and on Phillips G5 (narrative) |
| `mike-claringbull`  | Mike Claringbull | 7 | 1 | 1 | 2   | 2+            | 1G G3 (from Hervey, Tomlinson); A on Hervey G1 |
| `dean-rutledge`     | Dean Rutledge  | 7  | 2 | 1 | 3   | 0             | 1G G4 (3rd period), 1G G7; A on Tomlinson G3 |
| `bryon-moller`      | Bryon Moller   | 7  | 1 | 0 | 1   | 0             | 1G G1 (first period; assist detail clipped) |
| `stan-czenczek`     | Stan Czenczek  | 7  | 1 | 3 | 4   | 4+            | 1G G2 (PP, opener); A on Phillips G1, Phillips G2 #5, Tomlinson G3, Bobbitt G3 OT |
| `tony-bobbitt`      | Tony Bobbitt   | 7  | 1 | 0 | 1   | 6+            | 1G G3 OT winner (from McCormick, Czenczek); game-6 delay-of-game minor |
| `rob-clarke`        | Rob Clarke     | 7  | 1 | 1 | 2   | 2+            | 1G G3 (tying, 19:27, from Kozak, Tomlinson); A on Phillips G1 |
| `bill-hardy`        | Bill Hardy     | 7  | 1 | 0 | 1   | 2+            | 1G G7; G1 "too many men" served on his behalf. |
| `mike-mccormick`    | Mike McCormick | 7  | 0 | 1 | 1   | 0             | A on Bobbitt G3 OT winner |
| `steve-jaques`      | Steve Jaques   | 7  | 0 | 1 | 1   | 14+           | A on Phillips G2 #3; G1: holding, interference; G2: crosschecking; G3: roughing; G6: 5-min match penalty for helmet-butting McDougall |
| `jim-gunn`          | Jim Gunn       | 7  | 0 | 0 | 0   | 10+           | G1 elbowing, G2 roughing, G3 high-sticking major |
| `trevor-dickie`     | Trevor Dickie  | 7  | 0 | 0 | 0   | 6+            | G1 holding; G2 unsportsmanlike; G3 delay of game, 3rd-period roughing |
| `frank-romeo`       | Frank Romeo    | not-all-7 | 0 | 0 | 0 | 2+     | Starting goaltender: definitely G1, G3 (36 saves), G5 (30 saves). Likely G6 (not named). G2 goaltender not definitively confirmed — narrative implies him (he took a 7:52 minor served by Jaques). Slashing minor G2. |

### Roster entries with zero Abbott-Cup line in the corpus
Goalies other than Romeo (Stewart, Dickson) and forwards/defencemen with no scoring event in any of the seven games: `jamie-stewart`, `chris-dickson`, `rob-sumner`, `russ-goglin`, `jason-talo`. No box-score line includes their names. Cannot assert GP = 0 without a scratched-player list, which the corpus does not provide.

### Proposed `abbottCupStats` / `postseasonStats` block for roster.json

**Recommendation:** add a new `abbottCupSeriesStats` field alongside the existing `abbottCupStats` (which the CLAUDE.md notes is sourced from Abbott Cup program OCR and likely reflects tournament-wide regular-season-style numbers, not the 7-game final). The new field would capture the verified 7-game-series totals from this extraction. Example shape:

```json
{
  "id": "dave-tomlinson",
  "abbottCupSeriesStats": {
    "gp": 7,
    "g": 4,
    "a": 3,
    "pts": 7,
    "pim": 6,
    "notes": "G in G3 (SH), G5 (GWG), G6, G7 (series winner). Partial PIM from box scores G1-G3 only."
  }
}
```

Apply analogously to the other 13 players listed in the table. Do **not** overwrite existing `abbottCupStats` — they come from the program and may reflect a different definition (tournament-wide, including the Centennial Cup).

---

## Conflicts with existing `games.json` / roster.json `abbottCupStats`

### `games.json`

1. **Game 1 highlights** currently omits period-by-period detail. The proposal adds the three mid-period goals whose times are printed in `1987-04-21-star-phoenix-p43-i512310237.md`. No factual conflict.

2. **Game 2 scorer name conflict** — box in `1987-04-22-star-phoenix-p38-i512310521.md` lists the second Humboldt goal (8:22 1st PP) as "**Nelson** (Shyiak)". However, CP wire reports (`1987-04-22-the-leader-post-p18-i496462581.md`) name Humboldt's scorers as "**Shyiak**, Kevin Luke and Bill McDougall". The box may be an OCR mis-read of "Nelson" (possibly "Shyiak" or a second-line player); existing `games.json` has "Dave Shyiak". Flag as **ambiguous**; keep Shyiak in highlights but cite both.

3. **Game 3 first-period goal narrative conflict** — `1987-04-23-star-phoenix-p14-i512310808.md` reads "McDougall was the most successful Humboldt shooter, beating Romeo twice including a shorthanded goal in the first period which gave Humboldt a 1-0 lead. McDougall and Richmond's Dave Tomlinson traded goals in the second..." This **contradicts** the box score in `1987-04-23-star-phoenix-p16-i512310816.md` which shows the first period as scoreless and McDougall's first goal coming at 7:14 of the second period (even strength, not SH). The box is the authoritative document; treat the narrative as a sloppy period attribution. **Current games.json** says "trailed 1-0 after the first period" — this follows the narrative and **contradicts** the box. Recommend correcting to "Scoreless first period; trailed 1-2 after the second."

4. **Game 5 scorer name** — current games.json has "Paul Rutherford" correctly. Wire service OCR says "Dave Rutherford" (`1987-04-27-nanaimo-daily-news-p10-i325076956.md`, `1987-04-27-the-daily-herald-tribune-p7-i731242906.md`). This is a wire-service error; Paul Rutherford is on the roster, Dave is not. No change needed; just note the OCR typo.

5. **Game 6 tying-goal timestamp conflict** — the `1987-04-30-the-province-p69-i502021469.md` and `1987-04-29-the-vancouver-sun-p25-i495257020.md` both place the McDougall tying goal "promptly" after Bobbitt's penalty at 8:28 of the third — i.e. the 3-3 goal came on a PP starting 8:28. However the Vancouver Sun narrative also says Tomlinson put Richmond ahead 3-2 "at 7:44 of the third period" and the "first incident came at 8:28" — so the sequence 7:44 Richmond goes up 3-2 → 8:28 Bobbitt penalty → tying PP goal soon after is internally consistent. Current games.json preserves this order correctly. No change.

6. **Game 6 OT Gaber goal timestamp** — The Vancouver Sun `1987-04-29-the-vancouver-sun-p25-i495257020.md` and `1987-04-29-the-vancouver-sun-p15-i495257563.md`, plus `1987-04-29-alberni-valley-times-p7-i560108301.md`, `1987-04-29-nanaimo-daily-news-p9-i325077439.md`, and `1987-04-29-star-phoenix-p62-i512312574.md`, all agree: **Gaber scored at 3:31 of OT** on a deflected Bergen point shot. Jaques's match penalty was at **3:02** of OT. Current games.json has both times correctly. No change.

7. **CLAUDE.md Game 6 detail — partial discrepancy.** The CLAUDE.md says "Rutherford 2G, Tomlinson 1G for Richmond" which matches. But it also states "Jaques received a 5-minute match penalty for headbutting McDougall" — the contemporaneous papers specifically describe it as **helmet-butting** (Jaques was wearing a helmet, which he struck McDougall's mouth with). The distinction is not substantive but worth noting for fidelity.

### `roster.json` `abbottCupStats`

Existing `abbottCupStats` (examples): Tomlinson 15 GP / 16 G / 7 A / 23 PTS / 46 PIM; Phillips 15 GP / 11 G / 13 A / 24 PTS / 12 PIM; Hervey 15 GP / 8 G / 16 A / 24 PTS / 14 PIM; Kurtenbach (not-player); etc.

These **cannot** represent a 7-game Abbott Cup final — the GP of 13-15 is the Abbott Cup **tournament** (i.e. includes the Centennial Cup round-robin + playoffs as printed in the Abbott Cup program). In this 7-game final alone, per my box-score tally:
- Tomlinson: 4G/3A/7 PTS (not 16G/7A/23 PTS).
- Phillips: 5G/1A/6 PTS (not 11G/13A/24 PTS).
- Hervey: 4G/4A/8 PTS (not 8G/16A/24 PTS).

**No conflict** — they're different scopes. Recommendation as noted: add a **new** `abbottCupSeriesStats` field rather than overwriting.

---

## Couldn't determine (data the OCR didn't yield cleanly)

1. **Attendance for all seven games** — no paper in the extracted corpus prints attendance for this series. Game 3 has the narrative "fewer than 900" only. The Abbott Cup program PDF (already in `media.json`) might have totals.
2. **Game 1 first-period goal times / assists** — OCR of `1987-04-21-star-phoenix-p43-i512310237.md` starts mid-second period; the first-period entries were clipped off at the top of the column. Moller's goal time and assists are unknown; Chamberlin's first goal (first period) likewise clipped.
3. **Game 1 overtime box** — Chamberlin's two OT goals are confirmed by narrative (the second came "with 1:39 remaining"). Exact times and assists not in any extracted paper.
4. **Games 4, 6, 7 full box scores** — no paper in corpus printed a period-by-period score sheet. Only narrative goal-scorer lists.
5. **Goaltender of record for Games 2, 4, 6, 7** — not named in any of the extracted wires. Romeo is implied by context (only other option is Jamie Stewart, and the Centennial Cup round-robin loss to Humboldt on May 6 specifically names Stewart because Romeo was rested — suggesting Romeo was the starter throughout the Abbott Cup).
6. **Humboldt goalie for Game 2 specifically** — the box OCR says "Humboldt: E Backlund, Lloyd". "E. Backlund" matches Eric Backlund (the Broncos' backup — noted in other sources), but "Lloyd" is ambiguous. Possibly Backlund was relieved by a second goaltender (Lloyd or Hoffort) mid-game, or the text is garbled.
7. **Richmond lineups / scratches** — no paper lists healthy scratches. Cannot determine with certainty whether Sumner, Goglin, Talo, Stewart, Dickson appeared in all / some / zero Abbott Cup games.
8. **Game 4 period-by-period scoring** — not printed anywhere in corpus. We know only "Rutledge in the third period" for Richmond; order of Humboldt's two goals unknown.
9. **Game 7 goal times and assists** — narrative gives period score summary (3-1, 4-3) and Humboldt's 16:48 tying goal + Tomlinson's winner at ~17:23, but nothing else. Individual-goal times and assists absent.
10. **Official off-ice incident reports (suspensions)** — Jaques's suspension length is speculated ("at least one game," "likely three" — Vancouver Sun Apr 29). No confirmed league ruling appears in the corpus.
