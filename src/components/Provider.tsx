import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Editor } from 'building-editor';
import { EditorContext } from '../EditorContext';

interface Props {
  children: React.ReactNode;
  editor?: Editor;
}

const Provider: React.VFC<Props> = ({ children, editor: initialEditor }) => {
  const editorContext = useContext(EditorContext);
  const [editor, setEditorState] = useState<Editor>(initialEditor || editorContext.editor);

  const setEditor = useCallback(
    (newEditor: Editor) => {
      if (editor.config.getKey('debug')) {
        const dateTime = /\d\d:\d\d:\d\d/.exec(new Date().toString());
        dateTime && console.log('[' + dateTime[0] + ']', 'Editor state changed with', newEditor);
      }
      const clone = Object.assign(Object.create(Object.getPrototypeOf(newEditor)), newEditor);
      setEditorState(clone);
    },
    [editor.config],
  );

  useEffect(() => {
    setEditor(editor);
  }, []);

  return <EditorContext.Provider value={{ editor, setEditor }}>{children}</EditorContext.Provider>;
};

export default Provider;
