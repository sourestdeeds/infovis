var TemperatureVisualisation = function() {
	var self = this
	this.tabID = '#temperature';
	this.svg = d3.select('#temperature-svg');
};

TemperatureVisualisation.prototype.draw = function () {
	this.drawPlanets();
};

TemperatureVisualisation.prototype.drawPlanets = function () {
	var svgSize = this._getSvgSize();
	var selectedPlanets = dataHandler.selectedData.filter(function(element) {
		return element['pl_eqt'] != '' && element['pl_orbsmax'] != '';
	});
	var logXScale = d3.scale.log()
		.domain([1, 2500]);
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
		.attr('cx', function(d) {return svgSize.width * logXScale(+d['pl_orbsmax'] + 1)})
		.attr('cy', function(d) {return svgSize.height * (1 - linearYScale(+d['pl_eqt']))})
		.attr('fill', function(d) {if(d['st_teff'] == '') return 'black'; else return colorScale(+d['st_teff']);})
		.attr('name', function(d) {return +d['st_teff']})
		.attr('opacity', '0.75')
		.attr('r', 4);
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
