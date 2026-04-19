import { HashRouter, Routes, Route } from 'react-router-dom';
import TournamentList from './pages/TournamentList';
import CreateTournament from './pages/CreateTournament/index';
import TournamentDetail from './pages/TournamentDetail/index';
import Leaderboard from './pages/Leaderboard';
import EditTournament from './pages/EditTournament';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TournamentList />} />
        <Route path="/tournament/new" element={<CreateTournament />} />
        <Route path="/tournament/:id" element={<TournamentDetail />} />
        <Route path="/tournament/:id/leaderboard" element={<Leaderboard />} />
        <Route path="/tournament/:id/edit" element={<EditTournament />} />
      </Routes>
    </HashRouter>
  );
}
