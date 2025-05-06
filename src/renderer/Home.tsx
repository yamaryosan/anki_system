import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import AnkiConnectCheckButton from './AnkiConnectCheckButton';
import AnkiConnectCheckPortal from './AnkiConnectCheckPortal';
import AllDecks from './AllDecks';
import ImportPortal from './ImportPortal';
import NewDeckPortal from './NewDeckPortal';
import { useAnkiConnect } from './AnkiConnectProvider';

async function ankiConnectCheck(): Promise<boolean> {
  const isConnected =
    await window.electron.ipcRenderer.invoke('anki-connect-check');
  return isConnected;
}

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { isConnected, setIsConnected } = useAnkiConnect();

  const handleClose = async () => {
    setIsConnected(await ankiConnectCheck());
  };

  // 定期的に接続確認を行う
  useEffect(() => {
    const interval = setInterval(async () => {
      setIsConnected(await ankiConnectCheck());
    }, 5000);
    return () => clearInterval(interval);
  }, [isConnected, setIsConnected]);

  if (!isConnected) {
    return <AnkiConnectCheckPortal onClose={handleClose} />;
  }

  return (
    <>
      <AnkiConnectCheckButton />
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
