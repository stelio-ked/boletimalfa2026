import type { ExampleFilter, ExampleItem } from './ExampleFeature.types';

export interface ExampleState {
  readonly items: readonly ExampleItem[];
  readonly filter: ExampleFilter;
}

export type ExampleAction =
  | { readonly type: 'add'; readonly item: ExampleItem }
  | { readonly type: 'toggle'; readonly id: string }
  | { readonly type: 'setFilter'; readonly filter: ExampleFilter };

export const initialState: ExampleState = { items: [], filter: 'all' };

export function exampleReducer(state: ExampleState, action: ExampleAction): ExampleState {
  switch (action.type) {
    case 'add':
      return { ...state, items: [...state.items, action.item] };
    case 'toggle':
      return {
        ...state,
        items: state.items.map((item) => (item.id === action.id ? { ...item, done: !item.done } : item)),
      };
    case 'setFilter':
      return { ...state, filter: action.filter };
  }
}

export function selectVisible(state: ExampleState): readonly ExampleItem[] {
  switch (state.filter) {
    case 'open':
      return state.items.filter((item) => !item.done);
    case 'done':
      return state.items.filter((item) => item.done);
    case 'all':
      return state.items;
  }
}
