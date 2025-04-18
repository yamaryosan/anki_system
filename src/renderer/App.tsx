import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import AnkiConnectCheck from './AnkiConnectCheck';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AnkiConnectCheck />} />
      </Routes>
    </Router>
  );
}
