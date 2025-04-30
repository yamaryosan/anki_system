import Card from '@mui/material/Card';
import { v4 } from 'uuid';

type props = {
  noteId: string;
  front: string;
  setClickedNoteId: (clickedNoteId: string | null) => void;
  setIsOpen: (isOpen: boolean) => void;
};

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

/**
 * コードの言語を取得する
 * @param text テキスト
 * @returns コードの言語
 */
function getCodeLanguage(text: string) {
  return text.match(/<code class="language-(.*)">/)?.[1];
}

export default function Note({
  noteId,
  front,
  setClickedNoteId,
  setIsOpen,
}: props) {
  const codeLanguage = getCodeLanguage(front);

  return (
    <>
      {codeLanguage && <div>{codeLanguage}</div>}
      <Card
        variant="outlined"
        sx={{
          cursor: 'pointer',
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
        key={noteId}
        onClick={() => {
          setClickedNoteId(noteId);
          setIsOpen(true);
        }}
      >
        {decodeHtmlEntities(removeCodeTags(removePreTags(front)))
          ?.split('\n')
          .map((line) => (
            <div key={line}>
              {line.split(' ').map((word, wordIndex) => (
                <span key={v4()}>
                  {word}
                  {wordIndex !== line.split(' ').length - 1 && '\u00A0'}
                </span>
              ))}
            </div>
          ))}
      </Card>
    </>
  );
}
