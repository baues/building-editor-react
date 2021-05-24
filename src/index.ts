import { EditorConfig, EditorSettings } from 'building-editor';
import Editor from './components/Editor';
import Provider from './components/Provider';
import ContextMenu, { useContextMenuClose } from './components/ContextMenu';
import ContextMenuItem from './components/ContextMenuItem';
import ViewCube from './components/ViewCube';
import { useEditor, useEditorState, EditorState } from './hooks/useEditor';
import { useActions, Actions } from './hooks/useActions';
import { useEvents, EventConfig } from './hooks/useEvents';

export {
  Editor,
  Provider,
  ContextMenu,
  ContextMenuItem,
  ViewCube,
  useContextMenuClose,
  useEditor,
  useEditorState,
  useActions,
  useEvents,
};

export type {
  EditorConfig,
  EditorSettings,
  EditorState,
  Actions,
  EventConfig,
};
