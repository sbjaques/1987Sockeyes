import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import Landing from './pages/Landing';
import RosterPage from './pages/RosterPage';
import PlayoffsPage from './pages/PlayoffsPage';
import SeasonStoryPage from './pages/SeasonStoryPage';
import HallOfFamePage from './pages/HallOfFamePage';
import VaultPage from './pages/VaultPage';
import CupPage from './pages/CupPage';
import BannerNightPage from './pages/BannerNightPage';
import PlayerProfile from './pages/PlayerProfile';
import NotFound from './pages/NotFound';
import { BUILD_MODE } from './lib/buildMode';

export default function App() {
  return (
    <HelmetProvider>
      <HashRouter>
        {BUILD_MODE === 'private' && (
          <div className="bg-crimson text-cream text-xs uppercase tracking-widest text-center py-1">
            Private archive · signed in
          </div>
        )}
        <Header />
        <main>
          <Routes>
            <Route path="/"                         element={<Landing />} />
            <Route path="/roster"                   element={<RosterPage />} />
            <Route path="/the-season"               element={<SeasonStoryPage />} />
            <Route path="/the-season/the-run"       element={<PlayoffsPage />} />
            <Route path="/hall-of-fame"             element={<HallOfFamePage />} />
            <Route path="/playoffs"                 element={<Navigate to="/the-season/the-run" replace />} />
            <Route path="/vault"                    element={<VaultPage />} />
            <Route path="/timeline/:cup"            element={<CupPage />} />
            <Route path="/banner-night"             element={<BannerNightPage />} />
            <Route path="/player/:id"               element={<PlayerProfile />} />
            <Route path="*"                         element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </HashRouter>
    </HelmetProvider>
  );
}
