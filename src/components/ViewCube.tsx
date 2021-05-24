import React from 'react';
import { useEditor } from '../hooks/useEditor';

type Props = React.HTMLAttributes<HTMLDivElement>;

const ViewCube: React.VFC<Props> = (props) => {
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

export default ViewCube;
