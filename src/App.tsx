import { HashRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import Landing from './pages/Landing';
import RosterPage from './pages/RosterPage';
import VaultPage from './pages/VaultPage';
import CupPage from './pages/CupPage';
import BannerNightPage from './pages/BannerNightPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <HelmetProvider>
      <HashRouter>
        <Header />
        <main>
          <Routes>
            <Route path="/"              element={<Landing />} />
            <Route path="/roster"        element={<RosterPage />} />
            <Route path="/vault"         element={<VaultPage />} />
            <Route path="/timeline/:cup" element={<CupPage />} />
            <Route path="/banner-night"  element={<BannerNightPage />} />
            <Route path="*"              element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </HashRouter>
    </HelmetProvider>
  );
}
