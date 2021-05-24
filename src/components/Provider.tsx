import React, { useState, useContext, useCallback } from 'react';
import { Editor } from 'building-editor';
import { EditorContext } from '../EditorContext';

interface Props {
  children: React.ReactNode;
}

const Provider: React.VFC<Props> = ({ children }) => {
  const editorContext = useContext(EditorContext);
  const [editor, setEditorState] = useState<Editor>(editorContext.editor);

  const setEditor = useCallback((newEditor: Editor) => {
    if (editor.config.getKey('debug')) {
      const dateTime = /\d\d:\d\d:\d\d/.exec(new Date().toString());
      dateTime && console.log('[' + dateTime[0] + ']', 'Editor state changed with', newEditor);
    }
    const clone = Object.assign(Object.create(Object.getPrototypeOf(newEditor)), newEditor);
    setEditorState(clone);
  }, [editor.config]);

  return <EditorContext.Provider value={{ editor, setEditor }}>{children}</EditorContext.Provider>;
}

export default Provider;
