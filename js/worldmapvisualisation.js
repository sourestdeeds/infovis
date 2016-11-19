var WorldMapVisualisation = function() {
	var self = this;
	this.tabID = '#worldmap';

	this.svg = d3.select('#worldmap-svg');
	this.g = this.svg.append('g');
	this.scale = 1

	this.zoom = d3.behavior.zoom()
    			.scaleExtent([1, 9])
    			.on('zoom', function() {
    				var t = d3.event.translate;
    				var s = d3.event.scale; 
    				var h = self.height/4;

    				t[0] = Math.min(
    						(self.width/self.height)  * (s - 1), 
    						Math.max( self.width * (1 - s), t[0] )
    					);

    				t[1] = Math.min(
    						h * (s - 1) + h * s, 
    						Math.max(self.height  * (1 - s) - h * s, t[1])
    					);

				  	self.zoom.translate(t);
				  	self.g.attr('transform', 'translate(' + t + ')scale(' + s + ')');

				  	if (s != self.scale) {
				  		self.scale = s;
				  		self.drawPoints();
				  	}
				});


	this.svg.call(this.zoom);

}


WorldMapVisualisation.prototype.draw = function () {
	var self = this;

	self.width = document.getElementById('worldmap').offsetWidth
	self.height = self.width / 2;

	self.svg.attr('width', self.width)
  		.attr('height', '100%')

	self.projection = d3.geo.mercator()
					.translate([(self.width/2), (self.height / 2)])
					.scale( self.width / 2 / Math.PI);

	self.path = d3.geo.path().projection(self.projection);
	self.countriesDrawn = false;

	d3.json('data/world-topo-min.json', function(error, world) {
		self.drawMap(topojson.feature(world, world.objects.countries).features);
	});
};

WorldMapVisualisation.prototype.drawMap = function (topo) {
	var self = this;

	if (!self.countriesDrawn) {
		self.g.selectAll('.country').remove();


		self.g.selectAll('.country').data(topo).enter().insert('path')
			.attr('class', 'country')
			.attr('d', self.path)
			.attr('id', function(d,i) { return d.id; })
			.attr('title', function(d,i) { return d.properties.name; })
			.attr('stroke-width', 0.5 / self.scale)
			.attr('stroke', '#FFFFFF')
			.style('fill', function(d, i) { return '#A1B8E5' /* d.properties.color; */ });

		self.countriesDrawn = true;
	}

	self.drawPoints();
}

WorldMapVisualisation.prototype.drawPoints = function() {
	var self = this;

	d3.selectAll('.gpoint').remove();
	d3.csv('data/observatory_locations.csv', function(err, observatories) {
		var counts  = d3.nest()
							  .key(function(d) { return d.pl_facility; })
							  .rollup(function(v) { return v.length; })
							  .entries(dataHandler.selectedData);

		counts.forEach(function(count) {
			var loc = self._findLocation(count.key, observatories)
			if (loc !== null) {
				self.drawPoint(loc.lon, loc.lat, count.values);
			}
		});

	});
}

WorldMapVisualisation.prototype.drawPoint = function(lat, lon, size) {
	var gpoint = this.g.append('g').attr('class', 'gpoint');
	var x = this.projection([lat,lon])[0];
	var y = this.projection([lat,lon])[1];

	gpoint.append('svg:circle')
		.attr('cx', x)
		.attr('cy', y)
		.attr('class', 'point')
		.attr('r', 5*Math.log(size) / Math.sqrt(this.scale) )
		.attr('fill', '#B80004')
		.attr('stroke', '#B80004')
		.attr('stroke-width', 2 / this.scale)
		.attr('fill-opacity', 0.5);
}

WorldMapVisualisation.prototype._findLocation = function(name, locations) {
	for (var i = 0; i < locations.length; i++) {
		if (locations[i].name.indexOf(name) !== -1) {
			return locations[i];
		}
	}

	return null;
}