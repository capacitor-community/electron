module.exports = {
  printWidth: 120, // default: 80
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true, // default: false
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  overrides: [
    {
      files: ['*.java'],
      options: {
        printWidth: 140,
        tabWidth: 4,
        useTabs: false,
        trailingComma: 'none',
      },
    },
    {
      files: '*.md',
      options: {
        parser: 'mdx',
      },
    },
  ],
};
