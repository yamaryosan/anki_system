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
      >
        {decks.map((deck) => (
          <option key={uuidv4()}>{deck}</option>
        ))}
      </select>
    </div>
  );
}
