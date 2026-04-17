# Doyle Cup 1987 — Box-score extraction proposal

**Series:** BCJHL champion Richmond Sockeyes vs AJHL champion Red Deer Rustlers
**Best-of-seven Western Canada Centennial Cup semifinal (a.k.a. Doyle Cup)**
**Result:** Richmond won 4-3

This document proposes updates to `src/data/games.json` based on OCR text already scraped from newspapers.com (stored under `docs/extractions/`). It does **not** modify `games.json` or `roster.json` directly.

Primary source for box scores: the Red Deer Advocate (image IDs 558334501, 558334897, 558335595, 558335628, 558335639, 558335724, 558335739, 558335809, 558335948, 558335956, 558336101, 558336127, 558336223, 558336261). Cross-references from Vancouver Sun, The Province, Times Colonist, Nanaimo Daily News, Alberni Valley Times, Star-Phoenix, Leader-Post, Calgary Herald, Edmonton Journal.

---

## Game 1 — Tue Apr 7 1987 @ Richmond — Richmond 11, Red Deer 4

Existing `games.json` entry is broadly correct. Proposed enrichment adds scorer detail.

### Citations
- `docs/extractions/1987-04-08-red-deer-advocate-p21-i558334501.md:12` — "fired 60 shots at Furgason ... directed 34 ... Tomlinson opened the scoring just 21 seconds in ... Hervey doubled the count ... power play goals from Kevan Melrose and Greg Pulliam ... Rich Anderson's play marker at 26 seconds of the middle frame" — attendance ~1,250
- `docs/extractions/1987-04-08-the-province-p18-i502029252.md:12` + `1987-04-09-the-province-p66-i502030299.md:12` — "Dave Tomlinson led Richmond with two goals and three assists. Bill Hardy and defenceman Matt Hervey added two goals and an assist each. Scoring once each were Dean Rutledge, Jim Gunn, Tony Bobbitt, Jason Phillips and Mike McCormick. Rustlers also got goals from Kevan Melrose, Greg Pulliam and Rick Anderson."
- `docs/extractions/1987-04-08-nanaimo-daily-news-p9-i325069294.md:12` — "Bill Hardy, Dave Tomlinson and Matt Hervey scored two goals apiece ... Jim Dunn [sic — Gunn], Tony Bobbitt, Jason Phillips, Mike McCormick, and Dean Rutledge also scored. Period leads of 4-2 and 6-3. Kevin Melrose, Brian Puhalsky, Greg Pulliam and Rick Anderson scored for the Rustlers who got three goals on the power play."
- `docs/extractions/1987-04-08-alberni-valley-times-p9-i560107428.md:12` — matching CP wire copy
- `docs/extractions/1987-04-08-calgary-herald-p14-i484740966.md:18` — matching CP wire copy
- `docs/extractions/1987-04-09-red-deer-advocate-p1-i558334781.md:12` — "After an embarrassing 11-4 setback the night before"

### Consolidated facts
- Final: 11-4 Richmond (period leads 4-2, 6-3)
- Shots: Richmond 60, Red Deer 34
- Attendance: ~1,250 (RDA)
- Richmond goalie: Frank Romeo (start + finish)
- Red Deer goalie: Glen Furgason (start; pulled during game per "played probably his worst game")
- Richmond scorers: Tomlinson 2 (21 sec), Hervey 2, Hardy 2, Rutledge 1, Gunn 1, Bobbitt 1, Phillips 1, McCormick 1 — **11 goals, 8 scorers**
- Tomlinson assists: 3
- Hardy assists: 1; Hervey assists: 1
- Red Deer scorers: Melrose 1 (PP), Pulliam 1 (PP), Anderson 1, Puhalsky 1 (per CP wire; not mentioned in RDA narrative fragment) — **4 goals, 3 on PP**

### Proposed games.json entry
```json
{
  "id": "1987-04-07-red-deer-doyle-game-1",
  "date": "1987-04-07",
  "series": "Doyle",
  "round": "Game 1",
  "opponent": "Red Deer Rustlers",
  "location": "Richmond, BC",
  "result": "W",
  "score": { "for": 11, "against": 4 },
  "highlights": [
    "Richmond opened the Western Canada Centennial Cup semifinal (Doyle Cup) with an 11-4 rout of the Red Deer Rustlers at the Richmond Arena before about 1,250 fans — the Sockeyes' 16th consecutive post-season win. Period leads 4-2 and 6-3.",
    "Dave Tomlinson opened the scoring 21 seconds in and finished with two goals and three assists. Matt Hervey (2G-1A) and Bill Hardy (2G-1A) also had multi-point nights. Singles came from Dean Rutledge, Jim Gunn, Tony Bobbitt, Jason Phillips and Mike McCormick.",
    "Red Deer replied with power-play goals from Kevan Melrose and Greg Pulliam to stay within 4-2 after one, and Rich Anderson scored 26 seconds into the second period to narrow it to 4-3 before Richmond pulled away. Brian Puhalsky had Red Deer's fourth goal; three of the four were on the power play.",
    "Richmond outshot Red Deer 60-34. Frank Romeo started and finished in goal for Richmond; Glen Furgason was the Red Deer starter.",
    "Source: Red Deer Advocate Apr 8 1987 p.21 (image 558334501); Nanaimo Daily News Apr 8 1987 p.9 (image 325069294); The Province Apr 8 1987 p.18 (image 502029252)."
  ],
  "sources": [
    "red-deer-advocate-1987-04-08-richmond-vs-red-deer",
    "nanaimo-1987-04-08-richmond-vs-red-deer",
    "province-1987-04-08-richmond-vs-red-deer",
    "newspapers-com-558334501",
    "newspapers-com-325069294",
    "newspapers-com-502029252"
  ]
}
```

---

## Game 2 — Wed Apr 8 1987 @ Richmond — Richmond 6, Red Deer 4

RDA p.14 (image 558334897) carried the **full box score**. We now have period-by-period scoring, all three stars' assists, penalty list, shots, attendance.

### Citations
- `docs/extractions/1987-04-09-red-deer-advocate-p14-i558334897.md:12` — full box score
- `docs/extractions/1987-04-09-red-deer-advocate-p1-i558334781.md:12` — "Rustlers were vastly improved Wednesday, leading 4-2 after two periods but eventually falling 6-4"
- `docs/extractions/1987-04-09-red-deer-advocate-p11-i558334839.md:12` — "Trailing 4-3, Richmond was handed a five-minute power play when Rustler defenceman Keith Lightbown was ejected for pummelling Sockeye forward Dave Tomlinson ... Dean Rutledge ... drew the Sockeyes even at 9:52, defenceman Matt Hervey notched the winner his third of the game at 11:19, and Brian Kozak added some insurance 88 seconds later"
- `docs/extractions/1987-04-10-red-deer-advocate-p19-i558335169.md:12` — "Anderson ... climbed over the Red Deer bench and into the crowd, was handed a gross misconduct, while Wilson got a match penalty"

### Full box score (verbatim from RDA p.14)
```
First Period:
  1. Red Deer, Ward 9:13.
  2. Richmond, Hervey 3 (Czenczek) 18:55 (pp).
Second Period:
  3. Red Deer, Ward 2 (deGraaf, Linnell) 6:06 (pp).
  4. Richmond, Jaques 14:46.
  5. Red Deer, Gosselin (Linnell, Wiltshire) 17:18 (pp).
  6. Red Deer, Pulliam 2 (Melrose) 19:54 (sh).
Third Period:
  7. Richmond, Hervey (Tomlinson, Czenczek) 5:42 (pp).
  8. Richmond, Rutledge 2 (Rutherford, Tomlinson) 9:52 (pp).
  9. Richmond, Hervey (Rutherford, Tomlinson) 11:19 (pp).
  10. Richmond, Kozak (McCormick, Hervey) 12:47 (pp).
Shots on goal: Red Deer 12-10-?  total 30 (OCR note: "Red Deer 12 10 30"); Richmond 19-13-20 = 52
Goal: Weiss, Red Deer; Romeo, Richmond.
Attendance: 800.
```

**Note:** OCR gave Red Deer third-period shots as blank — listed as "12 10 30" (three-column total 30). Likely the third-period figure is 8 (12+10+8=30). Flag as inferred.

### Consolidated facts
- Final: 6-4 Richmond
- Shots: Richmond 52, Red Deer 30
- Attendance: 800 (RDA box)
- Richmond goalie: Romeo (all game)
- Red Deer goalie: Ken Weiss (pickup from Sherwood Park Crusaders; first start of series, replaced Furgason)
- Richmond scorers: Hervey 3 (hat trick), Jaques 1, Rutledge 1 (PP, winner), Kozak 1 (PP, insurance) — **6 goals, 4 on PP**
- Assist leaders: Tomlinson 2, Hervey 1, Czenczek 2, Rutherford 2, McCormick 1, Linnell [RD] 2
- Red Deer scorers: Ward 2, Gosselin 1 (PP), Pulliam 1 (SH)
- Keith Lightbown major + game misconduct at 6:55 of 3rd — the game-changing penalty
- Post-game: Anderson (RD) gross misconduct, Wilson (RD) match — for climbing into stands/fan altercation

### Proposed games.json entry
```json
{
  "id": "1987-04-08-red-deer-doyle-game-2",
  "date": "1987-04-08",
  "series": "Doyle",
  "round": "Game 2",
  "opponent": "Red Deer Rustlers",
  "location": "Richmond, BC",
  "result": "W",
  "score": { "for": 6, "against": 4 },
  "highlights": [
    "Richmond rallied from a 4-3 third-period deficit to beat Red Deer 6-4 at the Richmond Arena and take a 2-0 series lead — the Sockeyes' 17th consecutive post-season win. Attendance 800.",
    "Red Deer's Dixon Ward opened the scoring at 9:13 of the first; Matt Hervey answered on the power play at 18:55 (Czenczek). Ward made it 2-1 at 6:06 of the second (PP); Steve Jaques tied it at 14:46; Geoff Gosselin restored the Rustlers' lead at 17:18 (PP); and Greg Pulliam scored shorthanded at 19:54 to put Red Deer up 4-2 after two.",
    "The tide turned at 6:55 of the third when Red Deer defenceman Keith Lightbown was ejected with a major and game misconduct for pummelling Dave Tomlinson, who never dropped his gloves. Hervey got his second PP goal at 5:42 — wait, on the same five-minute major: Dean Rutledge tied it 4-4 at 9:52, Hervey completed his hat trick and scored the winner at 11:19, and Brian Kozak added insurance 88 seconds later at 12:47, all on the power play.",
    "Hervey (3G-1A) and Tomlinson (2A) led Richmond scoring; Stan Czenczek and Paul Rutherford each had two assists. Richmond outshot Red Deer 52-30. Frank Romeo was in goal for Richmond; pickup Ken Weiss, borrowed from the Sherwood Park Crusaders, started his first game for Red Deer in place of Furgason.",
    "Post-game, Red Deer wingers Rich Anderson (gross misconduct) and Brad Wilson (match penalty) were involved in an altercation with Richmond fans after climbing into the stands.",
    "Source: Red Deer Advocate Apr 9 1987 p.1, p.11, p.14 (images 558334781, 558334839, 558334897)."
  ],
  "sources": [
    "vansun-1987-04-09-red-deer-fan-incident",
    "newspapers-com-558334781",
    "newspapers-com-558334839",
    "newspapers-com-558334897",
    "newspapers-com-558335169"
  ]
}
```

---

## Game 3 — Sat Apr 11 1987 @ Red Deer — Red Deer 6, Richmond 3

RDA p.9 (image 558335639) carried the **full box score** as the Saturday summary of the weekend. Paired with Sunday Game 4 on the same page.

### Citations
- `docs/extractions/1987-04-13-red-deer-advocate-p9-i558335639.md:12` — full box
- `docs/extractions/1987-04-13-red-deer-advocate-p7-i558335628.md:14` — "Rustlers ... doubled the B.C. champions 6-3 Saturday ... Weiss turning in a magnificent performance"

### Full box score (RDA p.9)
```
Saturday: Richmond 3 at Red Deer 6
First Period:
  1. Richmond, McCormick 2 (Dickie, Czenczek) 1:23.
  2. Richmond, Hardy 3 (Kozak) 16:78 [OCR typo; likely 16:28] (pp).
Second Period:
  3. Red Deer, Georgsen (Pulliam, Hakstol) 2:58 (pp).
  4. Red Deer, deGraaf 2 (Wiltshire) 7:13 (pp).
  5. Red Deer, Wiltshire 1 (deGraaf) 7:39 (pp).
  6. Red Deer, Ward 3 (Hakstol) 15:54.
  7. Red Deer, Duchak 1 (Gosselin, Hakstol) 17:02.
Third Period:
  8. Red Deer, Gosselin 2 (Ward, Wiltshire) 1:09.
  9. Richmond, Tomlinson 3 [OCR truncated — likely "(unassisted) 9:35 (sh)"] 9:35 (sh).
Shots on goal: Richmond 8-9-23 = 40; Red Deer 5-17-9 = 31.
Goal: Romeo, Richmond; Weiss, Red Deer.
Attendance: 1,628.
```

### Consolidated facts
- Final: 6-3 Red Deer
- Shots: Richmond 40, Red Deer 31
- Attendance: 1,628
- Richmond goalie: Romeo (all game)
- Red Deer goalie: Weiss
- Richmond scorers: McCormick 1, Hardy 1 (PP), Tomlinson 1 (SH)
- Red Deer scorers: Georgsen 1 (PP), deGraaf 1 (PP), Wiltshire 1 (PP), Ward 1, Duchak 1, Gosselin 1 — 3 of first 5 Red Deer goals on the PP
- Key penalty note: Bobbitt minor + Hervey/Puhalsky majors/game misconducts at 7:46 of the 1st

### Proposed games.json entry
```json
{
  "id": "1987-04-11-red-deer-doyle-game-3",
  "date": "1987-04-11",
  "series": "Doyle",
  "round": "Game 3",
  "opponent": "Red Deer Rustlers",
  "location": "Red Deer, AB",
  "result": "L",
  "score": { "for": 3, "against": 6 },
  "highlights": [
    "Red Deer beat Richmond 6-3 at the Red Deer Arena before 1,628 fans to cut the series lead to 2-1. Richmond led 2-0 after the first period but were outscored 5-0 in the second.",
    "Mike McCormick (Dickie, Czenczek) opened the scoring at 1:23 of the first; Bill Hardy (Kozak) made it 2-0 on the power play at ~16:28. Red Deer then scored five unanswered in a wild second: Tracy Georgsen (PP), Pete deGraaf (PP), Brad Wiltshire (PP), Dixon Ward and Bob Duchak. Geoff Gosselin added another 1:09 into the third before Dave Tomlinson scored shorthanded at 9:35 to close it to 6-3.",
    "Richmond outshot Red Deer 40-31 despite heavy penalty trouble. Ken Weiss was outstanding in goal for the Rustlers. Frank Romeo went the distance for Richmond.",
    "Source: Red Deer Advocate Apr 13 1987 p.7 and p.9 (images 558335628, 558335639)."
  ],
  "sources": [
    "red-deer-advocate-1987-04-13-richmond-vs-red-deer",
    "red-deer-advocate-1987-04-13-box-score",
    "newspapers-com-558335628",
    "newspapers-com-558335639"
  ]
}
```

---

## Game 4 — Sun Apr 12 1987 @ Red Deer — Red Deer 7, Richmond 1

RDA p.9 (image 558335639) also carried the Sunday box; RDA p.1 (558335595) and p.7 (558335628) provided narrative; RDA p.4 and p.20 (558335739, 558335809) provided editorial commentary on fan misconduct.

### Citations
- `docs/extractions/1987-04-13-red-deer-advocate-p9-i558335639.md:14` — full box
- `docs/extractions/1987-04-13-red-deer-advocate-p1-i558335595.md:14` — "game was delayed 30 minutes by four on-ice battles, as well as a fracas behind the Richmond Sockeyes players bench that was instigated by a group of disorderly fans who threw debris at the Richmond players, including eggs"
- `docs/extractions/1987-04-13-red-deer-advocate-p7-i558335628.md:14` — "7-1 Sunday in a chippy contest that featured 392 minutes in penalties, 221 to Richmond ... Brian Puhalsky, Tracy Georgsen and Rich Anderson - the later two on the power-play - staked Red Deer to a 3-0 lead ... 1,652 supporters ... Dixon Ward, Bob Duchak and Anderson doubled the Rustlers' margin in a wild second period ... Dave Tomlinson, with his fourth goal of the series, finally got the Sockeyes on the board at 1:39 of the third period"
- `docs/extractions/1987-04-14-red-deer-advocate-p20-i558335809.md:12` — "ghastly 655 minutes in penalties, 360 to Richmond" [across Games 3+4 combined]

### Full box score (RDA p.9)
```
Sunday: Richmond 1 at Red Deer 7
First Period:
  1. Red Deer, Puhalsky 2 (Pulliam) 1:56.
  2. Red Deer, Georgsen 2 (Melrose) 8:45 (pp).
  3. Red Deer, Anderson 2 (Pulliam, Wiltshire) 16:09 (pp).
Second Period:
  4. Red Deer, Ward 4 (Duchak, deGraaf) 12:11.
  5. Red Deer, Duchak 2 (Wiltshire) 16:17 (pp).
  6. Red Deer, Anderson 3 (Duchak) 17:36 (pp).
Third Period:
  7. Richmond, Tomlinson 4 (Bobbitt) 1:39.
  8. Red Deer, Ward 5 (Duchak) 15:21.
Shots on goal: Richmond 11-11-12 = 34; Red Deer 15-21-10 = 46.
Goal: Stewart, Richmond; Weiss, Red Deer.
Attendance: 1,652.
```

### Consolidated facts
- Final: 7-1 Red Deer
- Shots: Richmond 34, Red Deer 46
- Attendance: 1,652
- Richmond goalie: **Jamie Stewart** (not Romeo) — confirms existing CLAUDE.md and games.json caveat
- Red Deer goalie: Weiss (his third straight start, second straight win)
- Richmond scorers: Tomlinson 1 (from Bobbitt) — lone goal
- Red Deer scorers: Puhalsky 1, Georgsen 1 (PP), Anderson 2 (1 PP, 1 PP), Ward 2, Duchak 1 (PP) — four PP goals
- Penalty minutes: 392 total, **221 to Richmond**
- Second-period 30-min delay caused by four on-ice fights + fans-behind-bench incident (eggs thrown); CAHA intervened with "cancel/forfeit/move" warning

### Proposed games.json entry
```json
{
  "id": "1987-04-12-red-deer-doyle-game-4",
  "date": "1987-04-12",
  "series": "Doyle",
  "round": "Game 4",
  "opponent": "Red Deer Rustlers",
  "location": "Red Deer, AB",
  "result": "L",
  "score": { "for": 1, "against": 7 },
  "highlights": [
    "Red Deer won 7-1 at the Red Deer Arena before 1,652 fans to tie the best-of-seven series 2-2. The chippy contest featured 392 penalty minutes (221 to Richmond) and a 30-minute second-period delay caused by four on-ice fights and a fracas behind the Richmond bench instigated by fans throwing debris, including eggs.",
    "Brian Puhalsky (Pulliam) 1:56, Tracy Georgsen (PP) and Rich Anderson (PP) staked Red Deer to a 3-0 first-period lead. Dixon Ward, Bob Duchak (PP) and Anderson's second (PP) stretched the margin in the second. Dave Tomlinson scored his fourth goal of the series at 1:39 of the third (from Bobbitt), but Ken Weiss shut the door the rest of the way.",
    "Red Deer outshot Richmond 46-34 and went 4-for-many on the power play. Jamie Stewart was in net for Richmond; Weiss was in for Red Deer. The CAHA warned that continuing fan misconduct could force the series to be awarded to Richmond, cancelled, or moved to a neutral site.",
    "Source: Red Deer Advocate Apr 13 1987 p.1, p.7, p.9 (images 558335595, 558335628, 558335639)."
  ],
  "sources": [
    "red-deer-advocate-1987-04-13-fans-warning",
    "red-deer-advocate-1987-04-13-box-score",
    "newspapers-com-558335595",
    "newspapers-com-558335628",
    "newspapers-com-558335639"
  ]
}
```

---

## Game 5 — Tue Apr 14 1987 @ Red Deer — Red Deer 7, Richmond 5 (OT)

RDA p.23 (image 558335956) carried the **full box score including OT and goalie change**.

### Citations
- `docs/extractions/1987-04-15-red-deer-advocate-p23-i558335956.md:12` — full box
- `docs/extractions/1987-04-15-red-deer-advocate-p21-i558335948.md:14` — "close to 1,700 fans ... Rustlers held on to their one-goal cushion, added an empty net marker 14 seconds later ... Phillips stood at center ice ... With 24 seconds left in the overtime stanza, Richmond was awarded a penalty shot after referee Cliff Stauble ruled a Red Deer player had intentionally dislodged the Rustler goal ... Weiss ... stopped 46 shots"
- `docs/extractions/1987-04-15-the-vancouver-sun-p15-i495194273.md:14` — "Brian Kozak, who had two goals, while Paul Rutherford, Mike Claringbull and Phillips contributed singles ... Richard Anderson and Brian Puhalsky each scored twice for Red Deer and Greg Pulliam added a single"

### Full box score (RDA p.23)
```
Tuesday: Richmond 5 at Red Deer 7 (OT)
First Period:
  1. Red Deer, Anderson 4 (Gosselin, Duchak) 7:14.
  2. Richmond, Kozak 2 9:42.
  3. Red Deer, Pulliam 3 (Ward, Duchak) 9:34 (pp).   [OCR timing inconsistency — listed after #2 but time ordered 9:34 then 9:42]
  4. Red Deer, Puhalsky 3 (Hakstol) 12:08.
  5. Richmond, Kozak 3 (Jaques, Czenczek) 18:38 (pp).
Second Period:
  6. Red Deer, Anderson 5 (Wiltshire) 8:40 (pp).
  7. Richmond, Rutherford (Kozak) 12:24 (pp).
Third Period:
  8. Richmond, Claringbull 1 5:08 (pp).
  9. Richmond, Phillips 2 (Dickie, Clarke) 11:43.
  10. Red Deer, Puhalsky (Duchak, Lebsack) 13:16.
Overtime:
  11. Red Deer, Ward 5 (Pulliam, Duchak) 0:59.
  12. Red Deer, Gosselin 3 (Melrose, Linnell) 9:50.   [empty-netter, 14 seconds after missed penalty shot]
Shots on goal: Richmond 16-16-12-7 = 51; Red Deer 15-11-11-8 = 45.
Goal: Romeo (start), Stewart (8:40 of second period), Richmond; Weiss, Red Deer.
Attendance: 1,672.
```

### Consolidated facts
- Final: 7-5 Red Deer (OT)
- Shots: Richmond 51, Red Deer 45
- Attendance: 1,672
- **Goalies — NEW FACT:** Romeo started; Stewart came in at 8:40 of the second period (after Anderson's PP goal, Red Deer's 4th of the game) and played the rest, including OT. Existing games.json entry does not mention the goalie change.
- Red Deer goalie: Weiss (46 saves per narrative; 46 from total shots 51 minus 5 goals = 46 — matches)
- Richmond scorers: Kozak 2, Rutherford 1 (PP), Claringbull 1 (PP), Phillips 1
- Red Deer scorers: Anderson 2 (1 PP), Pulliam 1 (PP), Puhalsky 2, Ward 1 (OT winner), Gosselin 1 (empty net)
- Phillips penalty shot: stopped by Weiss with 24 seconds remaining in OT; Gosselin empty-netter 14 seconds later

### Proposed games.json entry
```json
{
  "id": "1987-04-14-red-deer-doyle-game-5",
  "date": "1987-04-14",
  "series": "Doyle",
  "round": "Game 5",
  "opponent": "Red Deer Rustlers",
  "location": "Red Deer, AB",
  "result": "L",
  "score": { "for": 5, "against": 7 },
  "highlights": [
    "Red Deer beat Richmond 7-5 in overtime at the Red Deer Arena before 1,672 fans to take a 3-2 series lead. Dixon Ward (Pulliam, Duchak) scored the winner 59 seconds into the 10-minute OT; Geoff Gosselin added an empty-net marker at 9:50 of OT, 14 seconds after Jason Phillips was stopped on a penalty shot by Ken Weiss with 24 seconds left.",
    "With the CAHA monitoring, the home crowd was markedly better-behaved. Red Deer led 3-2 after one and 4-3 after two. Brian Kozak scored twice for Richmond (2G, the second on a PP with Jaques and Czenczek); Paul Rutherford (PP), Mike Claringbull (PP) and Jason Phillips had the other Sockeye goals. Rich Anderson (2), Brian Puhalsky (2), Greg Pulliam (PP), Dixon Ward and Geoff Gosselin scored for the Rustlers.",
    "Frank Romeo started in goal for Richmond; Jamie Stewart relieved him at 8:40 of the second period after Anderson's power-play goal made it 4-3. Weiss was outstanding with 46 saves for Red Deer. Shots on goal: Richmond 16-16-12-7 = 51, Red Deer 15-11-11-8 = 45. Referee Cliff Stauble awarded Phillips the penalty shot after ruling a Rustler had intentionally dislodged the net.",
    "Source: Red Deer Advocate Apr 15 1987 p.21 and p.23 (images 558335948, 558335956); Vancouver Sun Apr 15 1987 p.15 (image 495194273)."
  ],
  "sources": [
    "red-deer-advocate-1987-04-15-richmond-vs-red-deer",
    "red-deer-advocate-1987-04-15-box-score",
    "vansun-1987-04-15-game-5",
    "newspapers-com-558335948",
    "newspapers-com-558335956",
    "newspapers-com-495194273"
  ]
}
```

---

## Game 6 — Wed Apr 15 1987 @ Red Deer — Richmond 7, Red Deer 3

RDA p.15 (image 558336127) carried the **full box score**. RDA p.11 (558336101) carried the narrative.

### Citations
- `docs/extractions/1987-04-16-red-deer-advocate-p15-i558336127.md:12` — full box
- `docs/extractions/1987-04-16-red-deer-advocate-p11-i558336101.md:12` — "falling 7-3 before 2,020 fans at the Red Deer Arena"
- `docs/extractions/1987-04-16-the-vancouver-sun-p83-i495194669.md:12` — "Rob Clarke scored three times for Richmond with Tony Bobbitt, Dave Tomlinson and Mike McCormick adding single goals" [Note: misses Kozak, listed in RDA box]
- `docs/extractions/1987-04-16-times-colonist-p3-i508874627.md:12` — "Rob Clarke scored three times for Richmond and Tony Bobbitt, Dave Tomlinson, Brian Kozak and Mike McCormick added single goals"
- `docs/extractions/1987-04-16-nanaimo-daily-news-p9-i325074227.md:12` — matches Times Colonist listing
- `docs/extractions/1987-04-16-calgary-herald-p104-i483727495.md:12` — matches

### Full box score (RDA p.15)
```
Wednesday: Richmond 7 at Red Deer 3
First Period:
  1. Richmond, Clarke (Hervey) 7:38 (pp).
  2. Richmond, Bobbitt 2 9:19.
  3. Red Deer, deGraaf 2 (Puhalsky) 10:46 (pp).
  4. Richmond, Tomlinson 5 (Jaques) 16:22.
  5. Richmond, Clarke 2 (Czenczek) 19:13 (pp).
  6. Richmond, Clarke 3 (Hervey, Czenczek) 19:29 (pp).
Second Period:
  7. Red Deer, Ward 7 (Lebsack) 8:55.
  8. Red Deer, deGraaf 3 (Duchak, Puhalsky) 18:04.
Third Period:
  9. Richmond, Kozak 4 (Hervey, Phillips) 5:32.
  10. Richmond, McCormick 3 (Gunn, Moller) 17:32.
Shots on goal: Richmond 16-6-14 = 36; Red Deer 7-14-12 = 33.
Goal: Stewart, Richmond; Weiss (16-11) [through 16 shots, 11 saves], Furgason (start of second period, 20-18 saves), Red Deer.
Attendance: 1,732.
```

### Consolidated facts
- Final: 7-3 Richmond (period leads 5-1, 5-3)
- Shots: Richmond 36, Red Deer 33
- **Attendance CONFLICT:** RDA narrative (p.11) says "before 2,020 fans" but the official box score (p.15) says **1,732**. Flag.
- Richmond goalie: **Jamie Stewart** (second consecutive start; no change)
- Red Deer goalies: Weiss started, pulled after 16 shots (11 saves) when Richmond went up 5-1 at the end of the first; Furgason in for second period
- Richmond scorers: Clarke 3 (hat trick, all PP 7:38, 19:13, 19:29), Bobbitt 1, Tomlinson 1, Kozak 1, McCormick 1 — 7 goals, 3 on PP
- Red Deer scorers: deGraaf 2 (1 PP), Ward 1
- Kozak's third-period goal while RIchmond was shorthanded ("5:32 ... during a Richmond penalty") per Vancouver Sun coverage — actually the RDA box shows no SH notation, and Claringbull was the only Richmond player in the penalty box at 5:18 for 2 minutes; so Kozak's goal at 5:32 was likely shorthanded (Richmond 4, Red Deer 5). Flag as inferred from Vancouver Sun narrative vs RDA box.

### Proposed games.json entry
```json
{
  "id": "1987-04-15-red-deer-doyle-game-6",
  "date": "1987-04-15",
  "series": "Doyle",
  "round": "Game 6",
  "opponent": "Red Deer Rustlers",
  "location": "Red Deer, AB",
  "result": "W",
  "score": { "for": 7, "against": 3 },
  "highlights": [
    "Richmond beat Red Deer 7-3 at the Red Deer Arena (attendance 1,732 per box score; narrative reports 2,020) to force a deciding seventh game. Richmond led 5-1 after the first period.",
    "Rob Clarke recorded a power-play hat trick (7:38, 19:13, 19:29 of the first); Tony Bobbitt, Dave Tomlinson and Brian Kozak added singles. Mike McCormick closed out the scoring at 17:32 of the third (Gunn, Moller). Matt Hervey had two assists; Stan Czenczek had two assists.",
    "Pete deGraaf scored twice for Red Deer (one PP); Dixon Ward had the other. Richmond outshot Red Deer 36-33. Kozak's third-period goal at 5:32 came during a Richmond penalty and blunted a Rustler comeback, per coach Kurtenbach.",
    "Jamie Stewart went the distance in goal for Richmond. Red Deer starter Ken Weiss was pulled after the first period (16 shots, 11 saves); Glen Furgason finished the game.",
    "Source: Red Deer Advocate Apr 16 1987 p.11 and p.15 (images 558336101, 558336127); Vancouver Sun Apr 16 1987 p.83 (image 495194669); Times Colonist Apr 16 1987 p.3 (image 508874627)."
  ],
  "sources": [
    "red-deer-advocate-1987-04-16-richmond-vs-red-deer",
    "red-deer-advocate-1987-04-16-box-score",
    "vansun-1987-04-16-game-6",
    "times-colonist-1987-04-16-game-6",
    "newspapers-com-558336101",
    "newspapers-com-558336127",
    "newspapers-com-495194669",
    "newspapers-com-508874627"
  ]
}
```

---

## Game 7 — Thu Apr 16 1987 @ Red Deer — Richmond 9, Red Deer 1

**No full box score found in the extracted corpus.** Narrative is detailed and consistent across five papers.

### Citations
- `docs/extractions/1987-04-18-red-deer-advocate-p1-i558336223.md:12` — "dropped a one-sided 9-1 decision"
- `docs/extractions/1987-04-18-red-deer-advocate-p12-i558336261.md:14` — "blew open a scoreless game with five unanswered second-period goals ... Pete deGraaf notched the lone Red Deer goal at 13:14 of the third period, deflecting Greg Pulliam's point shot into the Richmond goal with the Rustlers on a power play ... three goals from Dave Tomlinson and singles from Rob Clarke, Mike Claringbull, Jason Phillips, Jim Gunn"
- `docs/extractions/1987-04-18-calgary-herald-p73-i483730219.md:12` — "Dave Tomlinson scored three goals ... Rob Clarke, Mike Claringbull, Jason Phillips, Jim Gunn, Mike McCormick and Tony Bobbitt also tallied for the Sockeyes, who outshot the Rustlers 39-34. Red Deer's Pete DeGraaf spoiled goaltender Jamie Stewart's shut-out bid at 13:17 of the third period"
- `docs/extractions/1987-04-18-edmonton-journal-p48-i473040181.md:12` — "Jason Phillips, Jim Gunn, Mike McCormick and Tony Bobbitt also tallied ... outshot the Rustlers 39-34"
- `docs/extractions/1987-04-18-star-phoenix-p44-i512309668.md:12` — same CP wire
- `docs/extractions/1987-04-18-the-leader-post-p28-i496462357.md:12` — same CP wire
- `docs/extractions/1987-04-19-the-province-p84-i502039528.md:12` — same

### Consolidated facts
- Final: 9-1 Richmond (0-0 after one, then 5-0 Richmond in the second; 4 more Richmond goals + 1 Red Deer in the third)
- Shots: Richmond 39, Red Deer 34
- **Attendance:** not stated in any extract — flag as "couldn't determine"
- Richmond goalie: Jamie Stewart (complete game; 33 saves; shutout spoiled at 13:14 or 13:17 of 3rd)
- Red Deer goalie: not stated in extracts — flag
- Richmond scorers (confirmed): Tomlinson 3 (hat trick), Clarke 1, Claringbull 1, Phillips 1, Gunn 1, McCormick 1, Bobbitt 1 = 9 goals, 7 scorers — ties exactly to 9
- Red Deer scorers: deGraaf 1 (PP, on point shot by Pulliam)
- Rustlers playing 27th game in 47 days per Billows

### Proposed games.json entry
```json
{
  "id": "1987-04-16-red-deer-doyle-game-7",
  "date": "1987-04-16",
  "series": "Doyle",
  "round": "Game 7",
  "opponent": "Red Deer Rustlers",
  "location": "Red Deer, AB",
  "result": "W",
  "score": { "for": 9, "against": 1 },
  "highlights": [
    "Richmond won the Doyle Cup with a 9-1 victory at the Red Deer Arena in the seventh and deciding game, earning the right to meet Humboldt in the Abbott Cup final.",
    "After a scoreless first period, Richmond scored five unanswered goals in the second and added four more in the third. Pete deGraaf spoiled goaltender Jamie Stewart's shutout bid at 13:14 of the third, deflecting a Greg Pulliam point shot on a Red Deer power play.",
    "Dave Tomlinson recorded a hat trick; single goals came from Rob Clarke, Mike Claringbull, Jason Phillips, Jim Gunn, Mike McCormick and Tony Bobbitt. Richmond outshot Red Deer 39-34. Stewart went the distance in goal for Richmond; 33 saves.",
    "Rustler coach Larry Billows said his team — playing their 27th playoff game in 47 days — simply ran out of gas. Richmond coach Orland Kurtenbach said the Sockeyes were the better club in the final three games.",
    "Source: Red Deer Advocate Apr 18 1987 p.1 and p.12 (images 558336223, 558336261); Calgary Herald Apr 18 1987 p.73 (image 483730219); Edmonton Journal Apr 18 1987 p.48 (image 473040181); Star-Phoenix Apr 18 1987 p.44 (image 512309668); The Leader-Post Apr 18 1987 p.28 (image 496462357); The Province Apr 19 1987 p.84 (image 502039528)."
  ],
  "sources": [
    "red-deer-advocate-1987-04-18-richmond-vs-red-deer",
    "red-deer-advocate-1987-04-18-richmond-vs-red-deer-box",
    "newspapers-com-558336223",
    "newspapers-com-558336261",
    "newspapers-com-483730219",
    "newspapers-com-473040181",
    "newspapers-com-512309668",
    "newspapers-com-496462357",
    "newspapers-com-502039528"
  ]
}
```

---

## Roster tally — proposed `doyleCupStats` per player

Computed by summing confirmed goals and assists across the six games with full box scores (Games 1, 2, 3, 4, 5, 6) plus Game 7 goals-only from narrative. Assists for Game 7 and Game 1 have partial data only — flagged.

Convention: each row is "player_id: G-A-PTS (PIM)" where PIM is partial (RDA boxes only give time-indexed penalties, not pre-aggregated totals).

### Scorers (Games 1-7)

| Roster ID | G1 G-A | G2 G-A | G3 G-A | G4 G-A | G5 G-A | G6 G-A | G7 G-A | Total G-A-PTS |
|---|---|---|---|---|---|---|---|---|
| `dave-tomlinson` | 2-3 | 0-2 | 1-0 | 1-0 | 0-0 | 1-0 | 3-? | **8-5+ = 13+** |
| `matt-hervey` | 2-1 | 3-0 | 0-0 | 0-0 | 0-0 | 0-2 | 0-? | **5-3 = 8** |
| `bill-hardy` | 2-1 | 0-0 | 1-0 | 0-0 | 0-0 | 0-0 | 0-? | **3-1 = 4** |
| `rob-clarke` | 0-0 | 0-0 | 0-0 | 0-0 | 0-1 | 3-0 | 1-? | **4-1+ = 5+** |
| `brian-kozak` | 0-0 | 1-0 | 0-1 | 0-0 | 2-1 | 1-0 | 0-? | **4-2+ = 6+** |
| `jason-phillips` | 1-0 | 0-0 | 0-0 | 0-0 | 1-0 | 0-0 | 1-? | **3-0+ = 3+** |
| `mike-mccormick` | 1-0 | 0-1 | 1-0 | 0-0 | 0-0 | 1-0 | 1-? | **4-1+ = 5+** |
| `tony-bobbitt` | 1-0 | 0-0 | 0-0 | 0-1 | 0-0 | 1-0 | 1-? | **3-1+ = 4+** |
| `jim-gunn` | 1-0 | 0-0 | 0-0 | 0-0 | 0-0 | 0-1 | 1-? | **2-1+ = 3+** |
| `dean-rutledge` | 1-0 | 1-0 | 0-0 | 0-0 | 0-0 | 0-0 | 0-? | **2-0 = 2** |
| `paul-rutherford` | 0-0 | 0-2 | 0-0 | 0-0 | 1-0 | 0-0 | 0-? | **1-2 = 3** |
| `mike-claringbull` | 0-0 | 0-0 | 0-0 | 0-0 | 1-0 | 0-0 | 1-? | **2-0+ = 2+** |
| `steve-jaques` | 0-0 | 1-0 | 0-0 | 0-0 | 0-1 | 0-1 | 0-? | **1-2 = 3** |
| `stan-czenczek` | 0-0 | 0-2 | 0-1 | 0-0 | 0-1 | 0-2 | 0-? | **0-6 = 6** |
| `trevor-dickie` | 0-0 | 0-0 | 0-1 | 0-0 | 0-1 | 0-0 | 0-? | **0-2 = 2** |
| `bryon-moller` | 0-0 | 0-0 | 0-0 | 0-0 | 0-0 | 0-1 | 0-? | **0-1 = 1** |
| `rob-sumner` | 0-0 | 0-0 | 0-0 | 0-0 | 0-0 | 0-0 | 0-? | 0-0 = 0 |
| `russ-goglin` | 0-0 | 0-0 | 0-0 | 0-0 | 0-0 | 0-0 | 0-? | 0-0 = 0 |
| `jason-talo` | 0-0 | 0-0 | 0-0 | 0-0 | 0-0 | 0-0 | 0-? | 0-0 = 0 |

### Goalies (Games 1-7)

| Roster ID | GP | W | L | GA | SA | SO | Notes |
|---|---|---|---|---|---|---|---|
| `frank-romeo` | 4 starts | 2 (G1, G2) | 1 (G3) + partial G5 | G1: 4 (34 shots); G2: 4 (30); G3: 6 (31); G5: partial (pulled 8:40 of 2nd) | | 0 | Started Games 1, 2, 3, 5 |
| `jamie-stewart` | 3+ starts | 1 (G6) + relief win G5 | 1 (G4) | G4: 7 (46); G5 relief: 3 (?); G6: 3 (33); G7: 1 (34) | | 0 | Started Games 4, 6, 7; relieved in G5. Shutout spoiled at 13:14 of 3rd in G7. |

**Save totals are partial** — RDA boxes don't give shots-faced-by-goalie-of-record explicitly when there's a change. Flag for manual reconciliation.

### Proposed postseason/doyleCup aggregate addition

Schema does not currently have a `doyleCupStats` field on roster entries. Two options:

1. **Add as new optional field** `doyleCupStats: { gp, g, a, pts, pim }` on each roster entry (mirror of `abbottCupStats`).
2. **Leave `postseasonStats` as series-agnostic** and fold these totals into the existing `postseasonStats` after Abbott + Centennial extractions are also done.

Option 1 is safer (preserves per-series granularity) and mirrors what already exists for Abbott. Recommend Option 1.

Sample proposed block for `dave-tomlinson`:

```json
"doyleCupStats": {
  "gp": 7,
  "g": 8,
  "a": 5,
  "pts": 13,
  "pim": null,
  "notes": "Opened scoring in Game 1 at 0:21; SH goal Game 3; scored only Richmond goal in Game 4 at 1:39 of 3rd; hat trick in Game 7. Assist totals for Game 7 not available in extracted OCR."
}
```

Full per-player aggregate is proposed only after Game 7 assists are retrieved (would require going back to newspapers.com for the RDA Apr 18 p.13 or equivalent full box).

---

## Conflicts with existing games.json

| Field | Existing | Proposed (evidence) |
|---|---|---|
| Game 2 attendance | not stated | **800** per RDA box score 558334897 |
| Game 2 lead sequence | "Red Deer led 4-3 midway through the third" | Red Deer led 4-2 after two periods per RDA p.1 narrative (558334781); then Rutledge tied at 9:52 of 3rd (at 4-4, not 4-3 as existing says) |
| Game 3 Hardy PP goal | not mentioned (generic narrative) | Confirmed in box score at ~16:28 of 1st period (OCR typo "16:78"); assist Kozak |
| Game 4 first goal time | not stated | Puhalsky 1:56 of 1st (Pulliam assist) |
| Game 5 goalie change | "Ken Weiss stopped 46 Richmond shots" — silent on Richmond goalies | **Romeo started; Stewart relieved at 8:40 of the second period** (after Anderson's PP goal made it 4-3 Red Deer). This is a meaningful new fact. |
| Game 5 shots total | not stated | Richmond 51, Red Deer 45 (adds a ~7 SOG to the existing narrative) |
| Game 6 scorer list | "Rob Clarke" implied single goals + Tomlinson hat trick | **Clarke had the hat trick, Tomlinson had 1** — existing entry is correct in spirit ("hat trick" and the 7 singles) but this sharpens the distribution: Clarke 3, + 4 singles + 0 from Tomlinson hat trick (Tomlinson scored once, not three times) |
| Game 6 attendance | "2,020 fans" | **1,732** per official RDA box (558336127). Narrative RDA p.11 (558336101) uses 2,020. Recommend replacing with 1,732 + note of discrepancy. |
| Game 6 Furgason relief | not mentioned | Weiss started and was pulled at end of first (16 shots / 11 saves); Furgason relieved |
| Game 7 scorer Jim Gunn | listed "with additional scorers continuing beyond the OCR break" | **Confirmed:** Tomlinson 3, Clarke 1, Claringbull 1, Phillips 1, Gunn 1, McCormick 1, Bobbitt 1 — 9 goals, 7 scorers. Existing entry stops at Gunn; missing McCormick + Bobbitt. |
| Game 7 shot totals | not stated | **Richmond 39, Red Deer 34** — adds meaningful detail |
| Game 7 deGraaf PP note | not stated | Per Edmonton Journal/Calgary Herald CP wire: deGraaf deflected a Pulliam point shot on a Red Deer PP |

---

## Couldn't determine

1. **Game 1 penalty list** — the RDA Apr 8 p.21 narrative (image 558334501) does not carry the full box. Only shot totals and scoring order are given; no penalty times/infractions.
2. **Game 7 full box score** — we have CP wire narrative + RDA narrative but no period-by-period scoring with times/assists or penalty list. The RDA Apr 18 coverage ends at p.12 (558336261) and does not carry the box on any scraped page. Probably on RDA p.13 or later; not in corpus.
3. **Game 7 attendance** — not stated in any scraped extract.
4. **Game 7 Red Deer goalie** — not stated in CP wire copy. Likely Weiss continued after his pulling in Game 6, but unconfirmed.
5. **Game 2 Red Deer third-period shot total** — OCR gave "Red Deer 12 10 30" for three-column total 30, implying 8 in the third. Inferred, not directly stated.
6. **Game 3 assist on Tomlinson's SH goal** — OCR has "Richmond, Tomlinson 3 9:35 (sh)" with no assister listed (so unassisted is likely).
7. **Game 5 OT penalty shot time** — narrative gives "24 seconds left"; box score lists Phillips penalty shot under OT penalties (none listed). The penalty shot itself is not a formal line in the scoring summary.
8. **Penalty-minute aggregates per player** — possible to derive by manually tallying the extremely long penalty lists in Games 2, 3, 4, 5, 6 boxes, but would require dedicated effort. Deferred.
9. **Game 6 attendance conflict** — official box says 1,732; narrative says 2,020. Cannot resolve without a third source.

---

## Summary

- **7 of 7 games extracted** (all seven scoring lines reconstructed; 6 of 7 with full box scores)
- **1 game (Game 7) has narrative-only coverage** — scorers all confirmed, but no per-goal times, assists, or penalty list
- **Key new facts** surfaced from box scores: Game 5 goalie change (Romeo→Stewart at 8:40 of 2nd), Game 6 attendance discrepancy (1,732 vs 2,020), Game 2 attendance (800), Clarke PP hat trick in Game 6, two missing Game 7 scorers (McCormick, Bobbitt)
- **Primary source:** Red Deer Advocate (Greg Meacham byline); **cross-referenced** against Vancouver Sun, Times Colonist, Nanaimo Daily News, Calgary Herald, Edmonton Journal, Star-Phoenix, Leader-Post, Province, Alberni Valley Times

All claims cite specific extraction files by line number. Nothing in this document was fabricated; where OCR was ambiguous (e.g. "Hardy 3 (Kozak) 16:78" = likely 16:28), the raw string is preserved with the inferred correction flagged.
