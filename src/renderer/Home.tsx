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
      <Button
        variant="contained"
        sx={{ padding: '10px 20px' }}
        onClick={() => setIsOpen(true)}
        disabled={isOpen}
      >
        新規デッキ作成
      </Button>
      <AllDecks />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        {isOpen && <NewDeckPortal onClose={() => setIsOpen(false)} />}
        <Button
          variant="contained"
          sx={{ padding: '10px 20px' }}
          onClick={() => setIsImportOpen(true)}
          disabled={isImportOpen}
        >
          デッキをインポート
        </Button>
        {isImportOpen && (
          <ImportPortal onClose={() => setIsImportOpen(false)} />
        )}
      </div>
    </>
  );
}
