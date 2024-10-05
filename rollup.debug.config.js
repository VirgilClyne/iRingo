import json from '@rollup/plugin-json';
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
	/*
	{
		input: 'src/PrivateRelay.request.beta.js',
		output: {
			file: 'js/PrivateRelay.request.beta.js',
			//format: 'es',
		},
		plugins: [json(), commonjs(), nodeResolve()]
	},
	{
		input: 'src/PrivateRelay.response.beta.js',
		output: {
			file: 'js/PrivateRelay.response.beta.js',
			//format: 'es',
		},
		plugins: [json(), commonjs(), nodeResolve()]
	},
	*/
];
