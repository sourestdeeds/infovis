var TimeSlider = function(timeSliderID) {
    this.ID = timeSliderID;
    this.DEFAULT_RANGE = {min: 1989, max: 2016};
}

TimeSlider.prototype.setup = function() {
    var r = this.DEFAULT_RANGE;

    $(this.ID).rangeSlider({
	    bounds: r,
	    defaultValues: r,
	    step: 1
    });

    $(this.ID).bind('valuesChanging', function(e, data) {
	    dataHandler.setRange(data.values.min, data.values.max);
	    visualisationManager.updateAll();
    });
}

var timeSlider = new TimeSlider('#timeSlider');
