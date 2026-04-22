import { NavLink } from 'react-router-dom';
import { NavSeasonDropdown } from './NavSeasonDropdown';

const links = [
  { to: '/',             label: 'Home' },
  { to: '/roster',       label: 'Roster' },
  { to: '/vault',        label: 'The Vault' },
  { to: '/banner-night', label: 'Banner Night' },
];

export function Nav() {
  return (
    <nav aria-label="Primary">
      <ul className="flex gap-6 text-sm uppercase tracking-widest items-center">
        <li>
          <NavLink to="/" end className={({ isActive }) => `hover:text-crimson ${isActive ? 'text-crimson' : 'text-cream'}`}>
            Home
          </NavLink>
        </li>
        <NavSeasonDropdown />
        {links.slice(1).map(l => (
          <li key={l.to}>
            <NavLink to={l.to} className={({ isActive }) => `hover:text-crimson ${isActive ? 'text-crimson' : 'text-cream'}`}>
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
