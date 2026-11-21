import { fireEvent, render, screen } from '@testing-library/react';
import { exampleReducer, initialState, selectVisible } from './example-feature.store';
import { ExampleFeature } from './ExampleFeature';

describe('example-feature.store', () => {
  it('filtra itens concluídos', () => {
    const added = exampleReducer(initialState, { type: 'add', item: { id: '1', title: 'A', done: false } });
    const toggled = exampleReducer(added, { type: 'toggle', id: '1' });
    const filtered = exampleReducer(toggled, { type: 'setFilter', filter: 'done' });
    expect(selectVisible(filtered).map((i) => i.id)).toEqual(['1']);
  });
});

describe('ExampleFeature', () => {
  it('adiciona uma tarefa na lista', () => {
    render(<ExampleFeature />);
    fireEvent.click(screen.getByTestId('example-add'));
    expect(screen.getAllByTestId('example-item')).toHaveLength(1);
  });
});
