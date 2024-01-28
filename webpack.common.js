const path = require('path');

module.exports = {
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'js'),
		//clean: true,
	},
	//target: 'es6',
	module: {
		rules: [
			{
				test: /\.(?:js|mjs|cjs)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							['@babel/preset-env', { targets: "defaults" }]
						]
					}
				}
			},
			{ test: /\.css$/, use: 'css-loader' },
			{ test: /\.ts$/, use: 'ts-loader' },
		],
	}
};
