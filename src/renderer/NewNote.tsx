import { useParams, Link } from 'react-router-dom';
import { useState, ChangeEvent, FormEvent } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useSnackbar } from 'notistack';
import SwitchCodeAndSentenceButton from './SwitchCodeAndSentenceButton';
import LanguageSelectBox from './LanguageSelectBox';

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

// 文字列をHTML形式に変換する
export function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default function NewNote() {
  const { enqueueSnackbar } = useSnackbar();
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

  // コードによるシンタックスハイライトを行うかどうか
  const [isFrontHighlight, setIsFrontHighlight] = useState(false);
  const [isBackHighlight, setIsBackHighlight] = useState(false);

  // シンタックスハイライト時の言語
  const [frontLanguage, setFrontLanguage] = useState<string>('typescript');
  const [backLanguage, setBackLanguage] = useState<string>('typescript');

  // コードのシンタックスハイライトを行う際に付与する文字列
  const prefix = `<pre style="display:flex; justify-content:center;"><code class="language-${frontLanguage.toLowerCase()}">`;
  const suffix = '</code></pre>';

  const handleFrontHighlightChange = () => {
    setIsFrontHighlight(!isFrontHighlight);
  };

  const handleBackHighlightChange = () => {
    setIsBackHighlight(!isBackHighlight);
  };

  async function createNote(newNoteData: NewNoteData) {
    const result = await window.electron.ipcRenderer.invoke(
      'create-note',
      newNoteData,
    );
    if (result === 'duplicate') {
      enqueueSnackbar('内容が重複していたため、作成できませんでした。', {
        variant: 'error',
        autoHideDuration: 2000,
      });
    }
    if (result === 'success') {
      enqueueSnackbar('ノートを作成しました。', {
        variant: 'success',
        autoHideDuration: 2000,
      });
    }
  }

  // フォームの送信を行う
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // HTMLエスケープを行う
    const encodedSurface = escapeHtml(noteData.fields.表面.value);
    const encodedBack = escapeHtml(noteData.fields.裏面.value);
    // シンタックスハイライトを行う
    const highlightedSurface = isFrontHighlight
      ? `${prefix}${encodedSurface}${suffix}`
      : encodedSurface;
    const highlightedBack = isBackHighlight
      ? `${prefix}${encodedBack}${suffix}`
      : encodedBack;
    // シンタックスハイライトを行ったテキストをノートの内容として保存する
    const noteDataWithHighlight = {
      ...noteData,
      fields: {
        ...noteData.fields,
        表面: { order: 0, value: highlightedSurface },
        裏面: { order: 1, value: highlightedBack },
      },
    };
    if (
      noteDataWithHighlight.fields.表面.value === '' ||
      noteDataWithHighlight.fields.裏面.value === ''
    ) {
      enqueueSnackbar('ノートの内容を入力してください', {
        variant: 'error',
        autoHideDuration: 2000,
      });
      return;
    }
    // ノートを作成する
    await createNote(noteDataWithHighlight);
    // フォームの内容をリセットする
    setNoteData({
      deckName: deckname ?? '',
      modelName: '基本',
      fields: {
        表面: { order: 0, value: '' },
        裏面: { order: 1, value: '' },
      },
    });
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
      {deckname === undefined ? (
        <p>デッキ名がありません</p>
      ) : (
        <>
          <p>デッキ名: {deckname}</p>
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              padding: 2,
            }}
          >
            <TextField
              id="surface"
              label={isFrontHighlight ? '表面コード' : '表面文章'}
              name="表面"
              value={noteData.fields.表面.value}
              multiline
              rows={5}
              onChange={handleChange}
            />
            <SwitchCodeAndSentenceButton
              isHighlight={isFrontHighlight}
              onChange={handleFrontHighlightChange}
            />
            {isFrontHighlight && (
              <LanguageSelectBox
                language={frontLanguage}
                setLanguage={(language) => setFrontLanguage(language as string)}
              />
            )}
            <TextField
              id="back"
              label={isBackHighlight ? '裏面コード' : '裏面文章'}
              name="裏面"
              value={noteData.fields.裏面.value}
              multiline
              rows={5}
              onChange={handleChange}
            />
            <SwitchCodeAndSentenceButton
              isHighlight={isBackHighlight}
              onChange={handleBackHighlightChange}
            />
            {isBackHighlight && (
              <LanguageSelectBox
                language={backLanguage}
                setLanguage={(language) => setBackLanguage(language as string)}
              />
            )}
            <Button variant="contained" color="primary" type="submit">
              作成
            </Button>
          </form>
        </>
      )}
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to={`/decks/${deckname}`}
      >
        戻る
      </Button>
    </div>
  );
}
