import React, { useEffect } from 'react';
import { EditorConfig } from 'building-editor';
import { useEditor } from '../hooks/useEditor';
import Viewport from './Viewport';

interface EditorProps {
  contextMenu?: React.ReactElement;
  config?: EditorConfig;
}

type Props = Omit<React.HTMLAttributes<HTMLDivElement>, keyof EditorProps> & EditorProps;

const Editor: React.VFC<Props> = ({ contextMenu, config, ...others }) => {
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
};

export default Editor;
