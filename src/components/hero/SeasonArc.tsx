import { Link } from 'react-router-dom';

export function SeasonArc() {
  return (
    <section className="bg-navy text-cream">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h2 className="font-display text-3xl md:text-4xl mb-2">The 1986-87 Season</h2>
        <p className="text-cream/70 text-sm uppercase tracking-widest mb-8">
          Four trophies in ten weeks.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-10">
          <Stat headline="38-14-0" caption="BCJHL regular season" detail="Coast Division champions, +104 goal differential" />
          <Stat headline="15-0" caption="BCJHL playoffs" detail="Swept Nanaimo, North Delta & Kelowna (45-5-2)" />
          <Stat headline="4-3" caption="Doyle Cup" detail="Down 2-3 to Red Deer; won Game 7 in Red Deer 9-1" />
          <Stat headline="4-3" caption="Abbott Cup" detail="Snapped Humboldt's 17-game winning streak" />
          <Stat headline="5-2" caption="Centennial Cup" detail="vs Humboldt, May 9 1987, Humboldt Uniplex" />
        </div>

        <div className="prose prose-invert max-w-none text-cream/90 space-y-4">
          <p>
            The 1986-87 Richmond Sockeyes finished the regular season 38-14-0 — Coast Division champions,
            with a +104 goal differential and three scorers in the BCJHL top ten. Dave Tomlinson (43-65-108,
            2nd in the league), Rob Clarke (65-38-103, 3rd), and Bryon Moller (27-64-91, 6th) anchored an
            offence built on line chemistry: Phillips–Kozak–Hardy, and Tomlinson at centre.
          </p>
          <p>
            They went 15-0 through the BCJHL playoffs, sweeping the Nanaimo Clippers and North Delta Flyers
            before ending the favoured Kelowna Packers' season in five. Kelowna had gone 45-5-2 — the best
            regular-season record in Canadian Junior A hockey — and didn't win a game in the final.
          </p>
          <p>
            The Doyle Cup against the Red Deer Rustlers turned the season. Richmond fell behind 3-2. The
            Rustlers had won three straight, snapping a 17-game Sockeyes winning streak. With one game
            left in their season, the Sockeyes won Game 6, then travelled to Red Deer and ended it 9-1.
          </p>
          <p>
            The Abbott Cup went seven games against the Humboldt Broncos, who had gone 55-9 in the SAJHL and
            ridden a 17-game winning streak of their own into the Western Final. Richmond broke the streak
            and took the series 4-3. At the Centennial Cup in Humboldt, the Sockeyes beat Dartmouth 7-3,
            Pembroke 4-3, and — after dropping a round-robin game to the hosts 6-1 — routed Pembroke 9-3
            in the semifinal and beat Humboldt 5-2 in the final on May 9, 1987 at the Uniplex. Frank
            Romeo was named tournament MVP. Jason Phillips was named Most Gentlemanly Player and to the
            tournament All-Star team, recording a hat trick in the final.
          </p>
          <p className="mt-8">
            <Link
              to="/the-season"
              className="inline-block text-crimson uppercase tracking-widest text-sm font-semibold hover:underline">
              Read the full story →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function Stat({ headline, caption, detail }: { headline: string; caption: string; detail: string }) {
  return (
    <div className="border-l-2 border-crimson pl-4">
      <div className="font-display text-3xl md:text-4xl text-cream">{headline}</div>
      <div className="text-crimson uppercase text-xs tracking-widest font-semibold mt-1">{caption}</div>
      <div className="text-cream/70 text-xs mt-2 leading-snug">{detail}</div>
    </div>
  );
}
