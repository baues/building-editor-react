import { useEffect, useCallback, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls//OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { Commands, EditorControls } from 'building-editor';
import { useEditor } from './useEditor';
import { useActions } from './useActions';
import { throttle } from '../utils/throttle';

const IS_MAC = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const onDownPosition = new THREE.Vector2();
const onUpPosition = new THREE.Vector2();
const onDoubleClickPosition = new THREE.Vector2();

// eslint-disable-next-line max-len
export type Key = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export interface BEREventConfig {
  'shortcuts/translate': Key;
  'shortcuts/rotate': Key;
  'shortcuts/scale': Key;
  'shortcuts/undo': Key;
  'shortcuts/focus': Key;
  'delete/enabled': boolean;
  'contextmenu/enabled': boolean;
}

export type EventConfig = Partial<BEREventConfig>;

const defaultConfig: BEREventConfig = {
  'shortcuts/translate': 't',
  'shortcuts/rotate': 'r',
  'shortcuts/scale': 's',
  'shortcuts/undo': 'z',
  'shortcuts/focus': 'f',
  'delete/enabled': true,
  'contextmenu/enabled': true,
};

function useEventListener(
  eventName: string,
  handler: (arg0: any) => void,
  element: Window | Document | HTMLCanvasElement | HTMLDivElement | EditorControls | OrbitControls | TransformControls = window,
): void {
  useEffect(() => {
    if (element instanceof Window || element instanceof Document || element instanceof HTMLCanvasElement || element instanceof HTMLDivElement) {
      element.addEventListener(eventName, handler);
    } else {
      element.addEventListener(eventName, handler);
    }

    return (): void => {
      element.removeEventListener(eventName, handler);
    };
  }, [element, eventName, handler]);
}

function useResizeListener(): void {
  const { setSceneSize } = useActions();

  const onWindowResize = useCallback((): void => {
    setSceneSize();
  }, [setSceneSize]);

  useEventListener('resize', onWindowResize);
}

function useEditorControlsListener(): void {
  const editorContext = useEditor();
  const { editor, setEditor } = editorContext;
  const { editorControls } = editor;

  const onUpdate = useCallback((): void => {
    editor.render();
    setEditor(editor);
  }, [editor, setEditor]);

  useEventListener('update', onUpdate, editorControls);
}

function useOrbitControlsListener(): void {
  const { editor } = useEditor();
  const { orbitControls } = editor;

  const onChange = useCallback((): void => {
    editor.render();
    editor.viewCubeControls.update();
  }, [editor]);

  useEventListener('change', onChange, orbitControls);
}

function useTransformControlsListener(): void {
  const { editor } = useEditor();
  const { helpers, orbitControls, selectionBox, transformControls } = editor;
  const { render } = useActions();
  let objectPositionOnDown: THREE.Vector3 | null = null;
  let objectRotationOnDown: THREE.Euler | null = null;
  let objectScaleOnDown: THREE.Vector3 | null = null;

  const onChange = useCallback((): void => {
    const object = transformControls.object;

    if (object) {
      selectionBox.setFromObject(object);

      const helper = helpers[object.id];

      if (helper && !(helper instanceof THREE.SkeletonHelper)) {
        helper.update();
      }
    }

    render();
  }, [helpers, render, selectionBox, transformControls.object]);

  const onMouseDown = useCallback((): void => {
    const object = transformControls.object;
    if (!object) return;

    objectPositionOnDown = object.position.clone();
    objectRotationOnDown = object.rotation.clone();
    objectScaleOnDown = object.scale.clone();

    orbitControls.enabled = false;
  }, []);

  const onMouseUp = useCallback((): void => {
    const object = transformControls.object;

    if (object !== undefined) {
      switch (transformControls.getMode()) {
        case 'translate':
          if (!objectPositionOnDown) break;
          if (!objectPositionOnDown.equals(object.position)) {
            editor.execute(new Commands.SetPositionCommand(editor, object, object.position, objectPositionOnDown));
          }
          break;

        case 'rotate':
          if (!objectRotationOnDown) break;
          if (!objectRotationOnDown.equals(object.rotation)) {
            editor.execute(new Commands.SetRotationCommand(editor, object, object.rotation, objectRotationOnDown));
          }
          break;

        case 'scale':
          if (!objectScaleOnDown) break;
          if (!objectScaleOnDown.equals(object.scale)) {
            editor.execute(new Commands.SetScaleCommand(editor, object, object.scale, objectScaleOnDown));
          }
          break;
        default:
          if (editor.config.getKey('debug')) {
            console.error('unknown control mode');
          }
          break;
      }
    }

    orbitControls.enabled = true;
  }, [editor, objectPositionOnDown, objectRotationOnDown, objectScaleOnDown, orbitControls, transformControls]);

  useEventListener('change', onChange, transformControls);
  useEventListener('mouseDown', onMouseDown, transformControls);
  useEventListener('mouseUp', onMouseUp, transformControls);
  useEventListener('touchstart', onMouseDown, transformControls);
  useEventListener('touchend', onMouseUp, transformControls);
}

function getMousePosition(dom: HTMLCanvasElement, x: number, y: number): number[] {
  const rect = dom.getBoundingClientRect();
  return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
}

function useGetIntersects(): (point: THREE.Vector2, objects: THREE.Object3D[]) => THREE.Intersection[] {
  const { editor: { mouse, raycaster, camera } } = useEditor();

  const getIntersects = useCallback(
    (point, objects) => {
      mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);

      raycaster.setFromCamera(mouse, camera);

      return raycaster.intersectObjects(objects);
    },
    [camera, mouse, raycaster],
  );

  return getIntersects;
}

function useClick(): () => void {
  const { editor } = useEditor();
  const getIntersects = useGetIntersects();
  const { select } = useActions();

  const isVisible = useCallback((object: THREE.Object3D): boolean => {
    let bool = object.visible;

    if (bool) {
      object.traverseAncestors((parent) => {
        if (!parent.visible) bool = false;
      });
    }
    return bool;
  }, []);

  const click = useCallback(() => {
    if (onDownPosition.distanceTo(onUpPosition) < 1e-3) {
      const objects: THREE.Object3D[] = []; // editor.objects is not accurate in some condition. should fix
      editor.scene.traverse(child => (child instanceof THREE.Mesh && isVisible(child)) && objects.push(child));
      const intersects = getIntersects(onUpPosition, objects);

      if (intersects.length > 0) {
        let object: THREE.Object3D | null = null;
        for (const intersection of intersects) {
          const iObject = intersection.object;
          object = iObject;
          break;
        }

        if (object?.userData.object !== undefined) {
          select(object.userData.object);
        } else {
          select(object);
        }
      } else {
        select(null);
      }
    }
  }, [editor.scene, getIntersects, isVisible, select]);

  return click;
}

function useMouseUpDownListener(): void {
  const { editor } = useEditor();
  const { renderer } = editor;
  const click = useClick();

  const onMouseDown = useCallback((event: MouseEvent): void => {
    const array = getMousePosition(renderer.domElement, event.clientX, event.clientY);
    onDownPosition.fromArray(array);
  }, [renderer.domElement]);

  const onMouseUp = useCallback((event: MouseEvent): void => {
    const array = getMousePosition(renderer.domElement, event.clientX, event.clientY);
    onUpPosition.fromArray(array);

    click();
  }, [click, renderer.domElement]);

  useEventListener('pointerdown', onMouseDown, renderer.domElement);
  useEventListener('pointerup', onMouseUp, renderer.domElement);
}

function useTouchStartEndListener(): void {
  const { editor } = useEditor();
  const { renderer } = editor;
  const click = useClick();

  const onTouchStart = useCallback((event: TouchEvent): void => {
    const touch = event.changedTouches[0];

    const array = getMousePosition(renderer.domElement, touch.clientX, touch.clientY);
    onDownPosition.fromArray(array);
  }, [renderer.domElement]);

  const onTouchEnd = useCallback((event: TouchEvent): void => {
    const touch = event.changedTouches[0];

    const array = getMousePosition(renderer.domElement, touch.clientX, touch.clientY);
    onUpPosition.fromArray(array);

    click();
  }, [click, renderer.domElement]);

  useEventListener('touchstart', onTouchStart, renderer.domElement);
  useEventListener('touchend', onTouchEnd, renderer.domElement);
}

function useDoubleClickListener(): void {
  const { editor } = useEditor();
  const { renderer, objects } = editor;
  const getIntersects = useGetIntersects();
  const { focus } = useActions();

  const onDoubleClick = useCallback((event: MouseEvent): void => {
    const array = getMousePosition(renderer.domElement, event.clientX, event.clientY);
    onDoubleClickPosition.fromArray(array);

    const intersects = getIntersects(onDoubleClickPosition, objects);

    if (intersects.length > 0) {
      const intersect = intersects[0];

      focus(intersect.object);
    }
  }, [focus, getIntersects, objects, renderer.domElement]);

  useEventListener('dblclick', onDoubleClick, renderer.domElement);
}

function useContextMenuListener(config: BEREventConfig): void {
  const editorContext = useEditor();
  const { editor, setEditor } = editorContext;

  const onContextMenu = useCallback((event: MouseEvent): void | boolean => {
    if (config['contextmenu/enabled']) {
      event.preventDefault();
      editor.contextMenu.open = true;
      editor.contextMenu.x = event.clientX;
      editor.contextMenu.y = event.clientY;
      setEditor(editor);
    } else {
      return true;
    }
  }, [config, editor, setEditor]);

  useEventListener('contextmenu', onContextMenu, editor.renderer.domElement);
}

function useKeyDownListener(config: BEREventConfig): void {
  const editorContext = useEditor();
  const { editor } = editorContext;
  const { removeObject } = useActions();

  const removeSelected = useCallback((): void => {
    const object = editor.selected;
    if (object === null) return;
    removeObject(object);
  }, [editor.selected, removeObject]);

  const onKeyDown = useCallback((event: KeyboardEvent): void => {
    switch (event.key?.toLowerCase()) {
      case 'backspace':
        // event.preventDefault();
        if (config['delete/enabled']) {
          removeSelected();
        }
        break;
      case 'delete':
        if (config['delete/enabled']) {
          removeSelected();
        }
        break;
      case config['shortcuts/translate']:
        editor.changeTransformMode('translate');
        break;
      case config['shortcuts/rotate']:
        editor.changeTransformMode('rotate');
        break;
      case config['shortcuts/scale']:
        editor.changeTransformMode('scale');
        break;
      case config['shortcuts/undo']:
        if (IS_MAC ? event.metaKey : event.ctrlKey) {
          event.preventDefault(); // Prevent browser specific hotkeys
          if (event.shiftKey) {
            editor.redo();
          } else {
            editor.undo();
          }
        }
        break;
      case config['shortcuts/focus']:
        if (editor.selected !== null) {
          editor.focus(editor.selected);
        }
        break;
      default:
        break;
    }
  }, [config, editor, removeSelected]);

  useEventListener('keydown', onKeyDown, document);
}

function useMouseMove(): void {
  const { editor } = useEditor();
  const { renderer, objects } = editor;
  const getIntersects = useGetIntersects();
  const { setHovered } = useActions();
  const [intersectObject, setIntersectObject] = useState<THREE.Object3D | null>(null);

  const onMouseMove = useCallback((event: MouseEvent): void => {
    const array = getMousePosition(renderer.domElement, event.clientX, event.clientY);
    onDoubleClickPosition.fromArray(array);

    const intersects = getIntersects(onDoubleClickPosition, objects);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      setIntersectObject(intersect.object);
    } else {
      setIntersectObject(null);
    }
  }, [getIntersects, objects, renderer.domElement]);

  useEffect(() => {
    setHovered(intersectObject);
  }, [intersectObject]);

  useEventListener('mousemove', (e) => throttle(onMouseMove, 200, e), document);
}

function useDragDrop(): void {
  const editorContext = useEditor();
  const { editor } = editorContext;

  const handleDragOver = useCallback((event: DragEvent): void => {
    if (!event.dataTransfer) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((event: DragEvent): void => {
    if (!event.dataTransfer) return;
    event.preventDefault();

    if (event.dataTransfer.types[0] === 'text/plain') return; // Outliner drop

    if (event.dataTransfer.items) {
      // DataTransferItemList supports folders
      editor.loader.loadItemList(event.dataTransfer.items as unknown as DataTransferItem[]);
    } else {
      editor.loader.loadFiles(event.dataTransfer.files as unknown as File[]);
    }
  }, [editor.loader]);

  useEventListener('dragover', handleDragOver, document);
  useEventListener('drop', handleDrop, document);
}

function useViewCubeControls(): void {
  const { editor } = useEditor();
  const DEGTORAD = THREE.MathUtils.DEG2RAD;

  const rotate = useCallback((a: number, b: number, c: number): void => {
    const fwd = new THREE.Vector3();
    const euler = new THREE.Euler(a, b, c);

    const finishQuaternion = new THREE.Quaternion()
      .copy(editor.camera.quaternion)
      .setFromEuler(euler);
    fwd.set(0, 0, -1);
    fwd.applyQuaternion(finishQuaternion);
    fwd.multiplyScalar(100);
    editor.camera.position.copy(editor.orbitControls.target).sub(fwd);
    editor.orbitControls.update();
  }, [editor.camera.position, editor.camera.quaternion, editor.orbitControls]);

  const onClick = useCallback((e: any): void => {
    switch (e.target.id) {
      case 'front':
        rotate(0, 0, 0);
        break;
      case 'back':
        rotate(0, 180 * DEGTORAD, 0);
        break;
      case 'top':
        rotate(-90 * DEGTORAD, 0, 0);
        break;
      case 'bottom':
        rotate(90 * DEGTORAD, 0, 0);
        break;
      case 'left':
        rotate(0, -90 * DEGTORAD, 0);
        break;
      case 'right':
        rotate(0, 90 * DEGTORAD, 0);
        break;
    }
  }, [DEGTORAD, rotate]);

  useEventListener('click', onClick, editor.viewCubeControls.element);
}

export function useEvents(config?: EventConfig): void {
  const eventConfig = useMemo((): BEREventConfig => {
    return {
      ...defaultConfig,
      ...config,
    };
  }, [config]);

  useResizeListener();
  useEditorControlsListener();
  useOrbitControlsListener();
  useTransformControlsListener();
  useMouseUpDownListener();
  useTouchStartEndListener();
  useDoubleClickListener();
  useContextMenuListener(eventConfig);
  useKeyDownListener(eventConfig);
  useMouseMove();
  useDragDrop();
  useViewCubeControls();
}
