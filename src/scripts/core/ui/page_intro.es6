
export default class UIPageIntro {

    constructor() {

    }

    async init() {
        console.log('UIPageIntro:init');
		$('body').append(`
			<div data-role="page" id="intro">
				<div data-role="header" data-position="fixed" data-tap-toggle="false">
					<h1>INTRO</h1>
				</div>
				<div role="main" class="ui-content">
					<a href="#edisplay" class="ui-btn ui-corner-all ui-shadow ui-icon-arrow-r">Event Display</a>
					<a href="#shapes" class="ui-btn ui-corner-all ui-shadow ui-icon-arrow-r">Shape Table</a>
					<a href="#settings" class="ui-btn ui-corner-all ui-shadow ui-icon-arrow-r">Settings</a>
				</div>
				<div data-role="footer" data-position="fixed" data-tap-toggle="false">
					<h3>Dmitry Arkhipkin, 2017-2019</h3>
				</div>
			</div>
		`);

    }

}