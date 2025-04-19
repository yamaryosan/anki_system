import { Card, TextField, Button } from '@mui/material';
import { useState, useEffect } from 'react';

type props = {
  noteId: string;
  front: string;
  back: string;
  setShowNoteShowPortal: (showNoteShowPortal: boolean) => void;
  setClickedNoteId: (clickedNoteId: string | null) => void;
};

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
  setShowNoteShowPortal,
  setClickedNoteId,
}: props) {
  const [newFront, setNewFront] = useState(front);
  const [newBack, setNewBack] = useState(back);

  useEffect(() => {
    setNewFront(front);
    setNewBack(back);
  }, [front, back]);

  // 閉じるボタンを押したとき
  const handleClose = () => {
    setShowNoteShowPortal(false);
    setClickedNoteId(null);
  };

  // 保存ボタンを押したとき
  const handleSave = () => {
    // データを保存
    // ポートルを閉じる
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
        rows={10}
        value={decodeHtmlEntities(newFront)}
        onChange={(e) => setNewFront(e.target.value)}
      />
      <TextField
        label="裏面"
        multiline
        rows={10}
        value={decodeHtmlEntities(newBack)}
        onChange={(e) => setNewBack(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleSave}>
        保存
      </Button>
    </Card>
  );
}
