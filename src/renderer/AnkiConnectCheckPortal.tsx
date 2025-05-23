import { createPortal } from 'react-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

type props = {
  onClose: () => void;
};

export default function AnkiConnectCheckPortal({ onClose }: props) {
  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '10px',
        width: '95%',
        height: '95%',
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Typography variant="h6">AnkiConnectが接続されていません</Typography>
        <Typography variant="body1">
          1. Ankiでアドオンを選択しダイアログを開く
        </Typography>
        <Typography variant="body1">
          2. テキストボックスに&quot;2055492159&quot;と入力し確定
        </Typography>
        <Typography variant="body1">3. Ankiを再起動</Typography>
        <Typography variant="body1">4. 下のボタンを押す</Typography>
        <Button type="button" variant="contained" onClick={onClose}>
          接続確認
        </Button>
      </div>
    </div>,
    document.body,
  );
}
