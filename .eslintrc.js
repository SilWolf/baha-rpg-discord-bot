module.exports = {
	env: {
		es2021: true,
		node: true,
	},
	settings: {
		'import/resolver': {
			typescript: {},
		},
	},
	extends: [
		'airbnb-base',
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		tsconfigRootDir: './',
	},
	plugins: ['@typescript-eslint', 'import'],
	rules: {
		'import/extensions': 0,
		'prefer-destructuring': 0
	},
};
