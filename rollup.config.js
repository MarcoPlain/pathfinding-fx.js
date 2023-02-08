import pkg from './package.json';

// The banner to add to the top of each file
// Pulls details from the package.json file
let banner = `/*! ${pkg.name} v${pkg.version} | ${pkg.description} | Copyright ${new Date().getFullYear()} | ${pkg.license} license */`;

// The formats to output
// Full list here: https://rollupjs.org/guide/en/#outputformat
let formats = ['iife'];

// The files to compile with rollup.js,
// and the settings to use for them
export default formats.map(function (format) {
	return {
		input: 'src/pathfinding-fx.js',
		output: {
			file: `dist/pathfinding-fx.js`,
			format: format,
			name: 'PathfindingFX',
			banner: banner,
			exports: 'auto'
		}
	};
});