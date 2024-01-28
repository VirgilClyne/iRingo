const path = require('path');

module.exports = {
	mode: "production",
	devtool: false,
	entry: {
		"Location.request": './src/Location.request.js',
		"Location.response": './src/Location.response.js',
		"News.request": './src/News.request.js',
		//"News.response": './src/News.response.js',
		"PrivateRelay.request": './src/PrivateRelay.request.js',
		"PrivateRelay.response": './src/PrivateRelay.response.js',
		"Siri.request": './src/Siri.request.js',
		"Siri.response": './src/Siri.response.js',
		"TestFlight.request": './src/TestFlight.request.js',
		"TestFlight.response": './src/TestFlight.response.js',
		"TV.request": './src/TV.request.js',
		"TV.response": './src/TV.response.js',
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'js'),
		//clean: true,
	},
};
