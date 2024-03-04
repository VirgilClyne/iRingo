import json from '@rollup/plugin-json';
import commonjs from "@rollup/plugin-commonjs";

export default [
	{
		input: 'src/Location.request.beta.js',
		output: {
			file: 'js/Location.request.beta.js',
			//format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs()]
	},
	{
		input: 'src/Location.response.beta.js',
		output: {
			file: 'js/Location.response.beta.js',
			//format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs()]
	},
	{
		input: 'src/News.request.beta.js',
		output: {
			file: 'js/News.request.beta.js',
			//format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs()]
	},
	/*
	{
		input: 'src/News.response.beta.js',
		output: {
			file: 'js/News.response.beta.js',
			format: 'es'
		},
		plugins: [json(), commonjs()]
	},
	*/
	{
		input: 'src/PrivateRelay.request.beta.js',
		output: {
			file: 'js/PrivateRelay.request.beta.js',
			//format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs()]
	},
	{
		input: 'src/PrivateRelay.response.beta.js',
		output: {
			file: 'js/PrivateRelay.response.beta.js',
			//format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs()]
	},
	{
		input: 'src/Siri.request.beta.js',
		output: {
			file: 'js/Siri.request.beta.js',
			//format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs()]
	},
	{
		input: 'src/Siri.response.beta.js',
		output: {
			file: 'js/Siri.response.beta.js',
			//format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs()]
	},
	{
		input: 'src/TestFlight.request.beta.js',
		output: {
			file: 'js/TestFlight.request.beta.js',
			//format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs()]
	},
	{
		input: 'src/TestFlight.response.beta.js',
		output: {
			file: 'js/TestFlight.response.beta.js',
			//format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs()]
	},
	{
		input: 'src/TV.request.beta.js',
		output: {
			file: 'js/TV.request.beta.js',
			//format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs()]
	},
	{
		input: 'src/TV.response.beta.js',
		output: {
			file: 'js/TV.response.beta.js',
			//format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs()]
	},
];
