import React from 'react';
import { useInit } from '../hooks/useInit';
import { useEditor } from '../hooks/useEditor';

const Viewport: React.VFC<React.HTMLAttributes<HTMLDivElement>> = (props) => {
  const { editor } = useEditor();
  useInit();

  const toggleContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (editor.contextMenu.open) {
      editor.contextMenu.hide();
    } else {
      editor.contextMenu.show(e.clientX, e.clientY);
    }
  };

  return (
    <div id="building-editor-viewport" style={{ width: '100%', height: '100%' }} {...props}>
      <div ref={(ref): HTMLCanvasElement | null => ref && ref.appendChild(editor.renderer.domElement)} onContextMenu={toggleContextMenu} />
    </div>
  );
};

export default Viewport;
