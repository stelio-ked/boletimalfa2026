export type ExampleFilter = 'all' | 'open' | 'done';

export interface ExampleItem {
  readonly id: string;
  readonly title: string;
  readonly done: boolean;
}
