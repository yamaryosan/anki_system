import { useState, useEffect } from 'react';

async function fetchAllDecks(): Promise<string[]> {
  const decks = await window.electron.ipcRenderer.invoke('fetch-all-decks');
  if (decks == undefined) {
    throw new Error('Failed to get all decks');
  }
  return decks;
}

export default function AllDecks() {
  const [decks, setDecks] = useState<string[]>([]);

  useEffect(() => {
    async function fetchDecks() {
      const decks = await fetchAllDecks();
      setDecks(decks);
      console.log(decks);
    }
    fetchDecks();
  }, []);

  return (
    <>
      <h2>デッキ一覧</h2>
      <ul>
        {decks.map((deck) => (
          <li key={deck}>{deck}</li>
        ))}
      </ul>
    </>
  );
}
