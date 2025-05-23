/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

/**
 * Anki Connectが起動しているかどうかをチェックする
 */
ipcMain.handle('anki-connect-check', async () => {
  try {
    const response = await fetch('http://localhost:8765/', {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = (await response.json()) as {
      apiVersion: string;
    };
    return data.apiVersion !== undefined;
  } catch {
    return false;
  }
});

/**
 * デッキ一覧を取得する
 */
ipcMain.handle('fetch-all-decks', async () => {
  const response = await fetch('http://localhost:8765/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'deckNames',
      version: 6,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get all decks');
  }

  const data = (await response.json()) as {
    result: string[];
    error: string;
  };
  if (data.error) {
    throw new Error(data.error);
  }
  return data.result;
});

/**
 * デッキ内のノートID一覧を取得する
 */
ipcMain.handle('fetch-note-ids-in-deck', async (event, deckname: string) => {
  const response = await fetch('http://localhost:8765/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'findNotes',
      version: 6,
      params: {
        query: `deck:"${deckname}"`,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get notes in deck');
  }
  const data = (await response.json()) as {
    result: string[];
    error: string;
  };
  if (data.error) {
    throw new Error(data.error);
  }
  return data.result;
});

/**
 * ノートIDの配列からノートのデータを取得する
 */
ipcMain.handle('fetch-note-data', async (event, noteIDs: string[]) => {
  const response = await fetch('http://localhost:8765/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'notesInfo',
      version: 6,
      params: { notes: noteIDs },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get note data');
  }

  type NoteData = {
    noteId: string;
    profile: string;
    tags: string[] | null;
    modelName: string;
    mod: number;
    cards: number[];
    fields: {
      表面: {
        order: number;
        value: string;
      };
      裏面: {
        order: number;
        value: string;
      };
    };
  };

  const data = (await response.json()) as {
    result: NoteData[];
    error: string;
  };
  if (data.error) {
    throw new Error(data.error);
  }
  if (data.result === undefined) {
    throw new Error('Failed to get note data');
  }
  return data.result;
});

type NewNoteData = {
  deckName: string;
  modelName: string;
  fields: {
    表面: {
      order: number;
      value: string;
    };
    裏面: {
      order: number;
      value: string;
    };
  };
};

/**
 * ノートを作成する
 */
ipcMain.handle('create-note', async (event, noteData: NewNoteData) => {
  const response = await fetch('http://localhost:8765/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'addNote',
      version: 6,
      params: {
        note: {
          deckName: noteData.deckName,
          modelName: noteData.modelName,
          fields: {
            表面: noteData.fields.表面.value,
            裏面: noteData.fields.裏面.value,
          },
          options: {
            allowDuplicate: false,
          },
        },
      },
    }),
  });

  const data = (await response.json()) as {
    result: string;
    error: string;
  };
  if (data.error === 'cannot create note because it is a duplicate') {
    return 'duplicate';
  }
  if (data.error) {
    throw new Error(data.error);
  }
  if (typeof data.result === 'number') {
    return 'success';
  }
  throw new Error('Failed to create note');
});

/**
 * デッキを作成する
 */
ipcMain.handle('create-deck', async (event, deckName: string) => {
  const response = await fetch('http://localhost:8765/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'createDeck',
      version: 6,
      params: {
        deck: deckName,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create deck');
  }

  const data = (await response.json()) as {
    result: string;
    error: string;
  };
  console.log(data);
  if (data.error) {
    throw new Error(data.error);
  }
  if (typeof data.result === 'number') {
    return 'success';
  }
  throw new Error('Failed to create deck');
});

/**
 * ノートを更新する
 */
ipcMain.handle(
  'update-note',
  async (event, noteId: string, noteData: NewNoteData) => {
    const response = await fetch('http://localhost:8765/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateNote',
        version: 6,
        params: {
          note: {
            id: noteId,
            fields: {
              表面: noteData.fields.表面.value,
              裏面: noteData.fields.裏面.value,
            },
          },
        },
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to update note');
    }
    return 'success';
  },
);

/**
 * ノートを削除する
 */
ipcMain.handle('delete-note', async (event, noteId: string) => {
  const response = await fetch('http://localhost:8765/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'deleteNotes',
      version: 6,
      params: {
        notes: [noteId],
      },
    }),
  });
  const data = (await response.json()) as {
    result: string;
    error: string;
  };
  console.log(data);
  if (data.error) {
    throw new Error(data.error);
  }
  return 'success';
});

type Note = {
  表面: string;
  裏面: string;
};

function isAllNumbers(arr: any[]): boolean {
  return arr.every((item) => typeof item === 'number');
}

/**
 * デッキをインポートする
 */
ipcMain.handle('import-deck', async (event, deck: string, notes: Note[]) => {
  const response = await fetch('http://localhost:8765/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'addNotes',
      version: 6,
      params: {
        notes: notes.map((note) => ({
          deckName: deck,
          modelName: '基本',
          fields: {
            表面: note.表面,
            裏面: note.裏面,
          },
        })),
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to import deck');
  }

  const data = (await response.json()) as {
    result: string[];
    error: string[];
  };
  if (data.error?.includes('cannot create note because it is a duplicate')) {
    return 'duplicate';
  }
  if (isAllNumbers(data.result)) {
    return 'success';
  }
  if (data.error) {
    throw new Error(data.error.join(', '));
  }
  throw new Error('Failed to import deck');
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
