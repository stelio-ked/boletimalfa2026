import { useExampleFeature } from './useExampleFeature';
import type { ExampleFilter } from './ExampleFeature.types';
import styles from './ExampleFeature.module.css';

const FILTERS: readonly ExampleFilter[] = ['all', 'open', 'done'];
const FILTER_LABEL: Readonly<Record<ExampleFilter, string>> = { all: 'Todas', open: 'Abertas', done: 'Concluídas' };

export function ExampleFeature(): React.JSX.Element {
  const { visible, filter, add, toggle, setFilter } = useExampleFeature();

  return (
    <section className={styles['root']}>
      <button type="button" data-testid="example-add" onClick={() => add('Nova tarefa')}>
        Adicionar tarefa
      </button>
      <div className={styles['filters']}>
        {FILTERS.map((f) => (
          <button key={f} type="button" data-testid={`example-filter-${f}`} aria-pressed={f === filter} onClick={() => setFilter(f)}>
            {FILTER_LABEL[f]}
          </button>
        ))}
      </div>
      {visible.map((item) => (
        <label key={item.id} data-testid="example-item" className={styles['item']}>
          <input type="checkbox" checked={item.done} onChange={() => toggle(item.id)} />
          <span className={item.done ? styles['done'] : undefined}>{item.title}</span>
        </label>
      ))}
    </section>
  );
}
