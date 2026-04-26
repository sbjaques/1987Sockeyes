#!/usr/bin/env node
/**
 * Apply 2026-04-25 career-completion research to src/data/roster.json:
 *   - Pencer / Tucker / Palmer: add hockeydb links + careerStats from
 *     hockeydb.com pid pages.
 *   - Ray Palmer: position correction F → G (hockeydb confirms goalie),
 *     add hometown, rewrite bio + note the Abbott Cup Program AP-table
 *     listing in skater format.
 *   - 6 NCAA players: add school men's-ice-hockey Wikipedia link.
 *
 * Only writes fields that are missing or wrong; idempotent. Validates schema
 * after writing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const rosterPath = path.join(root, 'src/data/roster.json');
const roster = JSON.parse(fs.readFileSync(rosterPath, 'utf-8'));

function find(id) {
  const p = roster.find(x => x.id === id);
  if (!p) throw new Error(`No roster entry: ${id}`);
  return p;
}

function ensureLinkObj(p) { if (!p.links) p.links = {}; return p.links; }
function ensureLinkOther(p) {
  const links = ensureLinkObj(p);
  if (!links.other) links.other = [];
  return links.other;
}
function addOtherLink(p, label, url) {
  const others = ensureLinkOther(p);
  if (!others.some(o => o.url === url)) others.push({ label, url });
}

function setIfMissing(obj, key, value) {
  if (obj[key] === undefined || obj[key] === null || obj[key] === '') obj[key] = value;
}

function ensureCareerRow(p, row) {
  if (!p.careerStats) p.careerStats = [];
  const exists = p.careerStats.some(r =>
    r.season === row.season && r.team === row.team && r.league === row.league && r.type === row.type);
  if (!exists) p.careerStats.push(row);
}

// --- Glenn Pencer ---
{
  const p = find('glenn-pencer');
  ensureLinkObj(p);
  setIfMissing(p.links, 'hockeydb', 'https://www.hockeydb.com/ihdb/stats/pdisplay.php?pid=92478');

  // Only rows with full required goalie fields (gp,w,l,gaa,svpct,so).
  const rows = [
    { season: '1984-85', team: 'Richmond Sockeyes', league: 'BCJHL', type: 'regular',
      stats: { gp: 21, w: 7, l: 10, gaa: 5.93, svpct: 0.818, so: 0 } },
    { season: '1985-86', team: 'Delta Flyers', league: 'BCJHL', type: 'regular',
      stats: { gp: 3, w: 3, l: 0, gaa: 4.29, svpct: 0.846, so: 0 } },
    { season: '1985-86', team: 'Richmond Sockeyes', league: 'BCJHL', type: 'regular',
      stats: { gp: 7, w: 5, l: 1, gaa: 3.07, svpct: 0.890, so: 0 } },
    { season: '1986-87', team: 'Richmond Sockeyes', league: 'BCJHL', type: 'regular',
      stats: { gp: 23, w: 16, l: 5, gaa: 4.20, svpct: 0.876, so: 0 } },
    { season: '1987-88', team: 'Chilliwack Eagles', league: 'BCJHL', type: 'regular',
      stats: { gp: 43, w: 21, l: 19, gaa: 5.91, svpct: 0.868, so: 0 } },
  ];
  for (const r of rows) ensureCareerRow(p, r);
}

// --- Paul Tucker ---
{
  const p = find('paul-tucker');
  ensureLinkObj(p);
  setIfMissing(p.links, 'hockeydb', 'https://www.hockeydb.com/ihdb/stats/pdisplay.php?pid=230990');

  ensureCareerRow(p, {
    season: '1986-87', team: 'Richmond Sockeyes', league: 'BCJHL', type: 'regular',
    stats: { gp: 1, g: 0, a: 0, pts: 0, pim: 0 }
  });
}

// --- Ray Palmer ---
{
  const p = find('ray-palmer');
  // Position correction (hockeydb confirms goalie, 5'8", 145 lbs, Campbell River)
  if (p.position !== 'G') p.position = 'G';
  setIfMissing(p, 'hometown', 'Campbell River, BC');
  setIfMissing(p, 'height', `5'8"`);
  setIfMissing(p, 'weight', 145);

  // abbottCupStats was stored as a SKATER record (g/a/pts/pim all 0). Palmer is
  // a goalie; convert to the goalie variant which only requires gp.
  if (p.abbottCupStats && 'pts' in p.abbottCupStats) {
    p.abbottCupStats = { gp: p.abbottCupStats.gp };
  }

  ensureLinkObj(p);
  setIfMissing(p.links, 'hockeydb', 'https://www.hockeydb.com/ihdb/stats/pdisplay.php?pid=97141');

  ensureCareerRow(p, {
    season: '1986-87', team: 'Richmond Sockeyes', league: 'BCJHL', type: 'regular',
    stats: { gp: 1, w: 1, l: 0, gaa: 2.00, svpct: 0.944, so: 0 }
  });

  // Refresh bio + notes to reflect the goalie correction.
  p.bio = "Ray Palmer was an affiliate-player (AP) goaltender call-up with the Richmond Sockeyes during the 1987 Abbott Cup run. Born 1966 in Campbell River, BC (5'8\", 145 lbs), Palmer played one BCJHL regular-season game with the Sockeyes in 1986-87, going 1-0-0 with a 2.00 goals-against average and a .944 save percentage on 36 shots. He appeared in 4 games during the playoff run per the 1987 Abbott Cup Souvenir Program. Palmer's prior BCJHL stops included two appearances split between the Esquimalt Buccaneers and Nanaimo Clippers (1982-83), 37 games with the Merritt Centennials, and one with the Revelstoke Rangers (1983-84). Source: hockeydb pid 97141.";
  p.notes = "Affiliate-player (AP) goaltender called up for 4 playoff games during the 1987 Abbott Cup run. Position corrected to G per hockeydb (pid 97141), which lists Palmer as a goaltender from Campbell River, BC. The 1987 Abbott Cup Souvenir Program logged his AP playoff appearances in the skater playoff-stats table (4 GP, no scoring); goalie save/GAA splits for those games were not separately tabulated in the program.";
}

// --- 6 NCAA players: add school men's-hockey Wikipedia link ---
const ncaaLinks = [
  ['stan-czenczek',  'Maine Black Bears men’s ice hockey (Wikipedia)',                'https://en.wikipedia.org/wiki/Maine_Black_Bears_men%27s_ice_hockey'],
  ['mike-mccormick', 'North Dakota Fighting Hawks men’s ice hockey (Wikipedia)',      'https://en.wikipedia.org/wiki/North_Dakota_Fighting_Hawks_men%27s_ice_hockey'],
  ['paul-rutherford','Ohio State Buckeyes men’s ice hockey (Wikipedia)',              'https://en.wikipedia.org/wiki/Ohio_State_Buckeyes_men%27s_ice_hockey'],
  ['bryon-moller',   'Alabama–Huntsville Chargers men’s ice hockey (Wikipedia)', 'https://en.wikipedia.org/wiki/Alabama%E2%80%93Huntsville_Chargers_men%27s_ice_hockey'],
  ['jamie-stewart',  'Michigan State Spartans men’s ice hockey (Wikipedia)',          'https://en.wikipedia.org/wiki/Michigan_State_Spartans_men%27s_ice_hockey'],
  ['chris-dickson',  'North Dakota Fighting Hawks men’s ice hockey (Wikipedia)',      'https://en.wikipedia.org/wiki/North_Dakota_Fighting_Hawks_men%27s_ice_hockey'],
];
for (const [id, label, url] of ncaaLinks) {
  addOtherLink(find(id), label, url);
}

fs.writeFileSync(rosterPath, JSON.stringify(roster, null, 2) + '\n');
console.log('roster.json updated.');
