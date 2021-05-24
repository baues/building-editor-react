import React from 'react';
import { useInit } from '../hooks/useInit';
import { useEditor } from '../hooks/useEditor';

export default function Viewport(props: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  const { editor } = useEditor();
  useInit();

  return (
    <div id="building-editor-viewport" style={{ width: '100%', height: '100%' }} {...props}>
      <div ref={(ref): HTMLCanvasElement | null => ref && ref.appendChild(editor.renderer.domElement)} />
    </div>
  );
}
