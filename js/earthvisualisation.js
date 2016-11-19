var EarthVisualisation = function() {
	this.tabID = '#earth';

	//On default scale, half the height will represent DEFAULT_SCALE_DISTANCE pc.
	this.DEFAULT_SCALE = 1;
	this.DEFAULT_SCALE_DISTANCE = 10000;

	this.svg = d3.select('#earth-svg');

	var self = this
	this.zoom = d3.behavior.zoom()
		.scaleExtent([0.01, 10000])
		.on('zoom', function() {
			self._setPlanetScaledPositions();
		})
		.scale(this.DEFAULT_SCALE);
	this.svg.call(this.zoom);

	//TODO: redraw when resized. Handled by VisualisationManager?
}

EarthVisualisation.prototype.draw = function () {
	var center = this._getSvgCenter();

	d3.select('circle.earth')
		.attr('cx', center.x)
		.attr('cy', center.y);

	var planets = this.svg.selectAll('circle.planet').data(dataHandler.selectedData);
	planets.exit().remove();
	planets.enter().append('circle');
	planets.classed('planet', true)
		.attr('cx', center.x)
		.attr('fill', 'brown')
		.attr('r', 10);
	this._setPlanetScaledPositions();
	this._setPlanetRotations();
};

EarthVisualisation.prototype.rescale = function (scale) {
	this.zoom.scale(scale);
	// Trigger zoom event listeners
	this.zoom.event(this.svg);
};

EarthVisualisation.prototype._setPlanetRotations = function () {
	//TODO: base rotation on something else?

	var center = this._getSvgCenter();
	var scaler = d3.scale.linear()
		.domain([0, 3500])
		.range([0,360]);
	d3.selectAll('circle.planet')
		.attr('transform', function(d) {return 'rotate(' + scaler(+d['rowid']) + ',' + center.x + ',' + center.y + ')'});
};

EarthVisualisation.prototype._setPlanetScaledPositions = function () {
	console.log(this.zoom.scale());

	var centerY = this._getSvgCenter().y;
	var maxY = centerY - 10;
	var scaler = d3.scale.linear()
		.domain([0, this.DEFAULT_SCALE_DISTANCE / this.zoom.scale()])
		.range([0,maxY]);
	this.svg.selectAll('circle.planet')
		.attr('cy', function(d) {return centerY + scaler(+d['st_dist'])});
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
