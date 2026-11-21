import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const effectMessage = 'useEffect precisa de lista de dependências rastreadas. Prefira estado derivado a efeito.';
const importPatterns = [
  { group: ['@/features/*/*'], message: 'Importe a feature só pelo index.ts: "@/features/<feature>".' },
  { group: ['../*/*'], message: 'Não importe arquivos internos de outra feature. Use "@/features/<feature>" ou "@/shared/...".' },
];

export default tseslint.config(
  { ignores: ['dist', 'build', 'coverage', 'node_modules', '*.config.*', '.dependency-cruiser.cjs'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/ban-ts-comment': ['error', {
        'ts-ignore': true,
        'ts-nocheck': true,
        'ts-check': false,
        'ts-expect-error': 'allow-with-description',
        minimumDescriptionLength: 15,
      }],
      'no-restricted-syntax': ['error',
        { selector: "CallExpression[callee.name='useEffect'][arguments.length<2]", message: effectMessage },
        { selector: "CallExpression[callee.object.name='React'][callee.property.name='useEffect'][arguments.length<2]", message: effectMessage },
      ],
      'no-restricted-imports': ['error', { patterns: importPatterns }],
    },
  },
  {
    files: ['src/shared/**'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [...importPatterns, { group: ['@/features', '@/features/**'], message: 'shared não pode depender de features.' }],
      }],
    },
  },
);
