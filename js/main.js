function main() {
	parseData(processData);
}

function planetPlotter(data) {
	var xTarget = 'pl_disc';
	var yTarget = 'pl_bmassj';
	var domainValues = data.map(function(row) {return +row[xTarget]});
	var xMapper = d3.scaleLinear()
		.domain([Math.min.apply(null, domainValues), Math.max.apply(null, domainValues)])
		.range([10,990]);

	var domainValues = data.map(function(row) {return +row[yTarget]});
	var yMapper = d3.scaleLinear()
		.domain([Math.min.apply(null, domainValues), Math.max.apply(null, domainValues)])
		.range([990,10]);

	var svg = d3.select('#plot');
	var planets = svg.selectAll('rect').data(data).enter().append('rect');
	planets.attr('width', 2)
		.attr('height', 2)
		.attr('x', function(d) {return xMapper(+d[xTarget])})
		.attr('y', function(d) {return yMapper(+d[yTarget])});
}

function planetSystem(data) {
	var distTarget = 'pl_orbsmax';
	var radiusTarget = 'pl_radj';
	var domainValues = data.map(function(row) {return +row[distTarget]});
	var distMapper = d3.scaleLinear()
		.domain([Math.min.apply(null, domainValues), Math.max.apply(null, domainValues)])
		.range([0,2000000]);

	var domainValues = data.map(function(row) {return +row[radiusTarget]});
	var radiusMapper = d3.scaleLinear()
		.domain([Math.min.apply(null, domainValues), Math.max.apply(null, domainValues)])
		.range([0.1,5]);


	var svg = d3.select('#planets');
	var planets = svg.selectAll('circle.planet').data(data).enter().append('circle');
	var t = planets.attr('cy', function(d) { return -distMapper(+d[distTarget])})
		.attr('cx', 0)
		.attr('fill', 'brown')
		.attr('r', function(d) {return radiusMapper(+d[radiusTarget])})
		.transition();

	t.duration(1000)
	.attrTween('transform', function(d) {s = 'rotate(' + (Math.random()*360) + ',0,0)'; return d3.interpolateString('rotate(0,0,0)',s);})
	.attrTween('opacity', function(d) {return d3.interpolateString('0','0.5');});
}

function processData(data) {
	planetPlotter(data);
	planetSystem(data);
}

function parseData(callback) {
	d3.text('data/planets.csv', function(csv) {
		csv = csv.replace(/^[#@][^\n]*\n/mg, '');
		var data = d3.csvParse(csv);
		callback(data);
	})
}
