import { createContext } from 'react';
import { Editor } from 'building-editor';

// editor
const editor = new Editor();

// Create React Context
export interface EditorContextProps {
  editor: Editor;
  setEditor: (editor: Editor) => void;
}

const initialEditorContext: EditorContextProps = {
  editor,
  setEditor: (): void => {},
};

export const EditorContext = createContext<EditorContextProps>(initialEditorContext);
