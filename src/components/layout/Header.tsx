import { Link } from 'react-router-dom';
import { Nav } from './Nav';

export function Header() {
  return (
    <header className="bg-navy text-cream">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <img src="/1987Sockeyes/assets/logo.svg" alt="Richmond Sockeyes" className="h-12 w-auto" />
          <span className="font-display text-xl hidden sm:inline">1987 Richmond Sockeyes</span>
        </Link>
        <Nav />
      </div>
    </header>
  );
}
