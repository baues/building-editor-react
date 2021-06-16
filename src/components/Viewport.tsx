import React from 'react';
import { useInit } from '../hooks/useInit';
import { useEditor } from '../hooks/useEditor';

const Viewport: React.VFC<React.HTMLAttributes<HTMLDivElement>> = (props) => {
  const { editor } = useEditor();
  useInit();

  return (
    <div id="building-editor-viewport" style={{ width: '100%', height: '100%' }} {...props}>
      <div ref={(ref): HTMLCanvasElement | null => ref && ref.appendChild(editor.renderer.domElement)} />
    </div>
  );
};

export default Viewport;
