import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
  useMemo,
} from 'react';

type AnkiConnectContextType = {
  isConnected: boolean;
  setIsConnected: (isConnected: boolean) => void;
};

const AnkiConnectContext = createContext<AnkiConnectContextType | undefined>(
  undefined,
);

async function ankiConnectCheck(): Promise<boolean> {
  const isConnected =
    await window.electron.ipcRenderer.invoke('anki-connect-check');
  return isConnected;
}

export function AnkiConnectProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkAnkiConnect = async () => {
      const isC = await ankiConnectCheck();
      setIsConnected(isC);
    };
    checkAnkiConnect();
  }, []);

  const contextValue = useMemo(
    () => ({ isConnected, setIsConnected }),
    [isConnected, setIsConnected],
  );

  return (
    <AnkiConnectContext.Provider value={contextValue}>
      {children}
    </AnkiConnectContext.Provider>
  );
}

export const useAnkiConnect = () => {
  const context = useContext(AnkiConnectContext);
  if (!context) {
    throw new Error('useAnkiConnect must be used within a AnkiConnectProvider');
  }
  return context;
};
