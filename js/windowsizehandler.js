function onResize() {
	var windowHeight = $(window).height(); //Gives new Height of window
	var navbarHeight = $('.nav-tabs').outerHeight();
	var footerHeight = $('footer').outerHeight();
	var tabpaneHeight = windowHeight - navbarHeight - footerHeight;

	$('body').css('padding-top', navbarHeight);
	$('.tab-pane').not('#about').css('height', tabpaneHeight);

	$('.infobar .panel-body').css('max-height', tabpaneHeight - 100);

	visualisationManager.onWindowResize();
}

$(window).resize(onResize);
$(document).ready(onResize);
