var Slider = function(sliderID, range, callback, formatter) {
    this.ID = sliderID;
    this.range = range;
    this.cb = callback;
    this.formatter = formatter

    if (this.formatter === undefined) {
        this.formatter = function(val) {
            return val;
        }
    }
}

Slider.prototype.setup = function() {
    var r = this.range;

    $(this.ID).rangeSlider({
	    bounds: r,
	    defaultValues: r,
        step: 1,
        formatter: this.formatter
    });

    $(this.ID).bind('valuesChanging', this.cb);
}

var timeSlider = new Slider('#timeSlider', {min: 1989, max: 2016}, function(e, data) {
    dataHandler.setRange(data.values.min, data.values.max);
    dataHandler.filterData();
    visualisationManager.updateAll();
});

var radiusSlider = new Slider('#radiusSlider', {min: 0, max: 80}, function(e, data) {
    dataHandler.setRadiusRange(data.values.min, data.values.max);
    dataHandler.filterData();
    visualisationManager.updateAll();
}, function(val) {
    return val + ' Earth Radii';
});
