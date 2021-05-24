import { useCallback } from 'react';
import * as THREE from 'three';
import { Geometry } from 'three/examples/jsm/deprecated/Geometry';
import { Commands, TransformControlsMode } from 'building-editor';
import { getViewSize } from '../utils/viewportUtils';
import { useEditor } from './useEditor';

export interface Actions {
  render: () => void;
  setSceneSize: () => void;
  select: (object: THREE.Object3D | null) => void;
  setHovered: (object: THREE.Object3D | null) => void;
  focus: (object: THREE.Object3D) => void;
  addGeometry: (geometry: Geometry) => void;
  addMaterialToRefCounter: (material: THREE.Material) => void;
  addMaterial: (material: THREE.Material) => void;
  getObjectMaterial: (object: THREE.Mesh, slot: number) => THREE.Material | THREE.Material[];
  setObjectMaterial: (object: THREE.Mesh, slot: number, newMaterial: THREE.Material) => void;
  addCamera: (camera: THREE.Camera) => void;
  addObject: (object: THREE.Object3D, parent?: THREE.Object3D, index?: number) => void;
  removeObject: (object: THREE.Object3D) => void;
  addObjectAsHelper: (object: THREE.Object3D) => void;
  clipGlobal: (setting?: Partial<{
    normal: THREE.Vector3;
    constant: number;
    size: number;
    enable: boolean;
    negate: boolean;
    displayHelper: boolean;
  }>) => void;
  setTransformControlsMode: (mode: TransformControlsMode) => void;
  updateGridHelper: (gridHelper: THREE.GridHelper) => void;
  updateAxesHelper: (axesHelper: THREE.AxesHelper) => void;
  loadFile: (file: File, parent?: THREE.Object3D, onLoad?: (object: THREE.Object3D | undefined, file: File) => void, onError?: (error: any) => void) => void;
  loadFiles: (files: File[], parent?: THREE.Object3D, onLoad?: (object: THREE.Object3D | undefined) => void, onError?: (error: any) => void) => void;
  loadFileFromLocal: (parent?: THREE.Object3D, onLoad?: (object: THREE.Object3D | undefined, file: File) => void, onError?: (error: any) => void) => void;
  loadFilesFromLocal: (parent?: THREE.Object3D, onLoad?: (object: THREE.Object3D | undefined) => void, onError?: (error: any) => void) => void;
  exportObject: () => void;
  exportScene: () => void;
  exportDAE: () => void;
  clearEditor: () => void;
}

export function useActions(): Actions {
  const editorContext = useEditor();
  const { editor, setEditor } = editorContext;
  const { renderer, camera, geometries, materials, materialsRefCounter } = editor;

  // Editor
  const render = useCallback(() => {
    editor.render();
  }, [editor]);

  const setSceneSize = useCallback((width?: number, height?: number) => {
    if (!width || !height) {
      const size = getViewSize();
      width = size.width;
      height = size.height;
    }

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    if (renderer.getPixelRatio() !== window.devicePixelRatio) {
      renderer.setPixelRatio(window.devicePixelRatio);
    }
    renderer.setSize(width, height);

    render();
  }, [camera, renderer, render]);

  const select = useCallback((object: THREE.Object3D | null) => {
    editor.select(object);
    setEditor(editor);
  }, [editor, setEditor]);

  const setHovered = useCallback((object: THREE.Object3D | null) => {
    editor.setHovered(object);
    setEditor(editor);
  }, [editor, setEditor]);

  const focus = useCallback(
    (object: THREE.Object3D) => {
      editor.focus(object);
    },
    [editor],
  );

  const clearEditor = useCallback(() => {
    editor.clear();
  }, [editor]);

  // Add
  const addGeometry = useCallback(
    (geometry: Geometry) => {
      geometries[geometry.uuid] = geometry;
    },
    [geometries],
  );

  const addMaterialToRefCounter = useCallback(
    (material: THREE.Material) => {
      let count = materialsRefCounter.get(material);

      if (count === undefined) {
        materialsRefCounter.set(material, 1);
        materials[material.uuid] = material;
      } else {
        count++;
        materialsRefCounter.set(material, count);
      }
    },
    [materials, materialsRefCounter],
  );

  const addMaterial = useCallback((material: THREE.Material) => editor.addMaterial(material), [editor]);

  const getObjectMaterial = useCallback((object: THREE.Mesh, slot: number): THREE.Material | THREE.Material[] => {
    let material = object.material;

    if (Array.isArray(material) && slot !== undefined) {
      material = material[slot];
    }

    return material;
  }, []);

  const setObjectMaterial = useCallback((object: THREE.Mesh, slot: number, newMaterial: THREE.Material): void => {
    if (Array.isArray(object.material) && object.material.length > 0 && slot !== undefined) {
      object.material[slot] = newMaterial;
    } else {
      object.material = newMaterial;
    }
  }, []);

  const addCamera = useCallback(
    (camera: THREE.Camera) => {
      editor.addCamera(camera);
      setEditor(editor);
    },
    [editor, setEditor],
  );

  const addObject = useCallback((object: THREE.Object3D, parent?: THREE.Object3D, index?: number) => {
    editor.execute(new Commands.AddObjectCommand(editor, object, parent, index));
    setEditor(editor);
  },
  [editor, setEditor],
  );

  const removeObject = useCallback((object: THREE.Object3D) => {
    if (object === null) return;
    const parent = object.parent;
    if (parent !== null) editor.execute(new Commands.RemoveObjectCommand(editor, object));
    setEditor(editor);
  },
  [editor, setEditor],
  );

  const addObjectAsHelper = useCallback((object: THREE.Object3D) => {
    editor.addObjectAsHelper(object);
    setEditor(editor);
  }, [editor, setEditor]);

  // View
  const clipGlobal = useCallback((setting?: Partial<{
    normal: THREE.Vector3;
    constant: number;
    size: number;
    enable: boolean;
    negate: boolean;
    displayHelper: boolean;
  }>): void => {
    const planeHelper = editor.planeHelper;

    if (planeHelper) {
      const normal = setting?.normal;
      const constant = setting?.constant;
      const size = setting?.size;
      const enable = setting?.enable === undefined ? true : setting.enable;
      const negate = setting?.negate === undefined ? false : setting.negate;
      const displayHelper = setting?.displayHelper === undefined ? true : setting.displayHelper;
      const plane = planeHelper.plane;

      if (normal) {
        plane.normal = normal;
      }
      if (constant) {
        plane.constant = constant;
      }
      if (size) {
        planeHelper.size = size;
      }

      planeHelper.visible = displayHelper;
      negate && plane.negate();
      editor.clip(enable);
    } else {
      console.warn('Need planeHelper for clip');
    }
  }, [editor]);

  const setTransformControlsMode = useCallback((mode: TransformControlsMode) => {
    editor.transformControls.setMode(mode);
  }, [editor.transformControls]);

  const updateGridHelper = useCallback((gridHelper: THREE.GridHelper) => {
    editor.updateGridHelper(gridHelper);
    setEditor(editor);
  }, [editor, setEditor]);

  const updateAxesHelper = useCallback((axesHelper: THREE.AxesHelper) => {
    editor.updateAxesHelper(axesHelper);
    setEditor(editor);
  }, [editor, setEditor]);

  // Import and Export
  const createFileElement = useCallback((): HTMLInputElement | null => {
    const viewportElement = document.getElementById('building-editor-viewport');
    if (!viewportElement) return null;

    const f = document.createElement('input');
    f.style.display = 'none';
    f.type = 'file';
    f.name = 'file';
    f.accept = '.3ds, .amf, .dae, .fbx, .glb, .gltf, .js, .json, .3geo, .3mat, .3obj, .3scn, .kmz, .md2, .obj, .ply, .stl, .svg, .vtk, .wrl';
    f.onclick = (e): void => {
      e.stopPropagation();
    };

    return f;
  }, []);

  const loadFile = useCallback((file: File, parent?: THREE.Object3D, onLoad?: (object: THREE.Object3D | undefined, file: File) => void, onError?: (error: any) => void) => {
    editor.loader.loadFile(file, undefined, parent, onLoad, onError);
  }, [editor.loader]);

  const loadFiles = useCallback((files: File[], parent?: THREE.Object3D, onLoad?: (object: THREE.Object3D | undefined) => void, onError?: (error: any) => void) => {
    editor.loader.loadFiles(files, undefined, parent, onLoad, onError);
  }, [editor.loader]);

  const loadFileFromLocal = useCallback((parent?: THREE.Object3D, onLoad?: (object: THREE.Object3D | undefined, file: File) => void, onError?: (error: any) => void) => {
    const viewportElement = document.getElementById('building-editor-viewport');
    if (!viewportElement) return;

    const f = createFileElement();
    if (!f) return;

    f.addEventListener('change', () => {
      f.files && editor.loader.loadFile(f.files[0], undefined, parent, onLoad, onError);
    });
    viewportElement.appendChild(f);
    f.click();
  }, [createFileElement, editor.loader]);

  const loadFilesFromLocal = useCallback((parent?: THREE.Object3D, onLoad?: (object: THREE.Object3D | undefined) => void, onError?: (error: any) => void) => {
    const viewportElement = document.getElementById('building-editor-viewport');
    if (!viewportElement) return;

    const f = createFileElement();
    if (!f) return;

    f.multiple = true;
    f.addEventListener('change', () => {
      f.files && editor.loader.loadFiles(f.files as unknown as File[], undefined, parent, onLoad, onError);
    });
    viewportElement.appendChild(f);
    f.click();
  }, [createFileElement, editor.loader]);

  const exportObject = useCallback(() => {
    editor.exporter.exportObject();
  }, [editor.exporter]);

  const exportScene = useCallback(() => {
    editor.exporter.exportScene();
  }, [editor.exporter]);

  const exportDAE = useCallback(() => {
    editor.exporter.exportDAE();
  }, [editor.exporter]);

  return {
    render,
    setSceneSize,
    select,
    setHovered,
    focus,
    addGeometry,
    addMaterialToRefCounter,
    addMaterial,
    getObjectMaterial,
    setObjectMaterial,
    addCamera,
    addObject,
    removeObject,
    addObjectAsHelper,
    clipGlobal,
    setTransformControlsMode,
    updateGridHelper,
    updateAxesHelper,
    loadFile,
    loadFiles,
    loadFileFromLocal,
    loadFilesFromLocal,
    exportObject,
    exportScene,
    exportDAE,
    clearEditor,
  };
}
