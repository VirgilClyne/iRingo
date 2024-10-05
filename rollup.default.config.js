import json from '@rollup/plugin-json';
import commonjs from "@rollup/plugin-commonjs";
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
	{
		input: 'src/News.request.js',
		output: {
			file: 'js/News.request.js',
			format: 'es',
			banner: "/* README: https://github.com/VirgilClyne/iRingo */\nconsole.log(' iRingo: 📰 News Request')",
		},
		plugins: [json(), commonjs(), nodeResolve(), terser()]
	},
	/*
	{
		input: 'src/News.response.js',
		output: {
			file: 'js/News.response.js',
			format: 'es'
		},
		plugins: [json(), commonjs(), nodeResolve(), terser()]
	},
	{
		input: 'src/PrivateRelay.request.js',
		output: {
			file: 'js/PrivateRelay.request.js',
			format: 'es',
		},
		plugins: [json(), commonjs(), nodeResolve(), terser()]
	},
	{
		input: 'src/PrivateRelay.response.js',
		output: {
			file: 'js/PrivateRelay.response.js',
			format: 'es',
		},
		plugins: [json(), commonjs(), nodeResolve(), terser()]
	},
	*/
];
