import { useState, useEffect } from 'react';

async function ankiConnectCheck(): Promise<boolean> {
  const isConnected =
    await window.electron.ipcRenderer.invoke('anki-connect-check');
  return isConnected;
}

export default function AnkiConnectCheck() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const check = async () => {
      const isC = await ankiConnectCheck();
      setIsConnected(isC);
    };
    check();
  }, []);

  return (
    <>
      {isConnected ? 'Connected' : 'Not connected'}
      <button type="button">Check</button>
    </>
  );
}
