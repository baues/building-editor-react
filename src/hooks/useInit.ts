import { useEffect, useCallback } from 'react';
import { useActions } from './useActions';
import { useEditor } from './useEditor';

function useInitialRender(): void {
  const { render } = useActions();

  useEffect(() => {
    render();
  }, []);
}

function useInitSetSceneSize(): void {
  const { setSceneSize } = useActions();

  useEffect(() => {
    setSceneSize();
  }, []);
}


function useEventCatch(): void {
  const { editor, setEditor } = useEditor();

  const updateEditor = useCallback(() => {
    setEditor(editor);
  }, [editor, setEditor]);

  useEffect(() => {
    editor.editorControls.addEventListener('update', updateEditor);

    return () => editor.editorControls.removeEventListener('update', updateEditor);
  }, []);
}

export function useInit(): void {
  useInitialRender();
  useInitSetSceneSize();
  useEventCatch();
}
