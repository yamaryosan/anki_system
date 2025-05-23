import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import styled from 'styled-components';

async function fetchAllDecks(): Promise<string[]> {
  const decks = await window.electron.ipcRenderer.invoke('fetch-all-decks');
  if (decks === undefined) {
    throw new Error('Failed to get all decks');
  }
  return decks as string[];
}

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 15px;
  border: 1px solid #000;
  border-radius: 5px;
  &:hover {
    background-color: #f0f0f0;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
`;

export default function AllDecks() {
  const { data: decks, mutate, isLoading } = useSWR('/decks', fetchAllDecks);

  useEffect(() => {
    mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <>
      <h2>デッキ一覧</h2>
      <ul
        style={{
          listStyleType: 'none',
          padding: '10px',
        }}
      >
        {decks?.map((deck) => (
          <li
            key={deck}
            style={{
              paddingTop: '10px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <StyledLink to={`/decks/${deck}`}>{deck}</StyledLink>
          </li>
        ))}
      </ul>
    </>
  );
}
