import test from 'node:test';
import assert from 'node:assert/strict';
import { filterProjects } from './filterProjects.mjs';

const projects = [{ name: 'Projeto Alfa' }, { name: 'Projeto Beta' }];

test('retorna tudo sem busca', () => {
  assert.equal(filterProjects(projects, '  ').length, 2);
});

test('filtra pelo trecho exato', () => {
  assert.deepEqual(filterProjects(projects, 'Alfa'), [{ name: 'Projeto Alfa' }]);
});
