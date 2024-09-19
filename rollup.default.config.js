import json from '@rollup/plugin-json';
import commonjs from "@rollup/plugin-commonjs";
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
	{
		input: 'src/WeatherKit.response.js',
		output: {
			file: 'js/WeatherKit.response.js',
			//format: 'es',
			banner: "/* README: https://github.com/VirgilClyne/iRingo */\nconsole.log(' iRingo: 🌤 WeatherKit Response')",
		},
		plugins: [json(), commonjs(), nodeResolve(), terser()]
	},
	{
		input: 'src/GeoServices.request.js',
		output: {
			file: 'js/GeoServices.request.js',
			format: 'es',
			banner: "/* README: https://github.com/VirgilClyne/iRingo */\nconsole.log(' iRingo: 📍 GeoServices Request')",
		},
		plugins: [json(), commonjs(), nodeResolve(), terser()]
	},
	{
		input: 'src/GeoServices.response.js',
		output: {
			file: 'js/GeoServices.response.js',
			format: 'es',
			banner: "/* README: https://github.com/VirgilClyne/iRingo */\nconsole.log(' iRingo: 📍 GeoServices Response')",
		},
		plugins: [json(), commonjs(), nodeResolve(), terser()]
	},
	{
		input: 'src/Siri.request.js',
		output: {
			file: 'js/Siri.request.js',
			format: 'es',
			banner: "/* README: https://github.com/VirgilClyne/iRingo */\nconsole.log(' iRingo: ⭕ Siri Request')",
		},
		plugins: [json(), commonjs(), nodeResolve(), terser()]
	},
	{
		input: 'src/Siri.response.js',
		output: {
			file: 'js/Siri.response.js',
			format: 'es',
			banner: "/* README: https://github.com/VirgilClyne/iRingo */\nconsole.log(' iRingo: ⭕ Siri Response')",
		},
		plugins: [json(), commonjs(), nodeResolve(), terser()]
	},
	{
		input: 'src/TestFlight.request.js',
		output: {
			file: 'js/TestFlight.request.js',
			format: 'es',
			banner: "/* README: https://github.com/VirgilClyne/iRingo */\nconsole.log(' iRingo: ✈ TestFlight Request')",
		},
		plugins: [json(), commonjs(), nodeResolve(), terser()]
	},
	{
		input: 'src/TestFlight.response.js',
		output: {
			file: 'js/TestFlight.response.js',
			format: 'es',
			banner: "/* README: https://github.com/VirgilClyne/iRingo */\nconsole.log(' iRingo: ✈ TestFlight Response')",
		},
		plugins: [json(), commonjs(), nodeResolve(), terser()]
	},
	{
		input: 'src/TV.request.js',
		output: {
			file: 'js/TV.request.js',
			format: 'es',
			banner: "/* README: https://github.com/VirgilClyne/iRingo */\nconsole.log(' iRingo: 📺 TV Request')",
		},
		plugins: [json(), commonjs(), nodeResolve(), terser()]
	},
	{
		input: 'src/TV.response.js',
		output: {
			file: 'js/TV.response.js',
			format: 'es',
			banner: "/* README: https://github.com/VirgilClyne/iRingo */\nconsole.log(' iRingo: 📺 TV Response')",
		},
		plugins: [json(), commonjs(), nodeResolve(), terser()]
	},
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
