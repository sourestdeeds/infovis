var EarthVisualisation = function() {
	this.svg = d3.select('#earth-svg');
	$('#earth-svg').resize(this.draw)
	this.tabID = '#earth';
}

EarthVisualisation.prototype.draw = function () {
	console.log(this.getSvgSize());
};

EarthVisualisation.prototype.getSvgSize = function () {
	var width = $('#earth-svg').outerWidth();
	var height = $('#earth-svg').outerHeight();
	return {width: width, height: height};
};
