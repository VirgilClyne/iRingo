const path = require('path');

module.exports = {
	mode: "development",
	devtool: "inline-source-map",
	entry: {
		"Location.request": './src/Location.request.beta.js',
		"Location.response": './src/Location.response.beta.js',
		"News.request": './src/News.request.beta.js',
		//"News.response": './src/News.response.beta.js',
		"PrivateRelay.request": './src/PrivateRelay.request.beta.js',
		"PrivateRelay.response": './src/PrivateRelay.response.beta.js',
		"Siri.request": './src/Siri.request.beta.js',
		"Siri.response": './src/Siri.response.beta.js',
		"TestFlight.request": './src/TestFlight.request.beta.js',
		"TestFlight.response": './src/TestFlight.response.beta.js',
		"TV.request": './src/TV.request.beta.js',
		"TV.response": './src/TV.response.beta.js',
	},
	output: {
		filename: '[name].beta.js',
		path: path.resolve(__dirname, 'js'),
		//clean: true,
	},
};
