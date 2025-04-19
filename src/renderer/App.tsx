import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Home';
import Deck from './Deck';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/decks/:deckname" element={<Deck />} />
      </Routes>
    </Router>
  );
}
