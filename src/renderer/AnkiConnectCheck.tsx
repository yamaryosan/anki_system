import { useState, useEffect } from 'react';

async function ankiConnectCheck(): Promise<boolean> {
  const isConnected =
    await window.electron.ipcRenderer.invoke('anki-connect-check');
  return isConnected;
}

export default function AnkiConnectCheck() {
  const [isConnected, setIsConnected] = useState(false);

  async function check() {
    const isConnected = await ankiConnectCheck();
    setIsConnected(isConnected);
  }

  useEffect(() => {
    check();
  }, []);

  return (
    <>
      {isConnected ? 'Connected' : 'Not connected'}
      <button onClick={check}>Check</button>
    </>
  );
}
