
import "babel-polyfill";

import './fonts/stylesheet.css';
import './css/styles.css';

$(document).ready( function() {
	console.log('document::ready');
});

// sample module imports
import { run } from "./scripts/app";

window.onload = async function() {
	console.log('windown::onload');

	// disable default context menu
	document.oncontextmenu = function() { return false; }

	run()
	.then(function() {
		console.log('main.js::run - load completed');
	})
	.catch(function( e ) {
		console.log( e );
	});

};


