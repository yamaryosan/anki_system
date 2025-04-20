import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div ref={modalRef}>
        <h3>新規デッキ作成</h3>
        <TextField
          label="デッキ名"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
        />
        <button type="button" onClick={createDeck}>
          作成
        </button>
        <button type="button" onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>,
    document.body,
  );
}
