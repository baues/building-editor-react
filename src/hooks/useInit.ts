import { useEffect } from 'react';
import { useActions } from './useActions';

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

export function useInit(): void {
  useInitialRender();
  useInitSetSceneSize();
}
