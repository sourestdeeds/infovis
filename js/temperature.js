var TemperatureVisualisation = function() {
	var self = this
	this.tabID = '#temperature';
	this.svg = d3.select('#temperature-svg');

	this.CHART_X_OFFSET = 250;
	this.CHART_Y_OFFSET = 20;
	this.CHART_X_RIGHT_OFFSET = 20;

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
	this._createAxes();
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
	this.logXScale = d3.scale.log()
		.domain([1, 2500])
		.range([0, scale * svgSize.width]);
	this.svg.selectAll('circle.planet')
		.attr('cx', function(d) {return self.CHART_X_OFFSET + self.logXScale(+d['pl_orbsmax'] + 1)});
	this._createAxes();
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

TemperatureVisualisation.prototype._createAxes = function () {
	var size = this._getSvgSize();
	var tickValues = [1,1.01,1.02,1.03,1.04,1.05,1.06,1.07,1.08,1.09,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2,3,4,5,6,7,8,9,10,11,21,31,41,51,61,71,81,91,101,201,301,401,501,601,701,801,901,1001,2001,3001,4001,5001,6001,7001,8001,9001,10001];
	var axisEnd = this.logXScale.invert(size.width - this.CHART_X_OFFSET - this.CHART_X_RIGHT_OFFSET);
	var logXScale = d3.scale.log()
		.domain([1, axisEnd])
		.range([0, size.width - this.CHART_X_OFFSET - this.CHART_X_RIGHT_OFFSET]);

	var tickValues = tickValues.filter(function(element) {
		return element <= axisEnd;
	});

	var axis = d3.svg.axis()
		.scale(logXScale)
		.tickFormat(function(x) {
			var i = tickValues.indexOf(x);
			var n = x;
			if (i < tickValues.length - 1) {
				n = tickValues[i+1];
			}
			var d = logXScale(n) - logXScale(x);
			if (d > 40 || x == 1 || x == n) {
				return d3.format('.2f')(x-1);
			}
			return '';
		})
		.tickValues(tickValues)
		.tickSize(2,2);

	this.svg.select('g.axis')
		.attr('transform', 'translate(' + this.CHART_X_OFFSET + ',' + (size.height - this.CHART_Y_OFFSET) + ')')
		.call(axis);
};
