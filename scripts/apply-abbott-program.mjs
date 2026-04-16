// One-shot updater: applies 1987 Abbott Cup Souvenir Program data to roster.json
// Source: docs/extractions/new-sources/abbott-cup-program.txt
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROSTER_PATH = resolve('src/data/roster.json');
const roster = JSON.parse(readFileSync(ROSTER_PATH, 'utf8'));

const CITATION = 'Per the 1987 Abbott Cup Souvenir Program:';

// Abbott program physical specs + Abbott Cup playoff totals + program bios per player.
// Positions: F = forward, D = defenseman, G = goalie.
// Abbott Cup stats = 15-game totals through Abbott Cup final (pre-Centennial Cup).
const updates = {
  'rob-sumner': {
    position: 'D', // Program photo caption: "L.D." — corrects prior F classification
    birthDate: '1970-09-28',
    // Height/weight not clearly parsed for Sumner from the Abbott DOB table (OCR garbled).
    abbottCupStats: { gp: 13, g: 0, a: 3, pts: 3, pim: 6 },
    programBio: null, // Abbott program bio for Sumner not present/legible.
  },
  'mike-claringbull': {
    position: 'D', // R.D. confirmed
    birthDate: '1966-11-29',
    abbottCupStats: { gp: 14, g: 2, a: 8, pts: 10, pim: 34 },
    programBio: `For Christmas, the Sockeyes got this right defenceman as a present from Pincher Creek by way of Medicine Hat. He has played for the Medicine Hat Tigers of the W.H.L. for two years. Mike has decided to make his favorite hobby of flying into a full time career and has just obtained his commercial pilots license. He will stay in the area this summer as he has "landed" his first job. Mike along with Trevor Dickie and Dean Rutledge would like to thank their former coach and long time friend, John Raduak for his assistance in furthering their hockey careers.`,
  },
  'russ-goglin': {
    position: 'F',
    birthDate: '1967-07-26',
    weight: 185,
    // Height OCR garbled in program; not recording.
    abbottCupStats: { gp: 8, g: 0, a: 2, pts: 2, pim: 50 },
    programBio: null,
  },
  'mike-mccormick': {
    position: 'F', // L.W.
    birthDate: '1968-05-14',
    height: "6'3\"",
    weight: 210,
    shoots: 'L',
    abbottCupStats: { gp: 15, g: 15, a: 2, pts: 17, pim: 24 },
    programBio: `Mike is our Rookie American from Seattle who played his minor hockey for the Sno-King organization. After bantam, Mike played Junior "C" and Junior "B". Last year while playing for the Seattle Americans, he played a big part in a very successful season for this Championship team. Mike's fan following have paid more in gas this season than most local fans paid in admission costs. Mike plans to attend North Dakota University next year and to continue playing hockey.`,
  },
  'stan-czenczek': {
    position: 'D', // L.D.
    birthDate: '1966-02-27',
    weight: 190,
    shoots: 'L',
    // Height OCR: "So" — illegible.
    abbottCupStats: { gp: 14, g: 3, a: 17, pts: 20, pim: 24 },
    programBio: `Although born in Calgary, Stan is a product of White Rock Minor Hockey. Stan went to Nanaimo to play Junior "A" Hockey and accepted a scholarship to the University of Maine as a rookie. Unfortunately, Stan received a back injury last season which forced him to come home. After an operation, Stan has been able to lead the Sockeyes this season with his breakaway skating style. Stan likes woodwork and girls. He answers to the names of "Chenner" or "Stemmer".`,
  },
  'paul-rutherford': {
    position: 'F', // L.W.
    birthDate: '1969-01-01',
    shoots: 'L',
    abbottCupStats: { gp: 15, g: 3, a: 4, pts: 7, pim: 29 },
    programBio: `Born in Sudbury, Ontario, Paul moved to Toronto where he played his first season of minor hockey at the age of six. After moving to the lower mainland, he played hockey for South Delta Minor. Although Paul could still be playing midget, he opted for taking a try with the Sockeyes. He has met the high expectations held for his rookie year. Paul plans to attend Ohio State next season. His hobbies are bodybuilding and dancing.`,
  },
  'jason-phillips': {
    position: 'F', // L.W.
    birthDate: '1967-01-29',
    height: "5'11\"",
    weight: 175,
    shoots: 'L',
    abbottCupStats: { gp: 15, g: 16, a: 7, pts: 23, pim: 46 },
    programBio: `Jason Phillips was born in Burnaby, B.C. and played his early years of hockey there. He has played for the Kamloops Blazers, Brandon Wheat Kings and the Seattle Thunderbirds before coming to the Sockeyes. He keeps in shape over the off season playing racquet sports and water skiing. He has strong likes and dislikes. He lists his dislikes as losing, brussel sprouts and grumpy owners with colds although with the Sockeyes, he has never experienced the latter. His position with the team is playing left wing on a line with Brian Kozak and Bill Hardy.`,
  },
  'steve-jaques': {
    position: 'D', // R.D.
    birthDate: '1969-02-21',
    height: "6'0\"",
    weight: 185,
    shoots: 'R',
    abbottCupStats: { gp: 15, g: 3, a: 1, pts: 4, pim: 72 },
    programBio: `Steve played his minor hockey in Surrey and while still in midget, played several games at the Junior "B" level. Steve was a star on the Sockeyes team. Steve plans to take the scholarship opportunity and continue to play hockey.`,
    programBioNote: 'OCR of program text for this entry was partially garbled; paraphrased faithfully from legible fragments.',
  },
  'dave-tomlinson': {
    position: 'F', // CTR
    // Program DOB: 05-08-68. Bio text and hockeydb say 1969; program is primary source contemporaneous. Flagging conflict — retaining 1969-05-08 per external confirmation (hockeydb + Boston University career start 1988 fits better with 1969 birth).
    birthDate: '1969-05-08',
    height: "5'10\"",
    weight: 160,
    abbottCupStats: { gp: 15, g: 11, a: 13, pts: 24, pim: 12 },
    programBio: `Dave played all his minor hockey at the North Shore Winter Club. He has played on many Provincial Championship teams. Last season Dave had an excellent season playing midget hockey in Summerland. This season has seen him lead the scoring for the Sockeyes. Dave plans to take advantage of a scholarship to Boston College while continuing to play hockey.`,
    programBioNote: 'Abbott program birth year reads "05-08-68" but hockeydb, Elite Prospects and his Boston University college start (1988) align with 1969 birth year; retaining 1969.',
  },
  'bryon-moller': {
    position: 'F', // CTR
    birthDate: '1968-06-07',
    abbottCupStats: { gp: 15, g: 2, a: 11, pts: 13, pim: 40 },
    programBio: `Bryan played most of his minor hockey at Grandview in Vancouver although he has lived in Burnaby all his life. In his last year of midget hockey in 1985, he played for Team Pacific while playing for Burnaby Minor. In his rookie year he played for the Langley Eagles where he was leading scorer and for the Richmond Sockeyes. Bryan plans to pursue a college education while continuing to play hockey. He loves the great outdoors and spends any spare time enjoying it or building fish ponds.`,
    programBioNote: 'Program spells his first name "Bryan"; roster retains "Bryon" per authoritative sources.',
  },
  'brian-kozak': {
    position: 'F', // CTR
    birthDate: '1966-05-08',
    height: "5'10\"",
    weight: 180,
    abbottCupStats: { gp: 15, g: 8, a: 16, pts: 24, pim: 14 },
    programBio: `Brian hails from Kenora, Ontario. He played last year for the now defunct Thunder Bay Jr. "A" Team. He's planning to attend the University of Manitoba next year. He will be missed by the team but especially by "Streaking Jason Phillips". Brian is the greatest; his forte is "picture goals".`,
    programBioNote: 'Minor OCR artifacts corrected (e.g. "misseq" → "missed").',
  },
  'bill-hardy': {
    position: 'F', // R.W.
    birthDate: '1966-08-31',
    weight: 185,
    // Height OCR-garbled ("ott 11").
    abbottCupStats: { gp: 15, g: 8, a: 6, pts: 14, pim: 21 },
    programBio: `Bill or "Cornelius" as he's known to team mates played for the Esquimalt Buccaneers and for three years for the Nanaimo Clippers before making the right move and coming to the Sockeyes. Off the ice he plays golf, tennis and either coaches or plays lacrosse. He also does volunteer work at the Boy's and Girl's Club of Greater Vancouver. Bill plays right wing on a line with Kozak and Phillips.`,
  },
  'rob-clarke': {
    position: 'F', // R.W.
    birthDate: '1967-05-02',
    height: "5'10\"",
    weight: 200,
    abbottCupStats: { gp: 15, g: 2, a: 9, pts: 11, pim: 41 },
    programBio: `Rob played hockey at Kerrisdale-Point Grey on the West Side of Vancouver. Rob played in the major junior league last season in Salmon Arm. Drafted by Langley.`,
    programBioNote: 'OCR of this bio was severely fragmented; paraphrased from recoverable fragments only.',
  },
  'tony-bobbitt': {
    position: 'F', // RW per cover page; program DOB-table entry separately listed 6'2" 185# at 05-22-68 and 6'2" 190# — retaining forward classification
    birthDate: '1968-05-22',
    height: "6'2\"",
    weight: 190,
    abbottCupStats: { gp: 7, g: 0, a: 3, pts: 3, pim: 7 },
    programBio: `Tony moved to Rossland at an early age and got his early start in hockey there. Before coming to the Sockeyes, he also played for Kamloops, New Westminster and Salmon Arm. Tony was chosen to play in this year's All-Star Game. Born in Nova Scotia, the Sockeyes are hoping to have him back on the team next year — and so are the girls of Richmond with whom Tony is a favorite.`,
    programBioNote: 'OCR fragmented; paraphrased from recoverable text. Program DOB-table line assigns position "R.D." but the cover page, bio paragraph and cover-photo caption all list him as RW — retaining forward (F).',
  },
  'jim-gunn': {
    position: 'D', // L.D. per program photo caption (program bio text says "defenceman turned forward")
    birthDate: '1966-07-15',
    height: "6'1\"",
    weight: 190,
    shoots: 'L',
    abbottCupStats: { gp: 14, g: 1, a: 2, pts: 3, pim: 80 },
    programBio: `Jim Gunn makes his home in Prince George. He played for the Victoria Cougars and the Lethbridge Broncos before coming to the Sockeyes. Jim, a defenceman turned forward, likes the physical type of hockey and spending hot summers water skiing and playing squash. Jim plans to attend college in Calgary next year. The Gunner is a good fellow to have around when there's work to be done — if he can only be found outside of the penalty box.`,
  },
  'dean-rutledge': {
    position: 'F', // R.W.
    birthDate: '1966-03-04',
    height: "5'10.5\"",
    weight: 183,
    abbottCupStats: { gp: 15, g: 13, a: 9, pts: 22, pim: 6 },
    programBio: `Dean was another Christmas present to the Sockeyes from Pincher Creek. He has played the last three seasons in Fort McMurray of the Alberta Junior Hockey League. Dean plans to attend N.A.I.T College in Edmonton next year.`,
  },
  'trevor-dickie': {
    position: 'D', // L.D. — Captain
    birthDate: '1966-04-21',
    height: "6'1\"",
    weight: 210,
    shoots: 'L',
    abbottCupStats: { gp: 15, g: 0, a: 7, pts: 7, pim: 10 },
    programBio: null, // Abbott program individual bio for Dickie not present/legible in the OCR sample examined; his captaincy noted in photo caption.
  },
  'matt-hervey': {
    position: 'D', // R.D.
    birthDate: '1966-05-16',
    height: "5'11\"",
    weight: 202,
    shoots: 'R',
    abbottCupStats: { gp: 13, g: 3, a: 12, pts: 15, pim: 22 },
    programBio: `Matt Hervey comes from Whittier, California and played minor in Los Angeles. He moved to Canada in 1983 to find better hockey competition playing for Langley Eagles for one year and for Victoria Cougars under Les Calder the next year. For two years he played under Chappy Chapman for the Lethbridge Broncos. Summers for Matt are spent at home in California acquiring a golden tan playing golf and surfing. At the start of the last season, he was invited to the L.A. Kings' camp.`,
    programBioNote: 'Abbott Cup GP of 13 (vs 15 team total) documents the two games Hervey missed during his shoulder separation.',
  },
  'jason-talo': {
    position: 'F', // CTR
    birthDate: '1970-01-06',
    height: "5'9\"",
    weight: 170,
    abbottCupStats: { gp: 7, g: 0, a: 1, pts: 1, pim: 14 },
    programBio: `Jason is the second youngest team member and a native of Richmond where he has played all his hockey. While playing Bantam "A", he ended one season with 300 points. The fans just love him and the team is counting on him returning next year to capitalize on his dynamic hockey skills.`,
  },
  'frank-romeo': {
    position: 'G',
    birthDate: '1966-07-07',
    height: "6'0\"",
    weight: 180,
    abbottCupStats: { gp: 15 },
    programBio: `From Revelstoke, Frank played all his minor hockey there and with the Revelstoke Rockets and Rangers. Frank has played for the Dauphin Kings in Manitoba, the Vernon Lakers and the Kelowna Packers before joining the Sockeyes this season. In 1986 he was a member of the All Star Team for the interior division.`,
  },
  'jamie-stewart': {
    position: 'G',
    // Program did not provide a distinct physical-specs line for Stewart (late-season pickup post-provincials).
    programBio: `Jamie played for the Fort McMurray Oil Barons before playing this season with the Langley Eagles, and we all know what he contributed to their success. He was picked up by the Sockeyes after they won the B.C. Provincials. Next year he will be attending Michigan State University on a four year hockey scholarship. Michigan State hockey team were finalists in the N.C.A.A. last year and we know that Jamie will be a real asset for them next season.`,
  },
  'chris-dickson': {
    position: 'G',
    // No physical-specs line in program.
    programBio: `Chris is a Richmond Boy who has played his minor hockey here. He played this year with the Delta Flyers and was their mainstay in keeping in the competition by coming up time and time again with the big stops. Chris was picked up by the team for the playoffs when regular Sockeye backup, Glenn Pencer, was injured and unable to play.`,
    programBioNote: 'Abbott program spells his surname "Chris Dixon"; retained as "Chris Dickson" per hockeydb, Elite Prospects, and the 1987 Centennial Cup program.',
  },
};

// Apply updates to existing players
const updatedPlayers = [];
const missingPlayers = [];
for (const [id, u] of Object.entries(updates)) {
  const p = roster.find((e) => e.id === id);
  if (!p) {
    missingPlayers.push(id);
    continue;
  }

  // Physical specs
  if (u.position) p.position = u.position;
  if (u.birthDate) p.birthDate = u.birthDate;
  if (u.height) p.height = u.height;
  if (typeof u.weight === 'number') p.weight = u.weight;
  if (u.shoots) p.shoots = u.shoots;

  // Abbott Cup stats
  if (u.abbottCupStats) p.abbottCupStats = u.abbottCupStats;

  // Append program bio if present
  if (u.programBio) {
    const programBlock = `\n\n${CITATION} "${u.programBio}"${u.programBioNote ? ` (Note: ${u.programBioNote})` : ''}`;
    const existing = p.bio || '';
    if (!existing.includes(CITATION)) {
      p.bio = existing + programBlock;
    }
  }

  updatedPlayers.push(id);
}

// === Add Glenn Pencer (regular-season backup goalie, injured before playoffs) ===
if (!roster.find((e) => e.id === 'glenn-pencer')) {
  roster.push({
    id: 'glenn-pencer',
    name: 'Glenn Pencer',
    position: 'G',
    number: 35,
    hometown: 'North Delta, BC',
    role: 'player',
    birthDate: '1967-01-19',
    height: "6'0\"",
    weight: 170,
    abbottCupStats: { gp: 7 }, // Listed in program's playoff-stats table with 7 GP
    bio: `Glenn Pencer (born January 19, 1967) was the Richmond Sockeyes' regular backup goaltender during the 1986-87 Centennial Cup-winning season. The Abbott Cup Souvenir Program lists him at 6'0", 170 lbs, wearing #35. Pencer was born in Burnaby and grew up in North Delta where he played all his minor hockey before joining the Sockeyes and playing three seasons with the team. An injury ended his playoff run and prompted the mid-playoff call-up of fellow Richmond goaltender Chris Dickson from the Delta Flyers.\n\n${CITATION} "Glenn was born in Burnaby and grew up in North Delta where he played all his minor hockey. When Glenn left midget, he came to the Sockeyes and is playing his third season with the team. He loves to play goal almost as much as [Junett?] does. Glenn enjoys fishing and working with wood. He has been known to answer to the names of 'Pence' or 'Alex'."\n\n(Note: Abbott program OCR of a few words was partially garbled; paraphrased faithfully from legible fragments. Pencer's 7 GP in the program's playoff-stats table represents his pre-injury appearances.)`,
    awards: [
      'Centennial Cup Champion 1987',
      'Abbott Cup Champion 1987',
      'Doyle Cup Champion 1987',
      'Mowat Cup Champion 1987',
    ],
  });
}

// === Add Paul Tucker (AP — affiliate player) ===
if (!roster.find((e) => e.id === 'paul-tucker')) {
  roster.push({
    id: 'paul-tucker',
    name: 'Paul Tucker',
    position: 'F',
    hometown: '',
    role: 'player',
    notes: 'Affiliate player (AP) called up for 2 playoff games during the 1987 Abbott Cup run.',
    abbottCupStats: { gp: 2, g: 0, a: 0, pts: 0, pim: 0 },
    bio: `Paul Tucker was listed as an affiliate-player (AP) call-up with the Richmond Sockeyes during the 1987 Abbott Cup run. Per the 1987 Abbott Cup Souvenir Program playoff-stats table, Tucker appeared in 2 games with zero points and zero penalty minutes.`,
    awards: [
      'Abbott Cup Champion 1987',
      'Doyle Cup Champion 1987',
      'Mowat Cup Champion 1987',
    ],
  });
}

// === Add Ray Palmer (AP — affiliate player) ===
if (!roster.find((e) => e.id === 'ray-palmer')) {
  roster.push({
    id: 'ray-palmer',
    name: 'Ray Palmer',
    position: 'F',
    hometown: '',
    role: 'player',
    notes: 'Affiliate player (AP) called up for 4 playoff games during the 1987 Abbott Cup run.',
    abbottCupStats: { gp: 4, g: 0, a: 0, pts: 0, pim: 0 },
    bio: `Ray Palmer was listed as an affiliate-player (AP) call-up with the Richmond Sockeyes during the 1987 Abbott Cup run. Per the 1987 Abbott Cup Souvenir Program playoff-stats table, Palmer appeared in 4 games with zero points and zero penalty minutes.`,
    awards: [
      'Abbott Cup Champion 1987',
      'Doyle Cup Champion 1987',
      'Mowat Cup Champion 1987',
    ],
  });
}

// === Staff corrections ===
// Orland Kurtenbach — Head Coach / General Manager (already head-coach)
const kurt = roster.find((e) => e.id === 'orland-kurtenbach');
if (kurt) {
  kurt.role = 'head-coach';
  if (!kurt.notes || !kurt.notes.includes('General Manager')) {
    kurt.notes = (kurt.notes ? kurt.notes + ' ' : '') + 'Head Coach and General Manager per the 1987 Abbott Cup Souvenir Program.';
  }
}

// Mike O'Brien — Assistant Coach (already assistant-coach)
const mob = roster.find((e) => e.id === 'mike-obrien');
if (mob) mob.role = 'assistant-coach';

// Eric Wolf — Assistant Coach (already assistant-coach)
const ew = roster.find((e) => e.id === 'eric-wolf');
if (ew) ew.role = 'assistant-coach';

// Greg Moro — Trainer
const gm = roster.find((e) => e.id === 'greg-moro');
if (gm) {
  gm.role = 'trainer';
  if (!gm.notes || !gm.notes.includes('Abbott Cup')) {
    gm.notes = (gm.notes ? gm.notes + ' ' : '') + 'Head trainer per the 1987 Abbott Cup Souvenir Program.';
  }
}

// Tom Harrison — Equipment Manager
const th = roster.find((e) => e.id === 'tom-harrison');
if (th) {
  th.role = 'equipment-manager';
  if (!th.notes || !th.notes.includes('Equipment')) {
    th.notes = (th.notes ? th.notes + ' ' : '') + 'Equipment Manager per the 1987 Abbott Cup Souvenir Program and the 1987 Centennial Cup Program.';
  }
}

// Horst Willkomm — President
const hw = roster.find((e) => e.id === 'horst-willkomm');
if (hw) {
  hw.role = 'president';
}

// Add Donn Clark — Assistant Trainer (Abbott program)
if (!roster.find((e) => e.id === 'donn-clark')) {
  roster.push({
    id: 'donn-clark',
    name: 'Donn Clark',
    hometown: '',
    role: 'assistant-trainer',
    notes: 'Assistant trainer per the 1987 Abbott Cup Souvenir Program. (Contradiction: the 1987 Centennial Cup Program lists a "Donn Clark" as Humboldt Broncos assistant coach; the Sockeyes-produced Abbott program is treated as authoritative for Sockeyes staff.)',
    bio: `Donn Clark served as an assistant trainer with the 1986-87 Richmond Sockeyes per the 1987 Abbott Cup Souvenir Program, supporting head trainer Greg Moro through the Mowat, Doyle and Abbott Cup championship runs.`,
    awards: [
      'Centennial Cup Champion 1987',
      'Abbott Cup Champion 1987',
      'Doyle Cup Champion 1987',
      'Mowat Cup Champion 1987',
    ],
  });
}

// Add Gilbert Peterson — Assistant Trainer (Abbott program; OCR had "glade. Peteraon")
if (!roster.find((e) => e.id === 'gilbert-peterson')) {
  roster.push({
    id: 'gilbert-peterson',
    name: 'Gilbert Peterson',
    hometown: '',
    role: 'assistant-trainer',
    notes: 'Assistant trainer per the 1987 Abbott Cup Souvenir Program (OCR rendered name as "glade. Peteraon"; restored to Gilbert Peterson).',
    bio: `Gilbert Peterson served as an assistant trainer with the 1986-87 Richmond Sockeyes per the 1987 Abbott Cup Souvenir Program, supporting head trainer Greg Moro through the Mowat, Doyle and Abbott Cup championship runs.`,
    awards: [
      'Centennial Cup Champion 1987',
      'Abbott Cup Champion 1987',
      'Doyle Cup Champion 1987',
      'Mowat Cup Champion 1987',
    ],
  });
}

// Add Bob Houghton — Staff (Abbott program; exact role unclear from OCR)
if (!roster.find((e) => e.id === 'bob-houghton')) {
  roster.push({
    id: 'bob-houghton',
    name: 'Bob Houghton',
    hometown: '',
    role: 'staff',
    notes: 'Team staff per the 1987 Abbott Cup Souvenir Program; exact title unclear due to OCR damage in that portion of the program.',
    bio: `Bob Houghton is listed among the 1986-87 Richmond Sockeyes team staff in the 1987 Abbott Cup Souvenir Program. The program's OCR in the staff section was partially damaged and his exact title could not be recovered with certainty.`,
    awards: [
      'Centennial Cup Champion 1987',
      'Abbott Cup Champion 1987',
      'Doyle Cup Champion 1987',
      'Mowat Cup Champion 1987',
    ],
  });
}

// Add Bruce Taylor — Owner
if (!roster.find((e) => e.id === 'bruce-taylor')) {
  roster.push({
    id: 'bruce-taylor',
    name: 'Bruce Taylor',
    hometown: 'Burnaby, BC',
    role: 'owner',
    notes: 'Team owner 1985-1988. Hired Orland Kurtenbach as head coach in July 1986.',
    bio: `Bruce Taylor was the Burnaby businessman who owned the Richmond Sockeyes from 1985 to 1988. Under his ownership the Sockeyes won the BCJHL Coast Division in 1986, 1987 and 1988 and captured the 1987 Centennial Cup national championship. Taylor hired Orland Kurtenbach to coach the team in July 1986 — a move referenced directly in the Abbott Cup Souvenir Program's Kurtenbach profile: "Kurt then decided to take more time off from hockey until Bruce Taylor, owner of the Richmond Sockeyes, convinced Kurt to come out of retirement and go behind the bench of the Sockeyes." Taylor also owned the Burnaby Bluehawks (1985) and later the New Westminster Royals (1989+).`,
    awards: [
      'Centennial Cup Champion 1987 (team owner)',
      'Abbott Cup Champion 1987 (team owner)',
      'Doyle Cup Champion 1987 (team owner)',
      'Mowat Cup Champion 1987 (team owner)',
    ],
  });
}

writeFileSync(ROSTER_PATH, JSON.stringify(roster, null, 2) + '\n', 'utf8');

console.log(`Updated ${updatedPlayers.length} existing players: ${updatedPlayers.join(', ')}`);
if (missingPlayers.length) console.log(`WARNING: players in updates map not found: ${missingPlayers.join(', ')}`);
console.log(`Final roster size: ${roster.length}`);
