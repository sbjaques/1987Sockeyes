import { useNavigate } from 'react-router-dom';
import { isSkater, isGoalie, type RosterEntry, type Skater, type Goalie, type RosterRole } from '../../types/roster';
import { useSortableTable } from '../../hooks/useSortableTable';

function NameCell({ entry }: { entry: RosterEntry }) {
  return (
    <span>
      <span className="font-semibold">{entry.name}</span>
      {entry.aliases && entry.aliases.length > 0 && (
        <span className="text-navy/55 italic ml-2">"{entry.aliases[0]}"</span>
      )}
    </span>
  );
}

function SkaterTable({ rows, onRowClick }: { rows: Skater[]; onRowClick: (entry: RosterEntry) => void }) {
  const flat = rows.map(s => ({ ...s, ...(s.playoffStats ?? { gp: 0, g: 0, a: 0, pts: 0, pim: 0 }) }));
  const { sorted, sortKey, sortDir, toggleSort } = useSortableTable(flat, 'pts', 'desc');

  const col = (key: keyof typeof flat[number], label: string) => (
    <th scope="col" className="px-3 py-2 text-left">
      <button onClick={() => toggleSort(key)} aria-sort={sortKey === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
        {label}{sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
      </button>
    </th>
  );

  return (
    <table className="w-full text-sm">
      <thead className="bg-navy text-cream">
        <tr>
          {col('number', '#')}{col('name', 'Name')}{col('position','Pos')}{col('hometown','Hometown')}
          {col('gp','GP')}{col('g','G')}{col('a','A')}{col('pts','Pts')}{col('pim','PIM')}
        </tr>
      </thead>
      <tbody>
        {sorted.map(r => (
          <tr key={r.id}
              className="odd:bg-cream even:bg-cream-200 cursor-pointer hover:bg-cream-200"
              onClick={() => onRowClick(r)}>
            <td className="px-3 py-2">{r.number ?? ''}</td>
            <td className="px-3 py-2"><NameCell entry={r} /></td>
            <td className="px-3 py-2">{r.position}</td>
            <td className="px-3 py-2">{r.hometown}</td>
            <td className="px-3 py-2 tabular-nums">{r.gp}</td>
            <td className="px-3 py-2 tabular-nums">{r.g}</td>
            <td className="px-3 py-2 tabular-nums">{r.a}</td>
            <td className="px-3 py-2 tabular-nums font-semibold">{r.pts}</td>
            <td className="px-3 py-2 tabular-nums">{r.pim}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GoalieTable({ rows, onRowClick }: { rows: Goalie[]; onRowClick: (entry: RosterEntry) => void }) {
  const flat = rows.map(g => ({ ...g, ...(g.playoffStats ?? { gp: 0, w: 0, l: 0, gaa: 0, svpct: 0, so: 0 }) }));
  const { sorted, sortKey, sortDir, toggleSort } = useSortableTable(flat, 'gaa', 'asc');
  const col = (key: keyof typeof flat[number], label: string) => (
    <th scope="col" className="px-3 py-2 text-left">
      <button onClick={() => toggleSort(key)} aria-sort={sortKey === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
        {label}{sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
      </button>
    </th>
  );
  return (
    <table className="w-full text-sm mt-8">
      <thead className="bg-navy text-cream">
        <tr>
          {col('number','#')}{col('name','Name')}{col('hometown','Hometown')}
          {col('gp','GP')}{col('w','W')}{col('l','L')}{col('gaa','GAA')}{col('svpct','Sv%')}{col('so','SO')}
        </tr>
      </thead>
      <tbody>
        {sorted.map(r => (
          <tr key={r.id}
              className="odd:bg-cream even:bg-cream-200 cursor-pointer hover:bg-cream-200"
              onClick={() => onRowClick(r)}>
            <td className="px-3 py-2">{r.number ?? ''}</td>
            <td className="px-3 py-2"><NameCell entry={r} /></td>
            <td className="px-3 py-2">{r.hometown}</td>
            <td className="px-3 py-2 tabular-nums">{r.gp}</td>
            <td className="px-3 py-2 tabular-nums">{r.w}</td>
            <td className="px-3 py-2 tabular-nums">{r.l}</td>
            <td className="px-3 py-2 tabular-nums">{r.gaa.toFixed(2)}</td>
            <td className="px-3 py-2 tabular-nums">{r.svpct.toFixed(3)}</td>
            <td className="px-3 py-2 tabular-nums">{r.so}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const STAFF_GROUP_ORDER: { label: string; roles: RosterRole[] }[] = [
  { label: 'Ownership & Front Office', roles: ['owner', 'president'] },
  { label: 'Coaching Staff',           roles: ['head-coach', 'assistant-coach'] },
  { label: 'Training & Equipment',     roles: ['trainer', 'assistant-trainer', 'equipment-manager'] },
  { label: 'Booster Club & Supporters', roles: ['staff'] },
];

function StaffCard({ entry, onClick }: { entry: RosterEntry; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left border-l-4 border-crimson bg-cream-200 hover:bg-cream px-4 py-3 rounded-r transition">
      <div className="font-semibold">{entry.name}</div>
      <div className="text-xs uppercase tracking-widest text-navy/60 mt-0.5">
        {entry.role.replace('-', ' ')}
      </div>
      {entry.scoutingNotes && (
        <div className="text-sm text-navy/80 mt-2 line-clamp-3">{entry.scoutingNotes}</div>
      )}
    </button>
  );
}

export function RosterTable({
  entries,
  onRowClick,
  linkToProfile = true,
}: {
  entries: RosterEntry[];
  onRowClick?: (entry: RosterEntry) => void;
  linkToProfile?: boolean;
}) {
  const navigate = useNavigate();
  const skaters = entries.filter(isSkater);
  const goalies = entries.filter(isGoalie);
  const staff   = entries.filter(e => e.role !== 'player');

  const handleClick = (entry: RosterEntry) => {
    if (onRowClick) {
      onRowClick(entry);
    } else if (linkToProfile) {
      navigate(`/player/${entry.id}`);
    }
  };

  return (
    <div>
      {skaters.length > 0 && <SkaterTable rows={skaters} onRowClick={handleClick} />}
      {goalies.length > 0 && <GoalieTable rows={goalies} onRowClick={handleClick} />}
      {staff.length > 0 && (
        <div className="mt-12">
          <h3 className="font-display text-2xl mb-2">Coaches &amp; Staff</h3>
          <p className="text-sm text-navy/60 mb-6">Organization that built the 1986-87 championship.</p>
          {STAFF_GROUP_ORDER.map(group => {
            const members = staff.filter(s => group.roles.includes(s.role));
            if (members.length === 0) return null;
            return (
              <div key={group.label} className="mb-8">
                <h4 className="text-xs uppercase tracking-widest text-navy/60 mb-3">{group.label}</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {members.map(m => <StaffCard key={m.id} entry={m} onClick={() => handleClick(m)} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
