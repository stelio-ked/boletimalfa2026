/** Regras de grafo de importações (Arquitetura Dune). Falha dura no CI. */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Dependência circular: mova o código comum para src/shared ou inverta a dependência.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-feature-internals',
      severity: 'error',
      comment: 'Outra feature só pode ser importada pelo index.ts.',
      from: { path: '^src/features/([^/]+)/' },
      to: { path: '^src/features/[^/]+/(?!index\\.tsx?$)', pathNot: '^src/features/$1/' },
    },
    {
      name: 'shared-not-to-features',
      severity: 'error',
      comment: 'src/shared nunca depende de features.',
      from: { path: '^src/shared/' },
      to: { path: '^src/features/' },
    },
    {
      name: 'renderer-not-to-main',
      severity: 'error',
      comment: 'Apps Electron: código do renderer não importa código do processo principal.',
      from: { path: '^src/renderer/' },
      to: { path: '^src/main/' },
    },
    {
      name: 'no-test-in-production',
      severity: 'error',
      from: { pathNot: '\\.test\\.tsx?$' },
      to: { path: '\\.test\\.tsx?$' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
  },
};
