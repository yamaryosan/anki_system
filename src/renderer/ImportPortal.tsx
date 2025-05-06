import { useEffect, useRef, useState } from 'react';
import { useSnackbar } from 'notistack';
import Button from '@mui/material/Button';
import DeckSelectBox from './DeckSelectBox';

type props = {
  onClose: () => void;
};

async function fetchAllDecks(): Promise<string[]> {
  const decks = await window.electron.ipcRenderer.invoke('fetch-all-decks');
  if (decks === undefined) {
    throw new Error('Failed to get all decks');
  }
  return decks as string[];
}

type Note = {
  表面: string;
  裏面: string;
};

export default function ImportPortal({ onClose }: props) {
  const [decks, setDecks] = useState<string[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string>(decks[0]);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    async function fetchDecks() {
      setDecks(await fetchAllDecks());
    }
    fetchDecks();
  }, []);

  const modalRef = useRef<HTMLDivElement>(null);
  // クリックした場所がモーダルの外側であるか、ESCキーを押されたら閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  async function importDeck(deck: string, notes: Note[]) {
    const result = await window.electron.ipcRenderer.invoke(
      'import-deck',
      deck,
      notes,
    );
    if (result === 'success') {
      enqueueSnackbar('インポートしました', {
        variant: 'success',
      });
      onClose();
    } else if (result === 'duplicate') {
      enqueueSnackbar('重複しているノートがあります', {
        variant: 'error',
      });
    } else {
      enqueueSnackbar('インポートに失敗しました', {
        variant: 'error',
      });
    }
  }

  const handleImport = () => {
    const file = modalRef.current?.querySelector('input')?.files?.[0];
    if (!file) {
      enqueueSnackbar('ファイルを選択してください', {
        variant: 'error',
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = JSON.parse(event.target?.result as string);
      importDeck(selectedDeck, json);
    };
    reader.readAsText(file);
  };

  return (
    <div
      ref={modalRef}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '10px',
        width: '60%',
        maxWidth: '600px',
        minWidth: '300px',
        height: '40%',
        minHeight: '300px',
        maxHeight: '600px',
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3>デッキをインポート</h3>
        <input type="file" accept=".json" />
        <h4>インポート先のデッキ</h4>
        <DeckSelectBox
          decks={decks}
          selectedDeck={selectedDeck}
          setSelectedDeck={setSelectedDeck}
        />
        <Button type="button" variant="contained" onClick={handleImport}>
          インポート
        </Button>
      </div>
    </div>
  );
}
