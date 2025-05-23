import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useSnackbar } from 'notistack';

type props = {
  noteId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
};

// ノートを削除する
async function deleteNote(noteId: string) {
  await window.electron.ipcRenderer.invoke('delete-note', noteId);
}

export default function DeleteConfirmPortal({
  noteId,
  isOpen,
  onClose,
  onSave,
}: props) {
  const { enqueueSnackbar } = useSnackbar();
  // 削除ボタンを押したとき
  const handleDelete = async () => {
    await deleteNote(noteId);
    enqueueSnackbar('削除しました', {
      variant: 'success',
    });
    onClose();
    onSave();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} id="delete-confirm-portal">
      <DialogContent>
        <DialogContentText>このノートを削除しますか？</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={handleDelete}>
          削除
        </Button>
        <Button variant="contained" color="secondary" onClick={onClose}>
          キャンセル
        </Button>
      </DialogActions>
    </Dialog>
  );
}
