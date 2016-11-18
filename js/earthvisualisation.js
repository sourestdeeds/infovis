var EarthVisualisation = function() {
	this.tabID = '#earth';

	this.MAX_DISTANCE = 10000;
	// Use exponential scale for zooming
	this.scaleMapper = d3.scale.log().domain([1,this.MAX_DISTANCE]).range([1,0]).invert;
	// Scale is a value between 0 (zoomed out) and 1 (zoomed in)
	this.scale = 0;

	this.svg = d3.select('#earth-svg');
	//TODO: redraw when resized
	//$('#earth-svg').resize(this.draw)
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
	this.scale = scale;
	this._setPlanetScaledPositions();
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
	var centerY = this._getSvgCenter().y;
	var maxY = centerY - 10;
	var scaler = d3.scale.linear()
		.domain([0, this.scaleMapper(this.scale)])
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
