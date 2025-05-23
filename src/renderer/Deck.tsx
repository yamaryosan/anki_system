import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Button from '@mui/material/Button';
import { v4 as uuidv4 } from 'uuid';
import ExportButton from './ExportButton';
import NoteShowPortal from './NoteShowPortal';
import Note from './Note';

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

/**
 * デッキ内のノートID一覧を取得する
 * @param deckname デッキ名
 * @returns ノートID一覧
 */
async function fetchNoteIDsInDeck(deckname: string) {
  const noteIDs = (await window.electron.ipcRenderer.invoke(
    'fetch-note-ids-in-deck',
    deckname,
  )) as string[];
  return noteIDs;
}

/**
 * ノートID一覧からノートのデータを取得する
 * @param noteIDs ノートID一覧
 * @returns ノートのデータ一覧
 */
async function fetchNoteData(noteIDs: string[]) {
  const noteData = (await window.electron.ipcRenderer.invoke(
    'fetch-note-data',
    noteIDs,
  )) as NoteData[];
  return noteData;
}

export default function Deck() {
  const { deckname } = useParams();
  const [clickedNoteId, setClickedNoteId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  async function fetchNotes() {
    const noteIDs = await fetchNoteIDsInDeck(deckname!);
    const noteData = await fetchNoteData(noteIDs);
    return noteData;
  }

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckname]);

  const fetcher = async () => {
    const noteIDs = await fetchNoteIDsInDeck(deckname!);
    const noteData = await fetchNoteData(noteIDs);
    return noteData;
  };

  const { data: notes, mutate } = useSWR(`/notes/${deckname}`, fetcher);

  if (notes === undefined) {
    return <div>データを読み込んでいます...</div>;
  }

  // エクスポート
  const handleExport = () => {
    const noteData = notes.map((note) => ({
      表面: note.fields.表面.value,
      裏面: note.fields.裏面.value,
    }));
    // ファイル名を作成
    const fileName = `${deckname}.json`;
    // ファイルを作成
    const file = new File([JSON.stringify(noteData)], fileName, {
      type: 'application/json',
    });
    // ファイルをダウンロード
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <h2>デッキ: {deckname}</h2>
      <Button variant="contained" color="primary" component={Link} to="/">
        戻る
      </Button>
      {notes.length === 0 ? (
        <div>デッキ内にカードがありません</div>
      ) : (
        <div>
          {notes.map((note) => (
            <Note
              key={uuidv4()}
              noteId={note.noteId}
              front={note.fields.表面.value}
              setClickedNoteId={setClickedNoteId}
              setIsOpen={setIsOpen}
            />
          ))}
          {isOpen && (
            <NoteShowPortal
              noteId={clickedNoteId!}
              front={
                notes.find((n) => n.noteId === clickedNoteId)?.fields.表面
                  .value ?? ''
              }
              back={
                notes.find((n) => n.noteId === clickedNoteId)?.fields.裏面
                  .value ?? ''
              }
              setClickedNoteId={setClickedNoteId}
              onClose={() => setIsOpen(false)}
              onSave={() => mutate()}
            />
          )}
        </div>
      )}
      {notes.length >= 10 && (
        <Button variant="contained" color="primary" component={Link} to="/">
          戻る
        </Button>
      )}
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to={`/decks/${deckname}/new`}
      >
        新規ノート作成
      </Button>
      <ExportButton handleExport={handleExport} />
    </>
  );
}
