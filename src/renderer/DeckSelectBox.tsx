import { v4 as uuidv4 } from 'uuid';

type Props = {
  decks: string[];
  selectedDeck: string;
  setSelectedDeck: (deck: string) => void;
};

export default function DeckSelectBox({
  decks,
  selectedDeck,
  setSelectedDeck,
}: Props) {
  return (
    <div>
      <select
        value={selectedDeck}
        onChange={(e) => setSelectedDeck(e.target.value)}
        style={{
          width: '100%',
          height: '40px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          padding: '0 10px',
        }}
      >
        {decks.map((deck) => (
          <option key={uuidv4()}>{deck}</option>
        ))}
      </select>
    </div>
  );
}
