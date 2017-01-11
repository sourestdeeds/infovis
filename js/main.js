/*
 * Entrypoint.
 */
function main() {
	// Visualisation in global namespace for easy access while debugging
	earthVisualisation = new EarthVisualisation();
	temperatureVisualisation = new TemperatureVisualisation();

    catchTabEvents();
    initAmountDisplay();
    timeSlider.setup();
    radiusSlider.setup();

	visualisationManager.addVisualisation(earthVisualisation);
	visualisationManager.addVisualisation(temperatureVisualisation);
	visualisationManager.addVisualisation(new StackedAreaPlot());
	visualisationManager.addVisualisation(new WorldMapVisualisation());
	visualisationManager.addVisualisation(new OrbitsVisualisation());
	visualisationManager.addVisualisation(new HistogramVisualisation());

	dataHandler.onDataLoaded(function() {
		dataHandler.initFilter();
	    dataHandler.setRange(timeSlider.range.min, timeSlider.range.max);
	    dataHandler.setRadiusRange(radiusSlider.range.min, radiusSlider.range.max);
	    dataHandler.filterData();
		visualisationManager.switchTo('#worldmap'); // TODO put default active tab here
	});
}

function catchTabEvents() {
    // JQuery magic copied off Stack Overflow, don't ask
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr('href');
        visualisationManager.switchTo(target);
    });
}

function initAmountDisplay() {
	$('footer').on('mouseover', function() {
		$('#amount').show();
	});

	$('footer').on('mouseout', function() {
		$('#amount').hide();
	});
}

function switchToTab(tabId) {
	$('.nav-tabs a[href="' + tabId + '"]').tab('show');
}
