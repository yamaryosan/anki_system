import { useParams, Link } from 'react-router-dom';
import { useState, ChangeEvent, FormEvent } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

async function createNote(newNoteData: NewNoteData) {
  const result = await window.electron.ipcRenderer.invoke(
    'create-note',
    newNoteData,
  );
  if (result === 'duplicate') {
    toast.error('内容が重複していたため、作成できませんでした。');
  }
}

export default function NewNote() {
  const params = useParams();
  const { deckname } = params;
  const [noteData, setNoteData] = useState<NewNoteData>({
    deckName: deckname ?? '',
    modelName: '基本',
    fields: {
      表面: { order: 0, value: '' },
      裏面: { order: 1, value: '' },
    },
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createNote(noteData);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNoteData((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [name]: { order: 0, value },
      },
    }));
  };

  return (
    <div>
      <h2>新規ノート作成</h2>
      <ToastContainer />
      {deckname === undefined ? (
        <p>デッキ名がありません</p>
      ) : (
        <>
          <p>デッキ名: {deckname}</p>
          <form onSubmit={handleSubmit}>
            <TextField
              id="surface"
              label="表面"
              name="表面"
              value={noteData.fields.表面.value}
              multiline
              rows={10}
              onChange={handleChange}
            />
            <TextField
              id="back"
              label="裏面"
              name="裏面"
              value={noteData.fields.裏面.value}
              multiline
              rows={10}
              onChange={handleChange}
            />
            <Button variant="contained" color="primary" type="submit">
              作成
            </Button>
          </form>
        </>
      )}
      <Link to={`/decks/${deckname}`}>戻る</Link>
    </div>
  );
}
