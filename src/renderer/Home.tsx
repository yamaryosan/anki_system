import Button from '@mui/material/Button';
import { useState } from 'react';
import AnkiConnectCheck from './AnkiConnectCheck';
import AllDecks from './AllDecks';
import ImportPortal from './ImportPortal';
import NewDeckPortal from './NewDeckPortal';

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <>
      <AnkiConnectCheck />
      <AllDecks />
      <Button onClick={() => setIsOpen(true)} disabled={isOpen}>
        新規デッキ作成
      </Button>
      {isOpen && <NewDeckPortal onClose={() => setIsOpen(false)} />}
      <Button onClick={() => setIsImportOpen(true)} disabled={isImportOpen}>
        デッキをインポート
      </Button>
      {isImportOpen && <ImportPortal onClose={() => setIsImportOpen(false)} />}
    </>
  );
}
