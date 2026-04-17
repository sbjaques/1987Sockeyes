import { NavLink } from 'react-router-dom';

const links = [
  { to: '/',             label: 'Home' },
  { to: '/roster',       label: 'Roster' },
  { to: '/playoffs',     label: 'The Run' },
  { to: '/vault',        label: 'The Vault' },
  { to: '/banner-night', label: 'Banner Night' },
];

export function Nav() {
  return (
    <nav aria-label="Primary">
      <ul className="flex gap-6 text-sm uppercase tracking-widest">
        {links.map(l => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `hover:text-crimson ${isActive ? 'text-crimson' : 'text-cream'}`}>
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
