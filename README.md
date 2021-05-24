# building-editor-react

React wrapper for [building-editor](https://github.com/baues/building-editor)

## Installation

```
npm install building-editor-react
```

## Usage

At any parent component
```js
import { Provider } from 'building-editor-react';

function MyEditorParent() {
  return (
    <Provider>
      Your children
    </Provider>
  );
}
```

At any child component
```js
import { Editor, ViewCube, useEvents } from 'building-editor-react';
import MyMenu from './MyMenu'; // your menu component described below

function MyEditor() {
  useEvents(); // if you need

  return (
    <>
      <Editor contextMenu={<MyMenu />} />
      <ViewCube style={{ position: 'absolute', zIndex: 1, left: 50, bottom: 50 }} />
    </>
  );
}
```

## API

### Editor

Editor component to make your editor. It takes `config` and `contextMenu` props.

### Provider

Editor context provider component which must be placed parent component of Editor.

### ContextMenu, ContextMenuItem, useContextMenuClose

Create your custom context menu component as below.

```js
import { ContextMenu, ContextMenuItem, useContextMenuClose } from 'building-editor-react';

function MyMenu() {
  const closeContextMenu = useContextMenuClose();

  return (
    <ContextMenu
      onClose={closeContextMenu}
    >
      <ContextMenuItem>Your Menu</ContextMenuItem>
      <ContextMenuItem>Your Menu2</ContextMenuItem>
    </ContextMenu>
  );
}
```

### ViewCube

Built-in ViewCube component. It's not able to be customized for now.

### useEditor, useEditorState

Editor instance of `building-editor` is accessible from this hooks. You can get whole editor instance with useEditor while curated properties are available with useEditorState.

```js
const { editor, setEditor } = useEditor();
const { renderer, scene, sceneHelpers, viewportCamera, raycaster, selected, hovered, gridHelper, axesHelper, planeHelper, stencilPlane } = useEditorState();

```

### useActions

Many actions are available from this hooks. Check [here](https://github.com/baues/building-editor-react/blob/main/src/hooks/useActions.ts) to use them.

### useEvents

This is built-in handler of `building-editor` events. It's not necessary to use this, but you can easily create editor behavior with `useEvent`.
