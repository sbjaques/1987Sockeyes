"""Apply program-sourced enrichments to src/data/roster.json.

New fields populated per player (all optional):
  - programBio        (verbatim/lightly cleaned mini-bio from souvenir program)
  - aliases           (nicknames)
  - priorTeams        (ordered list of pre-Sockeyes teams)
  - linemates         (roster ids of regular linemates)
  - scoutingNotes     (short 1987 assessment)
  - personalDetails   ({hobbies, likes, dislikes, college})

Sources:
  - Abbott Cup Souvenir Program OCR (docs/extractions/new-sources/abbott-cup-program.txt)
  - Centennial Cup Souvenir Program OCR (docs/extractions/new-sources/centennial-cup-program.txt)

Also appends new entries for Jackie Wolf (booster club) and John Raduak
(Pincher Creek mentor coach) as `staff` role if not present.

Safe to re-run; existing fields not overwritten unless the value is the
empty-defaults we wrote in a prior run.
"""
import json
from pathlib import Path

ROSTER = Path(__file__).resolve().parents[1] / "src" / "data" / "roster.json"

ENRICH = {
    "chris-dickson": {
        "programBio": (
            "Chris is a Richmond boy who has played his minor hockey here. "
            "He played this year with the Delta Flyers and was their mainstay in "
            "keeping them in competition by coming up time and time again with the big stops. "
            "Chris was picked up by the team for the playoffs when regular Sockeye back-up, "
            "Glenn Pencer, was injured and unable to play."
        ),
        "priorTeams": ["Richmond Minor Hockey", "Delta Flyers (1986-87)"],
        "scoutingNotes": "Playoff emergency call-up after Pencer's injury; known for timely big saves.",
    },
    "jamie-stewart": {
        "programBio": (
            "Jamie played for the Fort McMurray Oil Barons before playing this season with the "
            "Langley Eagles, and we all know what he contributed to their success. He was picked "
            "up by the Sockeyes after they won the B.C. Provincials. Next year he will be "
            "attending Michigan State University on a four-year hockey scholarship. Michigan "
            "State's hockey team were finalists in the N.C.A.A. last year, and we know that "
            "Jamie will be a real asset for them next season."
        ),
        "priorTeams": ["Fort McMurray Oil Barons (AJHL)", "Langley Eagles (1986-87 BCJHL)"],
        "personalDetails": {"college": "Michigan State University (NCAA, 4-year scholarship)"},
        "scoutingNotes": "Added for Centennial Cup run after BC Provincials. Headed to Michigan State — 1986 NCAA finalists.",
    },
    "mike-claringbull": {
        "programBio": (
            "For Christmas, the Sockeyes got this right defenceman as a present from Pincher "
            "Creek by way of Medicine Hat. He has played for the Medicine Hat Tigers of the "
            "W.H.L. for two years. Mike has decided to make his favorite hobby of flying into a "
            "full-time career and has just obtained his commercial pilot's license. He will stay "
            "in the area this summer as he has 'landed' his first job. Mike, along with Trevor "
            "Dickie and Dean Rutledge, would like to thank their former coach and long-time "
            "friend, John Raduak, for his assistance in furthering their hockey careers."
        ),
        "priorTeams": ["Pincher Creek Minor Hockey", "Medicine Hat Tigers (WHL, 2 seasons)"],
        "personalDetails": {"hobbies": ["flying (commercial pilot)"]},
        "scoutingNotes": "Montreal Canadiens draft pick; commercial pilot license; joined Sockeyes at Christmas via Medicine Hat.",
    },
    "dean-rutledge": {
        "programBio": (
            "Dean was another Christmas present to the Sockeyes from Pincher Creek. He has "
            "played the last three seasons in Fort McMurray of the Alberta Junior Hockey "
            "League. Dean plans to attend N.A.I.T. College in Edmonton next year."
        ),
        "priorTeams": ["Pincher Creek Minor Hockey", "Fort McMurray Oil Barons (AJHL, 3 seasons)"],
        "personalDetails": {"college": "N.A.I.T. (Northern Alberta Institute of Technology), Edmonton"},
        "scoutingNotes": "Key playoff contributor per Centennial Cup program. Christmas-acquired from Fort McMurray.",
    },
    "trevor-dickie": {
        "programBio": (
            "Dickie played in the Western Hockey League with the New Westminster Bruins, and "
            "last season was a member of the University of Calgary Dinosaurs."
        ),
        "priorTeams": [
            "Pincher Creek Minor Hockey",
            "New Westminster Bruins (WHL)",
            "University of Calgary Dinosaurs (CIAU, 1985-86)",
        ],
        "scoutingNotes": "1986-87 team captain. Returning from CIAU after WHL tenure.",
    },
    "stan-czenczek": {
        "programBio": (
            "Although born in Calgary, Stan is a product of White Rock Minor Hockey. Stan went "
            "to Nanaimo to play Junior 'A' hockey and accepted a scholarship to the University "
            "of Maine as a rookie. Unfortunately, Stan received a back injury last season which "
            "forced him to come home. After an operation, Stan has been able to lead the "
            "Sockeyes this season with his breakaway skating style. Stan likes woodwork and "
            "girls. He answers to the names of 'Chenner' or 'Stemmer'."
        ),
        "aliases": ["Chenner", "Stemmer"],
        "priorTeams": [
            "White Rock Minor Hockey",
            "Nanaimo Clippers (BCJHL)",
            "University of Maine (NCAA, injury-shortened)",
        ],
        "personalDetails": {"hobbies": ["woodwork"], "likes": ["girls"]},
        "scoutingNotes": "Returning from back surgery; breakaway skating style; 1986-87 leader on the blue line.",
    },
    "dave-tomlinson": {
        "programBio": (
            "Dave played all his minor hockey at the North Shore Winter Club. He has played on "
            "many Provincial Championship teams. Last season Dave had an excellent season "
            "playing midget hockey in Summerland. This season has seen him lead the scoring for "
            "the Sockeyes. Dave plans to take advantage of a scholarship to Boston College "
            "[verified later as Boston University] while continuing to play hockey."
        ),
        "priorTeams": [
            "North Shore Winter Club Minor (multi-time BC Provincial champions)",
            "Summerland Midget (1985-86)",
        ],
        "personalDetails": {"college": "Boston University (NCAA, hockey scholarship)"},
        "scoutingNotes": (
            "18 y/o centerman; 43 G, 65 A, 108 pts in 51 games — 2nd in BCJHL scoring. Team's "
            "top scorer in both regular season and playoffs per Centennial Cup program."
        ),
    },
    "paul-rutherford": {
        "programBio": (
            "Born in Sudbury, Ontario, Paul moved to Toronto where he played his first season "
            "of minor hockey at the age of six. After moving to the lower mainland, he played "
            "hockey for South Delta Minor. Although Paul could still be playing midget, he "
            "opted for taking a try with the Sockeyes. He has met the high expectations held "
            "for his rookie year. Paul plans to attend Ohio State next season. His hobbies are "
            "bodybuilding and dancing."
        ),
        "priorTeams": [
            "Toronto Minor Hockey (from age 6)",
            "South Delta Minor",
        ],
        "personalDetails": {
            "hobbies": ["bodybuilding", "dancing"],
            "college": "Ohio State University",
        },
        "scoutingNotes": "Rookie playing up from midget eligibility; met high preseason expectations.",
    },
    "mike-mccormick": {
        "programBio": (
            "Mike is our Rookie American from Seattle who played his minor hockey for the "
            "Sno-King organization. After bantam, Mike played Junior 'C' and Junior 'B'. Last "
            "year while playing for the Seattle Americans, he played a big part in a very "
            "successful season for this Championship team. Mike's fan following have paid more "
            "in gas this season than most local fans paid in admission costs. Mike plans to "
            "attend North Dakota University next year and to continue playing hockey."
        ),
        "priorTeams": [
            "Sno-King Minor Hockey (WA)",
            "Seattle-area Junior C",
            "Seattle-area Junior B",
            "Seattle Americans (Junior, championship season)",
        ],
        "personalDetails": {"college": "University of North Dakota (NCAA)"},
        "scoutingNotes": (
            "Rookie American import. Seattle fan following 'paid more in gas this season than "
            "most local fans paid in admission costs'."
        ),
    },
    "glenn-pencer": {
        "programBio": (
            "Glenn was born in Burnaby and grew up in Delta where he played all his minor "
            "hockey. When Glenn left midget, he came to the Sockeyes and is playing his third "
            "season with the team. He loves to play goal almost as much as Jamie [Stewart] "
            "does. He has been known to answer to the names of 'Pence' or 'Alex'."
        ),
        "aliases": ["Pence", "Alex"],
        "priorTeams": ["North Delta Minor Hockey"],
        "scoutingNotes": "Third season with the Sockeyes (1984-87); regular backup until playoff injury.",
    },
    "bryon-moller": {
        "programBio": (
            "Bryan played most of his minor hockey at Grandview in Vancouver although he has "
            "lived in Burnaby all his life. In his last year of midget hockey in 1985, he "
            "played for Team Pacific while playing for Burnaby Minor. In his rookie year he "
            "played for the Langley Eagles where he was leading scorer, and for the Richmond "
            "Sockeyes. Bryan plans to pursue a college education while continuing to play "
            "hockey. He loves the great outdoors and spends any spare time enjoying it or "
            "building fish ponds."
        ),
        "priorTeams": [
            "Grandview / Burnaby Minor Hockey",
            "Team Pacific (1985 midget select)",
            "Langley Eagles (rookie Junior A — leading scorer)",
        ],
        "personalDetails": {"hobbies": ["the outdoors", "building fish ponds"]},
        "scoutingNotes": (
            "18 y/o centerman; 27 G, 64 A, 91 pts in 50 games — 6th in BCJHL scoring. Langley "
            "leading-scorer rookie before joining Sockeyes."
        ),
    },
    "steve-jaques": {
        "programBio": (
            "Steve played his minor hockey in Surrey and while still in midget, played several "
            "games at the Junior 'B' level. Steve was a starter on the Sockeyes team this year."
        ),
        "priorTeams": [
            "Surrey Minor Hockey",
            "Surrey-area Junior B (spot games as midget)",
        ],
        "scoutingNotes": "Full-time starter on defence in his Sockeyes season.",
    },
    "rob-clarke": {
        "programBio": (
            "Rob, from the west side of Vancouver, played his minor hockey at Arbutus / "
            "Point Grey. He played in the major junior league before a stint in Salmon Arm. "
            "Drafted by Langley."
        ),
        "priorTeams": [
            "Arbutus / Point Grey Minor Hockey (Vancouver)",
            "Major junior tenure",
            "Salmon Arm",
            "Langley Eagles (BCJHL, start of 1986-87)",
        ],
        "scoutingNotes": (
            "19 y/o centerman; joined Sockeyes mid-season from Langley. Finished 3rd in BCJHL "
            "scoring: 65 G, 38 A, 103 pts in 50 games."
        ),
    },
    "matt-hervey": {
        "programBio": (
            "Matt Hervey comes from Whittier, California and played minor in Los Angeles. He "
            "moved to Canada in 1983 to find better hockey competition, playing for Langley "
            "Eagles for one year and for Victoria Cougars under Les Calder the next year. For "
            "two years he played under Chappy Chapman for the Lethbridge Broncos. Summers for "
            "Matt are spent at home in California acquiring a golden tan, playing golf and "
            "surfing. At the start of the last season, he was invited to the L.A. Kings' camp."
        ),
        "priorTeams": [
            "Los Angeles Minor Hockey (CA)",
            "Langley Eagles (1983-84 BCJHL)",
            "Victoria Cougars under Les Calder (WHL)",
            "Lethbridge Broncos under Chappy Chapman (WHL, 2 seasons)",
            "Seattle Breakers (WHL)",
        ],
        "personalDetails": {"hobbies": ["golf", "surfing"]},
        "scoutingNotes": (
            "Considered the team's best forward per Centennial Cup program. 25 pts (4 G, 21 A) "
            "in WHL playoff action with Seattle Breakers. Averaged over a point per game in "
            "1987 Sockeyes playoffs. Invited to LA Kings' camp."
        ),
    },
    "jason-phillips": {
        "programBio": (
            "Jason Phillips was born in Burnaby, B.C. and played his early years of hockey "
            "there. He has played for the Kamloops Blazers, Brandon Wheat Kings and the "
            "Seattle Thunderbirds before coming to the Sockeyes. He keeps in shape over the "
            "off-season playing racquet sports and water skiing. He has strong likes and "
            "dislikes. He lists his dislikes as losing, brussel sprouts and grumpy owners with "
            "colds — although with the Sockeyes, he has never experienced the latter. His "
            "position with the team is playing left wing on a line with Brian Kozak and Bill "
            "Hardy."
        ),
        "priorTeams": [
            "Burnaby Minor Hockey",
            "Kamloops Blazers (WHL)",
            "Brandon Wheat Kings (WHL)",
            "Seattle Thunderbirds (WHL)",
        ],
        "linemates": ["brian-kozak", "bill-hardy"],
        "personalDetails": {
            "hobbies": ["racquet sports", "water skiing"],
            "dislikes": ["losing", "brussel sprouts", "grumpy owners with colds"],
            "college": "Michigan State College (scholarship per Centennial Cup program)",
        },
        "scoutingNotes": "Left wing on the Kozak-Phillips-Hardy line; Michigan State-bound.",
    },
    "jim-gunn": {
        "programBio": (
            "Jim Gunn makes his home in Prince George. He played for the Victoria Cougars and "
            "the Lethbridge Broncos before coming to the Sockeyes. Jim, a defenceman turned "
            "forward, likes the physical type of hockey and spending hot summers water skiing "
            "and playing squash. Jim plans to attend college in Calgary next year. The Gunner "
            "is a good fellow to have around when there's work to be done, if he can only be "
            "found outside of the penalty box."
        ),
        "aliases": ["The Gunner"],
        "priorTeams": [
            "Prince George Minor Hockey",
            "Victoria Cougars (WHL)",
            "Lethbridge Broncos (WHL)",
        ],
        "personalDetails": {
            "hobbies": ["water skiing", "squash"],
            "college": "College in Calgary (planned 1987-88)",
        },
        "scoutingNotes": "Defenceman-turned-forward; physical game; spent time in the penalty box.",
    },
    "bill-hardy": {
        "programBio": (
            "Bill, or 'Cornelius' as he's known to teammates, played for the Esquimalt "
            "Buccaneers and for three years for the Nanaimo Clippers before making the right "
            "move and coming to the Sockeyes. Off the ice he plays golf, tennis and either "
            "coaches or plays lacrosse. He also does volunteer work at the Boys' and Girls' "
            "Club of Greater Vancouver. Bill plays right wing on a line with Kozak and Phillips."
        ),
        "aliases": ["Cornelius"],
        "priorTeams": [
            "Esquimalt Buccaneers",
            "Nanaimo Clippers (BCJHL, 3 seasons)",
        ],
        "linemates": ["brian-kozak", "jason-phillips"],
        "personalDetails": {
            "hobbies": ["golf", "tennis", "lacrosse (coach and player)"],
            "likes": ["volunteering at the Boys' and Girls' Club of Greater Vancouver"],
        },
        "scoutingNotes": "1986-87 assistant captain; right wing on the Kozak-Phillips-Hardy line.",
    },
    "tony-bobbitt": {
        "programBio": (
            "Born in Nova Scotia, Tony moved to Rossland at a young age and got his early "
            "start in hockey there. He played for Kamloops, New Westminster and Salmon Arm. "
            "Tony was chosen to play in this year's All-Star game. The Sockeyes are hoping to "
            "have him back on the team next year, and so are the girls of Richmond with whom "
            "Tony is a favorite."
        ),
        "priorTeams": [
            "Rossland Minor Hockey (BC)",
            "Kamloops (major junior)",
            "New Westminster",
            "Salmon Arm",
        ],
        "awards": ["1986-87 BCJHL All-Star Game selection"],
        "scoutingNotes": "BCJHL All-Star selection; Nova Scotia-born, BC-raised.",
    },
    "jason-talo": {
        "programBio": (
            "Jason is the second-youngest team member and a native of Richmond where he has "
            "played all his hockey. While playing Bantam 'A', he ended one season with 300 "
            "points. The fans just love him and the team is counting on him returning next "
            "year to capitalize on his dynamic hockey skills."
        ),
        "priorTeams": ["Richmond Minor Hockey (all levels)"],
        "scoutingNotes": "Second-youngest on roster; 300-point Bantam A season; Richmond home-grown.",
    },
    "frank-romeo": {
        "programBio": (
            "From Revelstoke, Frank played all his minor hockey there and with the Revelstoke "
            "Rockets and Rangers. Frank has played for the Dauphin Kings in Manitoba, the "
            "Vernon Lakers and the Kelowna Packers before joining the Sockeyes this season. "
            "In 1986 he was a member of the All-Star Team for the interior division."
        ),
        "aliases": ["The Rock"],
        "priorTeams": [
            "Revelstoke Minor / Rockets / Rangers",
            "Dauphin Kings (MJHL)",
            "Vernon Lakers",
            "Kelowna Packers",
        ],
        "awards": ["1986 BCJHL Interior Division All-Star Team"],
        "scoutingNotes": "Late-season goaltender pickup; started the Abbott + Centennial Cup playoff runs. Centennial Cup MVP.",
    },
    "brian-kozak": {
        "programBio": (
            "Brian hails from Kenora, Ontario. He played last year for the now-defunct Thunder "
            "Bay Jr. 'A' team. He's planning to attend the University of Manitoba next year. "
            "He will be missed by the team — but especially by 'Streaking' Jason Phillips."
        ),
        "priorTeams": [
            "Kenora Minor Hockey (ON)",
            "Thunder Bay Jr. A (defunct 1986)",
        ],
        "linemates": ["jason-phillips", "bill-hardy"],
        "personalDetails": {"college": "University of Manitoba (planned 1987-88)"},
        "scoutingNotes": "20 y/o centerman; considered the team's most consistent player (Centennial Cup program).",
    },
    "orland-kurtenbach": {
        "programBio": (
            "Born in Cudworth, Saskatchewan on September 7th 1936, meant life on the prairies "
            "was sure to include hockey. 'Kurt' as he became known by many, accepted the sport "
            "with endless love and constant enthusiasm. His junior career totaled 107 goals, "
            "136 assists for 243 points. Four years in the SJHL and four in the WHL prepared "
            "him for the pros. He was a member of the Memorial Cup Champion Flin Flon Bombers "
            "in 1956-57. He started his pro career with the Boston Bruins in 1963-64, played "
            "with the Toronto Maple Leafs in 1965-66, then went to play four seasons with the "
            "New York Rangers. 1970-71 was the year Orland Kurtenbach came to Vancouver and "
            "joined the Canucks organization. Kurt was the Vancouver Canucks' first captain "
            "and stayed with Vancouver for four years.\n\n"
            "Upon completion of his playing career, Kurt immediately jumped into the ranks of "
            "coaching with Seattle of the CHL. The next season he went to Tulsa for 1975-76. "
            "That year Tulsa finished first, won the Adams Cup, and Kurt was chosen as 'Coach "
            "of the Year'. Kurt continued the next season behind the bench in Tulsa, but on "
            "Dec. 23rd he became the Coach of the Vancouver Canucks. The Canucks finished "
            "fourth that season and improved one spot to a third-place finish the following. "
            "After that Kurt took some time off, returning in 1982-83 to coach Springfield of "
            "the American Hockey League, a season that finished seventh.\n\n"
            "Kurt then decided to take more time off from hockey until Bruce Taylor, owner of "
            "the Richmond Sockeyes, convinced Kurt to come out of retirement and go behind the "
            "bench of the Sockeyes. Once having made the decision to coach again, Kurt has "
            "taken on the job with the same enthusiasm as he had before."
        ),
        "scoutingNotes": (
            "Vancouver Canucks' first captain (1970-74). Memorial Cup champion (Flin Flon "
            "1956-57). Adams Cup / CHL Coach of the Year (Tulsa 1975-76). Brought out of "
            "retirement by owner Bruce Taylor in July 1986."
        ),
    },
    "bruce-taylor": {
        "scoutingNotes": (
            "Burnaby businessman who owned the Sockeyes 1985-1988 (Coast Division titles all "
            "three years). Personally convinced Orland Kurtenbach to come out of retirement "
            "to coach Richmond, per the 1987 Abbott Cup Souvenir Program."
        ),
    },
}

NEW_ENTRIES = [
    {
        "id": "jackie-wolf",
        "name": "Jackie Wolf",
        "hometown": "Richmond, BC",
        "role": "staff",
        "notes": "Booster Club President, 1974-1987 (retired after the championship season).",
        "bio": (
            "Jackie Wolf served as president of the Richmond Sockeyes Booster Club for thirteen "
            "years, retiring after the 1986-87 Centennial Cup season. Over that span she saw "
            "both of her sons, Eric and Andy, play for the team she was so devoted to. "
            "Single-handedly she went out and secured local merchants to donate prizes for the "
            "club's 50/50 draws and community fundraisers, building what the club called 'the "
            "best 50/50 draws in our league' and establishing the booster club as an "
            "organization with class. The 1987 Abbott Cup Souvenir Program called her 'the "
            "backbone of the booster club and a friend with a cause — The Richmond Sockeyes.' "
            "Her successor, a seven-year veteran of the club, acknowledged on page of the "
            "program that she would 'be a hard act to follow.'"
        ),
        "scoutingNotes": (
            "Mother of Sockeyes players Eric and Andy Wolf. 13-year booster club president. "
            "Organized the merchant-prize network that funded player banquets and year-end "
            "functions. Honored in the 1987 Abbott Cup Souvenir Program (lines 303-325)."
        ),
    },
    {
        "id": "john-raduak",
        "name": "John Raduak",
        "hometown": "Pincher Creek, AB",
        "role": "staff",
        "notes": "Pincher Creek minor hockey coach — mentor to Dickie, Claringbull, and Rutledge.",
        "bio": (
            "John Raduak was the Pincher Creek minor hockey coach and longtime family friend "
            "credited by three 1986-87 Sockeyes — team captain Trevor Dickie (#21), Mike "
            "Claringbull (#3), and Dean Rutledge (#20) — for his assistance in furthering "
            "their hockey careers. All three Pincher Creek products, acknowledged by name in "
            "the 1987 Abbott Cup Souvenir Program, went on to pro or college hockey paths, and "
            "Dickie captained Richmond through its Centennial Cup run."
        ),
        "scoutingNotes": (
            "Pincher Creek connection: Dickie, Claringbull, Rutledge. Credited in the 1987 "
            "Abbott Cup Souvenir Program as their former coach and long-time friend."
        ),
    },
]


def merge_enrichments(entry, fields):
    for key, value in fields.items():
        if key == "awards":
            existing = entry.get("awards") or []
            for award in value:
                if award not in existing:
                    existing.append(award)
            entry["awards"] = existing
            continue
        if key == "personalDetails":
            existing = entry.get("personalDetails") or {}
            for pd_key, pd_value in value.items():
                if pd_key in {"hobbies", "likes", "dislikes"}:
                    merged = existing.get(pd_key) or []
                    for item in pd_value:
                        if item not in merged:
                            merged.append(item)
                    existing[pd_key] = merged
                else:
                    existing.setdefault(pd_key, pd_value)
            entry["personalDetails"] = existing
            continue
        if key in {"aliases", "priorTeams", "linemates"}:
            existing = entry.get(key) or []
            for item in value:
                if item not in existing:
                    existing.append(item)
            entry[key] = existing
            continue
        entry.setdefault(key, value)


def main():
    data = json.loads(ROSTER.read_text(encoding="utf-8"))
    by_id = {e["id"]: e for e in data}

    enriched = 0
    for pid, fields in ENRICH.items():
        if pid not in by_id:
            print(f"WARN: {pid} not in roster")
            continue
        merge_enrichments(by_id[pid], fields)
        enriched += 1

    added = 0
    existing_ids = {e["id"] for e in data}
    for entry in NEW_ENTRIES:
        if entry["id"] in existing_ids:
            continue
        data.append(entry)
        added += 1

    ROSTER.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Enriched {enriched} entries, appended {added} new entries, total {len(data)}.")


if __name__ == "__main__":
    main()
