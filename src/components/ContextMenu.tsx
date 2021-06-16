import React, { useCallback, useEffect, useRef } from 'react';
import { useMemo } from 'react';
import { useEditor } from '../hooks/useEditor';

export function useContextMenuClose(): () => void {
  const editorContext = useEditor();
  const { editor, setEditor } = editorContext;
  const { contextMenu } = editor;
  const open = contextMenu.open && contextMenu.y !== null && contextMenu.x !== null;

  const closeContextMenu = useCallback(() => {
    if (open) {
      contextMenu.open = false;
      contextMenu.x = null;
      contextMenu.y = null;
      setEditor(editor);
    }
  }, [contextMenu, editor, open, setEditor]);

  return closeContextMenu;
}

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
        top: contextMenu.y ? contextMenu.y - 2 : 0,
        left: contextMenu.x ? contextMenu.x - 4 : 0,
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
