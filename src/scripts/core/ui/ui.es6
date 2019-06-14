
import '../../vendor/jquery.mobile-1.4.5.css';
import '../../vendor/jquery.mobile.theme-1.4.5.css';
import jQMobile from '../../vendor/jquery.mobile.patched-1.4.5.js';

		$.mobile = jQMobile;
		$.mobile.hashListeningEnabled = false;
		$.mobile.pushStateEnabled = false;
		$.mobile.changePage.defaults.changeHash = false;
		$.mobile.defaultPageTransition = 'none';

import UIPageIntro from './page_intro';
import UIPageSettings from './page_settings';
import UIPageDisplay from './page_display';
import UIPageShapes from './page_shapes';

import { get_real_content_height } from './utilities';

export default class UI {

	constructor() {
		this._data = {};
		this.parameters = this.get_query_params();
	}

	async init() {

		$('head').append('<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" />');

		let theme_color = localStorage.getItem("theme-color");
		if ( theme_color ) {
			$.mobile.page.prototype.options.theme = theme_color;
		} else {
			$.mobile.page.prototype.options.theme = 'a';
		}

		console.log('UI:init');

		let pages = [ new UIPageIntro(), new UIPageSettings(), new UIPageDisplay(), new UIPageShapes() ];
		for ( let i = 0; i < pages.length; i++ ) {
			await pages[i].init();
		}

		$( window ).on( "throttledresize", (e) => this.onResize(e) );
		$( window ).on( "orientationchange", (e) => this.onResize(e) );
		$( document ).on( "pageshow", ( e ) => this.onResize(e) );

    }

	onResize() {
        let height = get_real_content_height();
        let width = $(window).width();
		$('.ui-page').css({ 'min-height': $(window).innerHeight()+'px !important' });
        $('.ui-content').css({ height: height+'px', width: width+'px' });
		$( window ).trigger('postresize');
    }

	run() {
		console.log('UI::run');
		$('body').trigger('create');
		console.log('UI::run trigger-create');
		$.mobile.changePage("#edisplay", { transition: 'none' });
	}

	get_query_params(qs = document.location.search ) {
		qs = qs.split('+').join(' ');
		var params = {},
			tokens,
			re = /[?&]?([^=]+)=([^&]*)/g;

		while ( tokens = re.exec(qs) ) { // eslint-disable-line no-cond-assign
			params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
		}
		return params;
	}

}
