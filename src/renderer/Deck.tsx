import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import useSWR from 'swr';
import NoteShowPortal from './NoteShowPortal';

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

  return (
    <>
      <h2>デッキ: {deckname}</h2>
      {notes.length === 0 ? (
        <div>デッキ内にカードがありません</div>
      ) : (
        <div>
          {notes.map((note) => (
            <Card
              variant="outlined"
              sx={{
                cursor: 'pointer',
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
              key={note.noteId}
              onClick={() => {
                setClickedNoteId(note.noteId);
                setIsOpen(true);
              }}
            >
              <div>{note.fields.表面.value}</div>
            </Card>
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
      <Link to={`/decks/${deckname}/new`}>新規ノート作成</Link>
      <Link to="/">戻る</Link>
    </>
  );
}
