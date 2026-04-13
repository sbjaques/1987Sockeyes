import { Link } from 'react-router-dom';
import { Nav } from './Nav';

export function Header() {
  return (
    <header className="bg-navy text-cream">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-xl">1987 Richmond Sockeyes</Link>
        <Nav />
      </div>
    </header>
  );
}
