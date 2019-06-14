
function get_real_content_height() {
        var header = $.mobile.activePage.find("div[data-role='header']:visible");
        var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
        var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
        var viewport_height = $(window).height();
        var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
        if((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
            content_height -= (content.outerHeight() - content.height());
        }
        return content_height;
    }

export { get_real_content_height };