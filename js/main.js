/*
 * Entrypoint.
 */
function main() {
	// Visualisation in global namespace for easy access while debugging
	earthVisualisation = new EarthVisualisation();
	temperatureVisualisation = new TemperatureVisualisation();

    catchTabEvents();
    timeSlider.setup();

	visualisationManager.addVisualisation(earthVisualisation);
	visualisationManager.addVisualisation(temperatureVisualisation);
	visualisationManager.addVisualisation(new StackedAreaPlot());
	visualisationManager.addVisualisation(new WorldMapVisualisation());

	dataHandler.onDataLoaded(function() {
	    dataHandler.setRange(timeSlider.DEFAULT_RANGE.min, timeSlider.DEFAULT_RANGE.max);
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
