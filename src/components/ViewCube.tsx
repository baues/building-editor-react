import React from 'react';
import { useEditor } from '../hooks/useEditor';

type Props = React.HTMLAttributes<HTMLDivElement>;

export default function ViewCube(props: Props): React.ReactElement {
  const { editor } = useEditor();

  if (!editor.viewCubeControls.visible) {
    return <></>;
  }

  return (
    <div {...props}>
      <div ref={(ref): HTMLDivElement | null => (ref as HTMLDivElement) && (ref as HTMLDivElement).appendChild(editor.viewCubeControls.element)} />
    </div>
  );
}
