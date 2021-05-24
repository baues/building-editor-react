import React, { useEffect } from 'react';
import { EditorConfig } from 'building-editor';
import { useEditor } from '../hooks/useEditor';
import Viewport from './Viewport';

interface EditorProps {
  contextMenu?: React.ReactElement;
  config?: EditorConfig;
}

type Props = Omit<React.HTMLAttributes<HTMLDivElement>, keyof EditorProps> & EditorProps;

export default function Editor({ contextMenu, config, ...others }: Props): React.ReactElement {
  const { editor, setEditor } = useEditor();

  useEffect(() => {
    if (config) {
      editor.setConfig(config);
      setEditor(editor);
    }
  }, [config]);

  return (
    <>
      <Viewport {...others} />
      {contextMenu}
    </>
  );
}
