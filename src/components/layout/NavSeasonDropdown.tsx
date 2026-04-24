import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

export function NavSeasonDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <li ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="hover:text-crimson text-cream text-sm uppercase tracking-widest">
        The Season ▾
      </button>
      {open && (
        <ul role="menu" className="absolute top-full left-0 mt-2 bg-navy border border-cream/20 min-w-[10rem] py-2 z-20">
          <li role="none">
            <NavLink
              role="menuitem"
              to="/the-season"
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) => `block px-4 py-1.5 ${isActive ? 'text-crimson' : 'text-cream hover:text-crimson'}`}>
              Story
            </NavLink>
          </li>
          <li role="none">
            <NavLink
              role="menuitem"
              to="/the-season/the-run"
              onClick={() => setOpen(false)}
              className={({ isActive }) => `block px-4 py-1.5 ${isActive ? 'text-crimson' : 'text-cream hover:text-crimson'}`}>
              The Run
            </NavLink>
          </li>
        </ul>
      )}
    </li>
  );
}
