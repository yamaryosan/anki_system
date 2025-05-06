import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { SnackbarProvider } from 'notistack';
import Home from './Home';
import Deck from './Deck';
import NewNote from './NewNote';
import { AnkiConnectProvider } from './AnkiConnectProvider';

export default function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <AnkiConnectProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/decks/:deckname/new" element={<NewNote />} />
            <Route path="/decks/:deckname" element={<Deck />} />
          </Routes>
        </Router>
      </AnkiConnectProvider>
    </SnackbarProvider>
  );
}
