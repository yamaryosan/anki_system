import Card from '@mui/material/Card';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';

const StyledCard = styled(Card)`
  cursor: pointer;
  width: 90%;
  font-size: 1.2rem;
  box-shadow: 0 0 0px 0 rgba(0, 0, 0, 0.1);
  padding: 10px;
  margin: 5px;
  border-radius: 5px;
  border: 1px solid #000;
  &:hover {
    background-color: #f0f0f0;
    transition: background-color 0.3s ease;
  }
`;

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

export default function Note({
  noteId,
  front,
  setClickedNoteId,
  setIsOpen,
}: props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <StyledCard
        key={noteId}
        onClick={() => {
          setClickedNoteId(noteId);
          setIsOpen(true);
        }}
      >
        {decodeHtmlEntities(removeCodeTags(removePreTags(front)))
          ?.split('\n')
          .map((line) => (
            <div key={uuidv4()}>
              {line.split(' ').map((word, wordIndex) => (
                <span key={uuidv4()}>
                  {word}
                  {wordIndex !== line.split(' ').length - 1 && '\u00A0'}
                </span>
              ))}
            </div>
          ))}
      </StyledCard>
    </div>
  );
}
