import json from '@rollup/plugin-json';
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
	{
		input: 'src/News.request.beta.js',
		output: {
			file: 'js/News.request.beta.js',
			//format: 'es',
			banner: "/* README: https://github.com/VirgilClyne/iRingo */\nconsole.log(' iRingo: 📰 News β Request')",
		},
		plugins: [json(), commonjs(), nodeResolve()]
	},
	/*
	{
		input: 'src/News.response.beta.js',
		output: {
			file: 'js/News.response.beta.js',
			format: 'es'
		},
		plugins: [json(), commonjs(), nodeResolve()]
	},
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
