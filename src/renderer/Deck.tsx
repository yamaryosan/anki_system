import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

/**
 * デッキ内のカードID一覧を取得する
 * @param deckname デッキ名
 * @returns カードID一覧
 */
async function fetchCardIDsInDeck(deckname: string) {
  const cardIDs = (await window.electron.ipcRenderer.invoke(
    'fetch-card-ids-in-deck',
    deckname,
  )) as string[];
  return cardIDs;
}

export default function Deck() {
  const { deckname } = useParams();
  const [cards, setCards] = useState<string[]>([]);

  async function fetchCards() {
    const cardIDs = await fetchCardIDsInDeck(deckname!);
    setCards(cardIDs);
  }

  useEffect(() => {
    fetchCards();
  }, [deckname]);

  return (
    <>
      <h2>デッキ: {deckname}</h2>
      {cards.length === 0 ? (
        <div>デッキ内にカードがありません</div>
      ) : (
        <ul>
          {cards.map((card) => (
            <li key={card}>{card}</li>
          ))}
        </ul>
      )}
      <Link to="/">戻る</Link>
    </>
  );
}
