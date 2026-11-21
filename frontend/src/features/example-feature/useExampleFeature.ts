import { useCallback, useMemo, useReducer } from 'react';
import { exampleReducer, initialState, selectVisible } from './example-feature.store';
import type { ExampleFilter, ExampleItem } from './ExampleFeature.types';

export interface ExampleFeatureApi {
  readonly visible: readonly ExampleItem[];
  readonly filter: ExampleFilter;
  readonly add: (title: string) => void;
  readonly toggle: (id: string) => void;
  readonly setFilter: (filter: ExampleFilter) => void;
}

export function useExampleFeature(): ExampleFeatureApi {
  const [state, dispatch] = useReducer(exampleReducer, initialState);
  const visible = useMemo(() => selectVisible(state), [state]);

  const add = useCallback((title: string): void => {
    dispatch({ type: 'add', item: { id: crypto.randomUUID(), title, done: false } });
  }, []);
  const toggle = useCallback((id: string): void => dispatch({ type: 'toggle', id }), []);
  const setFilter = useCallback((filter: ExampleFilter): void => dispatch({ type: 'setFilter', filter }), []);

  return { visible, filter: state.filter, add, toggle, setFilter };
}
