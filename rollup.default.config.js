import json from '@rollup/plugin-json';
import commonjs from "@rollup/plugin-commonjs";
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
	/*
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
