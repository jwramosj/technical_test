"use strict";

const js = require("@eslint/js");

const globals = {
	afterAll: "readonly",
	beforeAll: "readonly",
	describe: "readonly",
	expect: "readonly",
	it: "readonly",
	module: "readonly",
	process: "readonly",
	require: "readonly",
	__dirname: "readonly"
};

module.exports = [
	js.configs.recommended,
	{
		files: ["**/*.js"],
		languageOptions: {
			ecmaVersion: 2018,
			sourceType: "commonjs",
			globals
		},
		rules: {
			indent: ["warn", "tab"],
			quotes: ["warn", "double"],
			semi: ["error", "always"],
			"no-var": "error",
			"no-console": "off",
			"no-unused-vars": "warn"
		}
	}
];
