module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es6: true,
		node: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:prettier/recommended',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	plugins: ['prettier', '@typescript-eslint'],
	rules: {
		indent: ['off', 'tab', { SwitchCase: 1 }],
		'linebreak-style': ['error', 'unix'],
		'no-useless-escape': [0, 'unix'],
		semi: ['error', 'always'],
	},
	ignorePatterns: ['./old/', './node_modules/'],
};
