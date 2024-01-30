import defaultConfig from './rollup.default.config.js';
import debugConfig from './rollup.debug.config.js';

export default commandLineArgs => {
	if (commandLineArgs.configDebug === true) {
		return debugConfig;
	}
	return defaultConfig;
};
