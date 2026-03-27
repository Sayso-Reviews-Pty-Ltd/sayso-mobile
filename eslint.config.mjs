// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // ── Ignore non-source files ────────────────────────────────────────────────
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'dist-export-ios/**',
      'android/**',
      'ios/**',
      'babel.config.js',
      'metro.config.js',
      'jest.config.js',
    ],
  },

  // ── Base rules ─────────────────────────────────────────────────────────────
  eslint.configs.recommended,
  tseslint.configs.recommended,

  // ── React Hooks: stable rules only (rules-of-hooks + exhaustive-deps) ─────
  // react-hooks v7 recommended-latest includes many experimental rules;
  // we register only the two battle-tested, spec-compliant rules.
  {
    plugins: { 'react-hooks': reactHooksPlugin },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // ── Source file rules ──────────────────────────────────────────────────────
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/components/Typography.tsx'],
    rules: {
      // ── Design system: force Typography wrappers ───────────────────────────
      // Raw Text/TextInput from react-native bypass the Urbanist font mapping.
      // Always import from src/components/Typography instead.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['Text', 'TextInput'],
              message:
                "Import 'Text' and 'TextInput' from '~/components/Typography' to keep Urbanist font consistent. For type-only ref usage, import type { TextInput as RNTextInput } from 'react-native' or use ElementRef<typeof TextInput>.",
              allowTypeImports: true,
            },
          ],
        },
      ],

      // ── TypeScript quality ─────────────────────────────────────────────────
      // Downgraded to warn — 35 pre-existing cases to fix incrementally.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-require-imports': 'error',

      // ── General quality ────────────────────────────────────────────────────
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // ── React Native asset registries — require() is mandatory for Metro ───────
  // Metro bundler requires statically-analyzable require() calls for local
  // image assets. Dynamic imports cannot be used here.
  {
    files: [
      'src/lib/badgeImages.ts',
      'src/lib/businessPlaceholders.ts',
      'src/lib/communityBadgeMarqueeAssets.ts',
    ],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // ── Relaxed rules for tests and e2e ───────────────────────────────────────
  {
    files: [
      '**/*.test.{ts,tsx}',
      '**/__tests__/**/*.{ts,tsx}',
      'e2e/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      // Jest mocking patterns use require() — allow it in test files.
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
      'no-restricted-imports': 'off',
    },
  },

  // ── Prettier must be last ──────────────────────────────────────────────────
  prettierConfig,
);
