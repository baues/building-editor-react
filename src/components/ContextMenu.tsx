import React, { useEffect, useRef, useMemo } from 'react';
import { useEditor } from '../hooks/useEditor';

function useOutsideClick(ref: React.MutableRefObject<HTMLDivElement | null>, action: () => void): void {
  const { editor } = useEditor();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      const current = ref.current;
      const target = event.target as Node;
      if (current && target && !current.contains(target) && action) {
        action();
      }
    }

    editor.renderer.domElement.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('mousedown', handleClickOutside);
    return (): void => {
      editor.renderer.domElement.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [action, editor.renderer.domElement, ref]);
}

interface Props {
  children: React.ReactNode;
  onClose: () => void;
}

const ContextMenu: React.VFC<Props> = ({ children, onClose }) => {
  const { editor } = useEditor();
  const { contextMenu } = editor;
  const open = contextMenu.open && contextMenu.y !== null && contextMenu.x !== null;
  const wrapperRef = useRef(null);
  useOutsideClick(wrapperRef, onClose);

  const styles = useMemo(() => {
    return {
      menu: {
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 5,
        overflow: 'hidden',
        top: contextMenu.y || 0,
        left: contextMenu.x || 0,
      },
      menuClose: {
        display: 'none',
      },
    };
  }, [contextMenu.x, contextMenu.y]);

  return (
    <div style={open ? styles.menu : styles.menuClose} ref={wrapperRef}>
      {children}
    </div>
  );
};

export default ContextMenu;
