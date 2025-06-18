import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import PlayerProfile from './pages/PlayerProfile';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#f5fdf9] text-[#1e1e1e] font-sans">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/:matchId" element={<MatchDetail />} />
            <Route path="/players/:playerId" element={<PlayerProfile />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App
