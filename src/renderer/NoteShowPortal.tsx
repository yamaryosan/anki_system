import { Card, TextField, Button } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';

type props = {
  noteId: string;
  front: string;
  back: string;
  setClickedNoteId: (clickedNoteId: string | null) => void;
  onClose: () => void;
  onSave: () => void;
};

// HTML形式のテキストをデコードする
function decodeHtmlEntities(str: string) {
  const parser = new DOMParser();
  const decoded = parser.parseFromString(str, 'text/html').body.textContent;
  // 改行を<br>に変換
  return decoded?.replace(/<br>/g, '\n');
}

export default function NoteShowPortal({
  noteId,
  front,
  back,
  setClickedNoteId,
  onClose,
  onSave,
}: props) {
  const [newFront, setNewFront] = useState(front);
  const [newBack, setNewBack] = useState(back);

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

  useEffect(() => {
    setNewFront(front);
    setNewBack(back);
  }, [front, back]);

  // 閉じるボタンを押したとき
  const handleClose = () => {
    onClose();
    setClickedNoteId(null);
  };

  // カードの内容を更新する
  async function updateNote() {
    await window.electron.ipcRenderer.invoke('update-note', noteId, {
      fields: {
        表面: {
          order: 0,
          value: newFront,
        },
        裏面: {
          order: 1,
          value: newBack,
        },
      },
    });
  }

  // 保存ボタンを押したとき
  const handleSave = async () => {
    // データが変更されていない場合は保存しない
    if (newFront === front && newBack === back) {
      return;
    }
    // 表面あるいは裏面が空の場合は保存しない
    if (newFront === '' || newBack === '') {
      enqueueSnackbar('カードの内容が空です', {
        variant: 'error',
      });
      return;
    }
    // データを保存
    await updateNote();
    enqueueSnackbar('保存しました', {
      variant: 'success',
    });
    // ポータルを閉じる
    onClose();
    // データを更新
    onSave();
  };

  return (
    <Card
      variant="outlined"
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: 2,
      }}
    >
      <Button onClick={handleClose}>閉じる</Button>
      <TextField
        label="表面"
        multiline
        rows={5}
        value={decodeHtmlEntities(newFront)}
        onChange={(e) => setNewFront(e.target.value)}
      />
      <TextField
        label="裏面"
        multiline
        rows={5}
        value={decodeHtmlEntities(newBack)}
        onChange={(e) => setNewBack(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleSave}>
        保存
      </Button>
    </Card>
  );
}
