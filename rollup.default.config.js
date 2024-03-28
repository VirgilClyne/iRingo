import json from '@rollup/plugin-json';
import commonjs from "@rollup/plugin-commonjs";
import terser from '@rollup/plugin-terser';

export default [
	{
		input: 'src/GeoServices.request.js',
		output: {
			file: 'js/GeoServices.request.js',
			format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs(), terser()]
	},
	{
		input: 'src/GeoServices.response.js',
		output: {
			file: 'js/GeoServices.response.js',
			format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs(), terser()]
	},
	{
		input: 'src/News.request.js',
		output: {
			file: 'js/News.request.js',
			format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs(), terser()]
	},
	/*
	{
		input: 'src/News.response.js',
		output: {
			file: 'js/News.response.js',
			format: 'es'
		},
		plugins: [json(), commonjs(), terser()]
	},
	*/
	{
		input: 'src/PrivateRelay.request.js',
		output: {
			file: 'js/PrivateRelay.request.js',
			format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs(), terser()]
	},
	{
		input: 'src/PrivateRelay.response.js',
		output: {
			file: 'js/PrivateRelay.response.js',
			format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs(), terser()]
	},
	{
		input: 'src/Siri.request.js',
		output: {
			file: 'js/Siri.request.js',
			format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs(), terser()]
	},
	{
		input: 'src/Siri.response.js',
		output: {
			file: 'js/Siri.response.js',
			format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs(), terser()]
	},
	{
		input: 'src/TestFlight.request.js',
		output: {
			file: 'js/TestFlight.request.js',
			format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs(), terser()]
	},
	{
		input: 'src/TestFlight.response.js',
		output: {
			file: 'js/TestFlight.response.js',
			format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs(), terser()]
	},
	{
		input: 'src/TV.request.js',
		output: {
			file: 'js/TV.request.js',
			format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs(), terser()]
	},
	{
		input: 'src/TV.response.js',
		output: {
			file: 'js/TV.response.js',
			format: 'es',
			banner: '/* README: https://github.com/VirgilClyne/iRingo */',
		},
		plugins: [json(), commonjs(), terser()]
	},
];
