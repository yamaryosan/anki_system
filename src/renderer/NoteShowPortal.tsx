import { Card, TextField, Button } from '@mui/material';
import { useState, useEffect, useRef, FormEvent } from 'react';
import { useSnackbar } from 'notistack';
import SwitchCodeAndSentenceButton from './SwitchCodeAndSentenceButton';
import LanguageSelectBox from './LanguageSelectBox';

type props = {
  noteId: string;
  front: string;
  back: string;
  setClickedNoteId: (clickedNoteId: string | null) => void;
  onClose: () => void;
  onSave: () => void;
};

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
 * テキストがコードであるかどうかを判定する
 * @param text テキスト
 * @returns コードであるかどうか
 */
function isCode(text: string) {
  return text.includes('<code class="language-');
}

/**
 * コードの言語を取得する
 * @param text テキスト
 * @returns コードの言語
 */
function getCodeLanguage(text: string) {
  return text.match(/<code class="language-(.*)">/)?.[1];
}

// HTML形式のテキストをデコードする
function decodeHtmlEntities(str: string) {
  const parser = new DOMParser();
  const decoded = parser.parseFromString(str, 'text/html').body.textContent;
  // 改行を<br>に変換
  return decoded?.replace(/<br>/g, '\n');
}

// 文字列のうち<code>タグを削除する
function removeCodeTags(str: string) {
  return str.replace(/<code class="language-.*">|<\/code>/g, '');
}

// 文字列のうち<pre>タグを削除する
function removePreTags(str: string) {
  return str.replace(/<pre>|<\/pre>/g, '');
}

// 文字列をHTML形式に変換する
export function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default function NoteShowPortal({
  noteId,
  front,
  back,
  setClickedNoteId,
  onClose,
  onSave,
}: props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { enqueueSnackbar } = useSnackbar();

  // ノートの内容
  const [noteData, setNoteData] = useState<NewNoteData>({
    deckName: '',
    modelName: '',
    fields: {
      表面: { order: 0, value: '' },
      裏面: { order: 1, value: '' },
    },
  });
  // コードによるシンタックスハイライトを行うかどうか
  const [isFrontHighlight, setIsFrontHighlight] = useState(isCode(front));
  const [isBackHighlight, setIsBackHighlight] = useState(isCode(back));

  // シンタックスハイライト時の言語
  const [frontLanguage, setFrontLanguage] = useState<string>(
    isFrontHighlight ? (getCodeLanguage(front) ?? 'typescript') : '',
  );
  const [backLanguage, setBackLanguage] = useState<string>(
    isBackHighlight ? (getCodeLanguage(back) ?? 'typescript') : '',
  );

  // コードのシンタックスハイライトを行う際に付与する文字列
  const prefixFront = `<pre style="display:flex; justify-content:center;"><code class="language-${frontLanguage.toLowerCase()}">`;
  const prefixBack = `<pre style="display:flex; justify-content:center;"><code class="language-${backLanguage.toLowerCase()}">`;
  const suffix = '</code></pre>';

  const handleFrontHighlightChange = () => {
    setIsFrontHighlight(!isFrontHighlight);
  };

  const handleBackHighlightChange = () => {
    setIsBackHighlight(!isBackHighlight);
  };

  // クリックした場所がモーダルの外側であるか、ESCキーを押されたら閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  // ノートの内容を更新する
  useEffect(() => {
    setNoteData({
      deckName: '',
      modelName: '',
      fields: {
        表面: { order: 0, value: front },
        裏面: { order: 1, value: back },
      },
    });
  }, [front, back]);

  // 閉じるボタンを押したとき
  const handleClose = () => {
    onClose();
    setClickedNoteId(null);
  };

  // カードの内容を更新する
  async function updateNote(noteDataWithHighlight: NewNoteData) {
    await window.electron.ipcRenderer.invoke('update-note', noteId, {
      fields: {
        表面: {
          order: 0,
          value: noteDataWithHighlight.fields.表面.value,
        },
        裏面: {
          order: 1,
          value: noteDataWithHighlight.fields.裏面.value,
        },
      },
    });
  }

  // 保存ボタンを押したとき
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 既存のシンタックスハイライトを削除する
    const decodedSurface = removePreTags(
      removeCodeTags(decodeHtmlEntities(noteData.fields.表面.value) ?? ''),
    );
    const decodedBack = removePreTags(
      removeCodeTags(decodeHtmlEntities(noteData.fields.裏面.value) ?? ''),
    );
    // HTMLエスケープを行う
    const encodedSurface = escapeHtml(decodedSurface);
    const encodedBack = escapeHtml(decodedBack);
    // シンタックスハイライトを行う
    const highlightedSurface = isFrontHighlight
      ? `${prefixFront}${encodedSurface}${suffix}`
      : decodedSurface;
    const highlightedBack = isBackHighlight
      ? `${prefixBack}${encodedBack}${suffix}`
      : decodedBack;
    // シンタックスハイライトを行ったテキストをノートの内容として保存する
    const noteDataWithHighlight = {
      ...noteData,
      fields: {
        ...noteData.fields,
        表面: { order: 0, value: highlightedSurface },
        裏面: { order: 1, value: highlightedBack },
      },
    };
    // データが変更されていない場合は保存しない
    if (
      noteDataWithHighlight.fields.表面.value === front &&
      noteDataWithHighlight.fields.裏面.value === back
    ) {
      return;
    }
    // 表面あるいは裏面が空の場合は保存しない
    if (
      noteDataWithHighlight.fields.表面.value === '' ||
      noteDataWithHighlight.fields.裏面.value === ''
    ) {
      enqueueSnackbar('カードの内容が空です', {
        variant: 'error',
      });
      return;
    }
    // データを保存
    await updateNote(noteDataWithHighlight);
    enqueueSnackbar('保存しました', {
      variant: 'success',
    });
    // ポータルを閉じる
    onClose();
    // データを更新
    onSave();
  };

  return (
    <Card
      variant="outlined"
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: 2,
      }}
    >
      <Button onClick={handleClose}>閉じる</Button>
      <form onSubmit={handleSubmit}>
        <TextField
          label="表面"
          multiline
          rows={5}
          value={decodeHtmlEntities(noteData.fields.表面.value)}
          onChange={(e) =>
            setNoteData({
              ...noteData,
              fields: {
                ...noteData.fields,
                表面: { order: 0, value: e.target.value },
              },
            })
          }
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
          label="裏面"
          multiline
          rows={5}
          value={decodeHtmlEntities(noteData.fields.裏面.value)}
          onChange={(e) =>
            setNoteData({
              ...noteData,
              fields: {
                ...noteData.fields,
                裏面: { order: 1, value: e.target.value },
              },
            })
          }
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
          保存
        </Button>
      </form>
    </Card>
  );
}
