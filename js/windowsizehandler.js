function onResize() {
	var windowHeight = $(window).height(); //Gives new Height of window
	var navbarHeight = $('.nav-tabs').outerHeight();
	var footerHeight = $('footer').outerHeight();
	var tabpaneHeight = windowHeight - navbarHeight - footerHeight;

	$('body').css('padding-top', navbarHeight)
	$('.tab-pane').css('height', tabpaneHeight)
}

$(window).resize(onResize);
$(document).ready(onResize);
