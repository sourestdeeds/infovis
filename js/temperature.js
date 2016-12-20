var TemperatureVisualisation = function() {
	var self = this
	this.tabID = '#temperature';
	this.svg = d3.select('#temperature-svg');

	this.CHART_X_OFFSET = 250;
	this.CHART_Y_OFFSET = 20;

	this.zoom = d3.behavior.zoom()
		.scaleExtent([0.1, 300])
		.scale(0.6)
		.on('zoom', function() {
			self._scaleX();
		});

	this._createSliders();
};

TemperatureVisualisation.prototype.draw = function () {
	this._drawPlanets();
};

TemperatureVisualisation.prototype._drawPlanets = function () {
	var self = this;
	var svgSize = this._getSvgSize();
	var selectedPlanets = dataHandler.selectedData.filter(function(element) {
		return element['pl_eqt'] != '' && element['pl_orbsmax'] != '';
	});
	var linearYScale = d3.scale.linear()
		.domain([0, 3000])
		.range([0,1]);
	var colorScale = d3.scale.linear()
		.domain([100, 3000, 7500])
		.range(['blue', 'yellow', 'red']);
	var planets = this.svg.selectAll('circle.planet').data(selectedPlanets);
	planets.exit().remove();
	planets.enter().append('circle');
	planets.classed('planet', true)
		.attr('cy', function(d) {return svgSize.height * (1 - linearYScale(+d['pl_eqt'])) - self.CHART_Y_OFFSET})
		.attr('fill', function(d) {if(d['st_teff'] == '') return 'black'; else return colorScale(+d['st_teff']);})
		.attr('name', function(d) {return +d['st_teff']})
		.attr('opacity', '0.75')
		.attr('r', 4);

	this._scaleX();
};

TemperatureVisualisation.prototype._scaleX = function () {
	var self = this;
	var scale = this.zoom.scale();
	$('#temperature-distance-slider').slider('value', this.distanceSliderScaler(scale));
	var svgSize = this._getSvgSize();
	var logXScale = d3.scale.log()
		.domain([1, 2500]);
	this.svg.selectAll('circle.planet')
		.attr('cx', function(d) {return self.CHART_X_OFFSET + scale * svgSize.width * logXScale(+d['pl_orbsmax'] + 1)});
};

TemperatureVisualisation.prototype._getSvgSize = function () {
	var width = $('#temperature-svg').outerWidth();
	var height = $('#temperature-svg').outerHeight();
	return {width: width, height: height};
};

TemperatureVisualisation.prototype._getSvgCenter = function () {
	var size = this._getSvgSize();
	return {x: size.width/2, y: size.height/2};
};

TemperatureVisualisation.prototype._createSliders = function () {
	var self = this;
	this.distanceSliderScaler = d3.scale.log()
		.domain([0.1, 300])
		.range([0, 1]);

	$('#temperature-distance-slider').slider({
		min: 0.1,
		step: 0.001,
		max: 1
	});
	$('#temperature-distance-slider').on('slide', function(event, ui) {
		self.zoom.scale(self.distanceSliderScaler.invert(ui.value));
		// Trigger zoom event listeners
		self.zoom.event(self.svg);
	});

	this.planetSliderScaler = d3.scale.log()
		.domain([0.1, 10])
		.range([0, 1]);

	$('#temperature-planet-slider').slider({
		min: 0,
		step: 0.001,
		max: 1
	});

	$('#temperature-planet-slider').on('slide', function(event, ui) {
		self.rescalePlanets(self.planetSliderScaler.invert(ui.value));
	});

	$('#temperature-planet-scale-checkbox').change(function() {
		self._setPlanetScales();
	})
};
