module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es6: true,
		node: true,
	},
	extends: [
		'plugin:@typescript-eslint/recommended', // Base rules configuration from Eslint, adapted to Typescript
		'prettier/@typescript-eslint', // disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
		'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors,, so that they can be fixed automatically with `eslint --fix`. Make sure this is always the last configuration in the extends array.
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'prettier'],
	rules: {
		indent: ['off', 'tab', { SwitchCase: 1 }],
		'linebreak-style': ['error', 'unix'],
		'no-useless-escape': [0, 'unix'],
		semi: ['error', 'always'],
		'@typescript-eslint/no-use-before-define': 'off',
	},
	ignorePatterns: ['./old/', './node_modules/'],
};
