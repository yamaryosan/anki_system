import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import { useSnackbar } from 'notistack';

type props = {
  onClose: () => void;
};

export default function NewDeckPortal({ onClose }: props) {
  const [deckName, setDeckName] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const { enqueueSnackbar } = useSnackbar();

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

  async function createDeck() {
    if (deckName === '') {
      enqueueSnackbar('デッキ名を入力してください', {
        variant: 'error',
      });
      return;
    }
    const response = await window.electron.ipcRenderer.invoke(
      'create-deck',
      deckName,
    );
    if (response === 'success') {
      enqueueSnackbar('デッキを作成しました', {
        variant: 'success',
      });
      onClose();
    }
  }

  const handleCreateDeck = () => {
    if (deckName === '') {
      enqueueSnackbar('デッキ名を入力してください', {
        variant: 'error',
      });
      return;
    }
    createDeck();
  };

  return createPortal(
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
        <IconButton
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            border: 'none',
            background: 'transparent',
            fontSize: '24px',
            cursor: 'pointer',
          }}
          aria-label="モーダルを閉じる"
        >
          <CloseIcon />
        </IconButton>
        <h3>新規デッキ作成</h3>
        <TextField
          label="デッキ名"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
        />
        <Button type="button" variant="contained" onClick={handleCreateDeck}>
          作成
        </Button>
      </div>
    </div>,
    document.body,
  );
}
