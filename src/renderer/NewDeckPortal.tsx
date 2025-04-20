import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

type props = {
  onClose: () => void;
};

export default function NewDeckPortal({ onClose }: props) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div ref={modalRef}>
        <h3>新規デッキ作成</h3>
        <button type="button" onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>,
    document.body,
  );
}
