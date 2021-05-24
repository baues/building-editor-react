import { useContext, useMemo } from 'react';
import { StencilPlane } from 'building-editor';
import { EditorContext, EditorContextProps } from '../EditorContext';

export function useEditor(): EditorContextProps {
  return useContext(EditorContext);
}

export interface EditorState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  sceneHelpers: THREE.Scene;
  camera: THREE.Camera;
  raycaster: THREE.Raycaster;
  selected: THREE.Object3D | null;
  hovered: THREE.Object3D | null;
  gridHelper: THREE.GridHelper;
  axesHelper: THREE.AxesHelper;
  planeHelper: THREE.PlaneHelper;
  stencilPlane: StencilPlane;
}

export function useEditorState(): EditorState {
  const { editor: { renderer, scene, sceneHelpers, viewportCamera, raycaster, selected, hovered, gridHelper, axesHelper, planeHelper, stencilPlane } } = useEditor();

  const editorState: EditorState = useMemo(() => {
    return {
      renderer,
      scene,
      sceneHelpers,
      camera: viewportCamera,
      raycaster,
      selected,
      hovered,
      gridHelper,
      axesHelper,
      planeHelper,
      stencilPlane,
    };
  }, [axesHelper, gridHelper, planeHelper, renderer, scene, sceneHelpers, selected, hovered, stencilPlane, viewportCamera, raycaster]);

  return editorState;
}
