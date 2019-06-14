
export default class UIPageSettings {

    constructor() {

    }

    async init() {
        $('body').append(`
            <div data-role="page" id="settings">
                <div data-role="header" data-position="fixed" data-tap-toggle="false">
                    <h1>SETTINGS</h1>
                </div>
                <div role="main" class="ui-content" style="text-align: center;">

					<fieldset data-role="controlgroup" data-type="horizontal">
						<legend>THEME SELECTOR</legend>
					    <input name="radio-theme-color" id="radio-theme-color-a" value="a" type="radio">
					    <label for="radio-theme-color-a">Blue</label>
					    <input name="radio-theme-color" id="radio-theme-color-b" value="b" type="radio">
					    <label for="radio-theme-color-b">Red</label>
					    <input name="radio-theme-color" id="radio-theme-color-c" value="c" type="radio">
					    <label for="radio-theme-color-c">Dark Blue</label>
					    <input name="radio-theme-color" id="radio-theme-color-d" value="d" type="radio">
					    <label for="radio-theme-color-d">Dark Red</label>
					</fieldset>

                </div>
                <div data-role="footer" data-position="fixed" data-tap-toggle="false">
					<a href="#intro" class="ui-btn ui-corner-all ui-shadow ui-icon-back">BACK</a>
                </div>
            </div>
        `);

		$(document).on("pageshow","#settings", () => {
			$('input:radio[name="radio-theme-color"]').filter('[value="'+$.mobile.page.prototype.options.theme+'"]').attr("checked",true).checkboxradio("refresh");
		});

		$("input:radio[name=radio-theme-color]").change(function() {
			let theme = $('input[name=radio-theme-color]:checked').val();
			$('[data-role=page]').page({theme: theme }); // theme switcher, requires patched jquery.mobile version
			$.mobile.page.prototype.options.theme = theme;
			localStorage.setItem("theme-color", theme);
		});

    }

}