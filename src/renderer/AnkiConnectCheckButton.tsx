import { useEffect } from 'react';
import Button from '@mui/material/Button';
import { useSnackbar } from 'notistack';

async function ankiConnectCheck(): Promise<boolean> {
  const isConnected =
    await window.electron.ipcRenderer.invoke('anki-connect-check');
  return isConnected;
}

export default function AnkiConnectCheckButton() {
  const { enqueueSnackbar } = useSnackbar();

  const check = async () => {
    const isC = await ankiConnectCheck();
    if (isC) {
      enqueueSnackbar('接続済み', { variant: 'success' });
    } else {
      enqueueSnackbar('未接続', { variant: 'error' });
    }
  };

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Button type="button" variant="contained" onClick={() => check()}>
      接続確認
    </Button>
  );
}
