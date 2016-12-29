var TemperatureVisualisation = function() {
	var self = this
	this.tabID = '#temperature';
	this.svg = d3.select('#temperature-svg');

	this.CHART_X_OFFSET = 300;
	this.CHART_Y_OFFSET = 20;
	this.CHART_X_RIGHT_OFFSET = 20;
	this.CHART_Y_TOP_OFFSET = 20;

	this.COLOR_LEGEND_MAX_TEMP = 11000;
	this.COLOR_LEGEND_MIN_TEMP = 570;
	this.COLOR_LEGEND_AVG_TEMP = 5000;
	this.COLOR_LEGEND_WIDTH = 10;
	this.COLOR_LEGEND_HEIGHT = 200;
	this.COLOR_LEGEND_X_OFFSET = 20;

	this.DEFAULT_PLANET_SCALE = 0.5;

	this.zoom = d3.behavior.zoom()
		.scaleExtent([0.1, 300])
		.scale(0.75)
		.on('zoom', function() {
			self._scaleX();
		});
	this.svg.call(this.zoom);

	this.planetZoom = d3.behavior.zoom()
		.scaleExtent([0.1, 10])
		.scale(this.DEFAULT_PLANET_SCALE)
		.on('zoom', function() {
			self._setPlanetScales();
		});

	this.colorScale = d3.scale.linear()
		.domain([this.COLOR_LEGEND_MIN_TEMP, this.COLOR_LEGEND_AVG_TEMP, this.COLOR_LEGEND_MAX_TEMP])
		.range(['blue', 'yellow', 'red']);

	this._createSliders();
};

TemperatureVisualisation.prototype.draw = function () {
	this._drawPlanets();
	this._scaleX();
	this._setPlanetScales();
	this._setPlanetColors();
	this._createAxes();
	this._createColorLegend();
};

TemperatureVisualisation.prototype._drawPlanets = function () {
	var self = this;
	var svgSize = this._getSvgSize();
	var selectedPlanets = dataHandler.selectedData.filter(function(element) {
		return element['pl_eqt'] != '' && element['pl_orbsmax'] != '';
	});
	this.linearYScale = d3.scale.linear()
		.domain([0, 3000])
		.range([svgSize.height - this.CHART_Y_OFFSET, this.CHART_Y_TOP_OFFSET]);
	var planets = this.svg.selectAll('circle.planet').data(selectedPlanets);
	planets.exit().remove();
	planets.enter().append('circle');
	planets.classed('planet', true)
		.attr('cy', function(d) {return self.linearYScale(+d['pl_eqt'])})
		.attr('name', function(d) {return +d['st_teff']})
		.attr('opacity', '0.75')
		.attr('fill', 'black')
		.attr('r', 4);
	var coloringMethod = $('#temperature-planet-colors-select').val();
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

TemperatureVisualisation.prototype._setPlanetScales = function () {
	var size = this._getSvgSize();

	$('#temperature-planet-slider').slider('value', this.planetSliderScaler(this.planetZoom.scale()));
	var scale = this.planetZoom.scale();
	var usePlanetScale = $('#temperature-planet-scale-checkbox').prop('checked');
	this.svg.selectAll('circle.planet')
		.attr('r', function(d) {
			var radius = 10;
			if (usePlanetScale)
				radius = +d['pl_rade'];
			return  radius * scale;
		});
};

TemperatureVisualisation.prototype._setPlanetColors = function () {
	var self = this;
	var planets = this.svg.selectAll('circle.planet');
	var coloringMethod = $('#temperature-planet-colors-select').val();
	if(coloringMethod == 'star-temperature') {
		planets.attr('fill', function(d) {if(d['st_teff'] == '') return 'black'; else return self.colorScale(+d['st_teff']);});
	} else {
		planets.attr('fill', function(d) {return dataHandler.discoveryMethodsColorMap(d['pl_discmethod']);});
	}
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
		self.planetZoom.scale(self.planetSliderScaler.invert(ui.value));
		// Trigger zoom event listeners
		self.planetZoom.event(self.svg);
	});

	$('#temperature-planet-scale-checkbox').change(function() {
		self._setPlanetScales();
	});

	$('#temperature-planet-colors-select').change(function() {
		self._setPlanetColors();
	})
};

TemperatureVisualisation.prototype._createYAxis = function () {
	var axis = d3.svg.axis()
		.scale(this.linearYScale)
		.ticks(10)
		.tickSize(2,2)
		.orient('left')
		.tickFormat(function(x) {
			return d3.format('.0f')(x) + ' K'
		});
	return axis;
};

TemperatureVisualisation.prototype._createXAxis = function () {
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
			if (d > 52 || x == 1 || x == n) {
				if (x-1 == 0)
					return '0 AU';
				if (x-1 < 0.1)
					return d3.format('.2f')(x-1) + ' AU';
				else if (x-1 < 1)
					return d3.format('.1f')(x-1) + ' AU';
				else
					return d3.format('.0f')(x-1) + ' AU';
			}
			return '';
		})
		.tickValues(tickValues)
		.tickSize(2,2);
	return axis;
};

TemperatureVisualisation.prototype._createAxes = function () {
	var size = this._getSvgSize();
	var xAxis = this._createXAxis();
	var yAxis = this._createYAxis();

	this.svg.select('g.axis')
		.attr('transform', 'translate(' + this.CHART_X_OFFSET + ',0)');
	this.svg.select('g.x-axis')
		.attr('transform', 'translate(0,' + (size.height - this.CHART_Y_OFFSET) + ')')
		.call(xAxis);
	this.svg.select('g.y-axis')
		.call(yAxis);
};

TemperatureVisualisation.prototype._createColorLegend = function () {
	var self = this;
	var size = this._getSvgSize();

	var tempScale = d3.scale.linear()
		.domain([this.COLOR_LEGEND_MIN_TEMP, this.COLOR_LEGEND_MAX_TEMP])
		.range([this.COLOR_LEGEND_HEIGHT, 0]);

	var axis = d3.svg.axis()
		.scale(tempScale)
		.ticks(5)
		.tickSize(1,0)
		.orient('right')
		.tickFormat(function(x) {
			return d3.format('.0f')(x) + ' K'
		});

	var legend = this.svg.select('g.color-legend');
	legend.attr('transform', 'translate(' + this.COLOR_LEGEND_X_OFFSET + ',' + (size.height	- this.CHART_Y_OFFSET - this.COLOR_LEGEND_HEIGHT) + ')')
		.call(axis);

	var data = [];
	for (var i = 0; i < this.COLOR_LEGEND_HEIGHT; i++) {
		data.push(i);
	}

	var legendLines = legend.selectAll('line.color-line').data(data);
	legendLines.exit().remove();
	legendLines.enter().append('line');
	legendLines.classed('color-line', true)
		.attr('x1', 0)
		.attr('x2', -this.COLOR_LEGEND_WIDTH)
		.attr('y1', function(d) {return d})
		.attr('y2', function (d) {return d})
		.attr('stroke', function(d) {return self.colorScale(tempScale.invert(d))});
};
