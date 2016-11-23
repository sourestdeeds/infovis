var EarthVisualisation = function() {
	var self = this
	this.tabID = '#earth';

	// On default scale, half the height will represent DEFAULT_SCALE_DISTANCE pc.
	this.DEFAULT_SCALE = 1;
	this.DEFAULT_SCALE_DISTANCE = 10000;

	this.DEFAULT_PLANET_SCALE = 0.5;

	this.svg = d3.select('#earth-svg');
	this.earth = this.svg.select('.earth');

	this.zoom = d3.behavior.zoom()
		.scaleExtent([0.1, 10000])
		.scale(this.DEFAULT_SCALE)
		.on('zoom', function() {
			self._setPlanetScaledPositions();
		});
	this.svg.call(this.zoom);

	this.planetZoom = d3.behavior.zoom()
		.scaleExtent([0.1, 10])
		.scale(this.DEFAULT_PLANET_SCALE)
		.on('zoom', function() {
			self._setPlanetScales();
		});

	this._createSliders();

	this.discoveryMethodsSelection = {};
	dataHandler.onDataLoaded(function() {self._createLegend()});
}

EarthVisualisation.prototype.draw = function () {
	var self = this;

	var center = this._getSvgCenter();

	this.earth.attr('cx', center.x)
		.attr('cy', center.y);

	var selectedPlanets = dataHandler.selectedData.filter(function(element) {
		return self.discoveryMethodsSelection[element['pl_discmethod']];
	});

	var planets = this.svg.selectAll('circle.planet').data(selectedPlanets);
	planets.exit().remove();
	planets.enter().append('circle');
	planets.classed('planet', true)
		.attr('cx', center.x)
		.attr('fill', 'black')
		.attr('opacity', '0.5')
		.attr('r', 1);
	this._setPlanetScaledPositions();
	this._setPlanetScales();
	this._setPlanetRotations();
	this._setPlanetColors();
};

EarthVisualisation.prototype.rescale = function (scale) {
	this.zoom.scale(scale);
	// Trigger zoom event listeners
	this.zoom.event(this.svg);
};

EarthVisualisation.prototype.rescalePlanets = function (scale) {
	this.planetZoom.scale(scale);
	// Trigger zoom event listeners
	this.planetZoom.event(this.svg);
};

EarthVisualisation.prototype._setPlanetColors = function () {
	d3.selectAll('circle.planet')
		.attr('fill', function(d) {return dataHandler.discoveryMethodsColorMap(d['pl_discmethod'])});
};

EarthVisualisation.prototype._setPlanetRotations = function () {
	//TODO: base rotation on something else?

	var center = this._getSvgCenter();
	d3.selectAll('circle.planet')
		.attr('transform', function(d) {return 'rotate(' + +d['rowid']*13 % 360 + ',' + center.x + ',' + center.y + ')'});
};

EarthVisualisation.prototype._setPlanetScaledPositions = function () {
	$('#earth-distance-slider').slider('value', this.distanceSliderScaler(this.zoom.scale()));
	var centerY = this._getSvgCenter().y;
	var maxY = centerY - 10;
	var scaler = d3.scale.linear()
		.domain([0, this.DEFAULT_SCALE_DISTANCE / this.zoom.scale()])
		.range([0,maxY]);
	this.svg.selectAll('circle.planet')
		.attr('cy', function(d) {return centerY + scaler(+d['st_dist'])});
};

EarthVisualisation.prototype._setPlanetScales = function () {
	$('#earth-planet-slider').slider('value', this.planetSliderScaler(this.planetZoom.scale()));
	var scale = this.planetZoom.scale();
	var usePlanetScale = $('#earth-planet-scale-checkbox').prop('checked');
	this.earth.attr('r', scale);
	this.svg.selectAll('circle.planet')
		.attr('r', function(d) {
			var radius = 10;
			if (usePlanetScale)
				radius = +d['pl_rade'];
			return  radius * scale;
		});
};

EarthVisualisation.prototype._getSvgSize = function () {
	var width = $('#earth-svg').outerWidth();
	var height = $('#earth-svg').outerHeight();
	return {width: width, height: height};
};

EarthVisualisation.prototype._getSvgCenter = function () {
	var size = this._getSvgSize();
	return {x: size.width/2, y: size.height/2};
};

EarthVisualisation.prototype._createSliders = function () {
	var self = this;
	this.distanceSliderScaler = d3.scale.log()
		.domain([0.1, 10000])
		.range([0, 1]);

	$('#earth-distance-slider').slider({
		min: 0,
		step: 0.001,
		max: 1
	});
	$('#earth-distance-slider').on('slide', function(event, ui) {
		self.rescale(self.distanceSliderScaler.invert(ui.value));
	});

	this.planetSliderScaler = d3.scale.log()
		.domain([0.1, 10])
		.range([0, 1]);

	$('#earth-planet-slider').slider({
		min: 0,
		step: 0.001,
		max: 1
	});

	$('#earth-planet-slider').on('slide', function(event, ui) {
		self.rescalePlanets(self.planetSliderScaler.invert(ui.value));
	});

	$('#earth-planet-scale-checkbox').change(function() {
		self._setPlanetScales();
	})
};

EarthVisualisation.prototype._createLegend = function () {
	var self = this;

	dataHandler.discoveryMethods.forEach(function(element) {
		self.discoveryMethodsSelection[element] = true;
	});

	var legendItems = d3.select('#earth-legend').selectAll('div')
		.data(dataHandler.discoveryMethods)
		.enter().append('div');
	legendItems.classed('earth-legend-item', true);
	legendItems.append('span')
		.classed('earth-legend-color-block', true)
		.style('border-color', function(d) {return dataHandler.discoveryMethodsColorMap(d)})
		.style('background-color', function(d) {
			if (self.discoveryMethodsSelection[d])
				return dataHandler.discoveryMethodsColorMap(d);
			else
				return 'white';
	}).on('click', function(d) {
		self.discoveryMethodsSelection[d] = !self.discoveryMethodsSelection[d];
		d3.select('#earth-legend').selectAll('.earth-legend-color-block')
			.style('background-color', function(d) {
				if (self.discoveryMethodsSelection[d])
					return dataHandler.discoveryMethodsColorMap(d);
				else
					return 'white';
		});
		self.draw();
	});
	legendItems.append('span')
		.text(function(d) {return d;});
};
