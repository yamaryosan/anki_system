import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

async function fetchAllDecks(): Promise<string[]> {
  const decks = await window.electron.ipcRenderer.invoke('fetch-all-decks');
  if (decks === undefined) {
    throw new Error('Failed to get all decks');
  }
  return decks as string[];
}

export default function AllDecks() {
  const [decks, setDecks] = useState<string[]>([]);

  useEffect(() => {
    async function fetchDecks() {
      setDecks(await fetchAllDecks());
    }
    fetchDecks();
  }, []);

  return (
    <>
      <h2>デッキ一覧</h2>
      <ul>
        {decks.map((deck) => (
          <li key={deck}>
            <Link to={`/decks/${deck}`}>{deck}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
