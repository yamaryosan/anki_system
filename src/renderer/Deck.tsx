import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function Deck() {
  const { deckname } = useParams();
  return (
    <>
      <h2>デッキ: {deckname}</h2>
      <Link to="/">戻る</Link>
    </>
  );
}
