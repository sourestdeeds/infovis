var WorldMapVisualisation = function() {
	var self = this;
	this.tabID = '#worldmap';
	
	this.MAX_LABEL_LENGTH = 20;

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

	d3.select('#pie-chart-wrapper').style('display', 'none');

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

	var buckets = self._createBuckets();
	var mapping = self._createMapping();

	dataHandler.selectedData.forEach(function(entry) {
		if (entry.pl_facility in mapping) {
			buckets[mapping[entry.pl_facility]].values.push(entry);
		}
	});

	for (var location in buckets) {
		if (buckets.hasOwnProperty(location)) {
			self.drawPoint(location, buckets[location]);
		}
	}
}

WorldMapVisualisation.prototype.drawPoint = function(name, bucket) {
	var self = this;

	var lon = bucket.coords.lon;
	var lat = bucket.coords.lat;
	var size = bucket.values.length;

	var gpoint = self.g.append('g').attr('class', 'gpoint');
	var x = self.projection([lon,lat])[0];
	var y = self.projection([lon,lat])[1];

	if (size === 0)
		return;

	gpoint.append('svg:circle')
		.attr('cx', x)
		.attr('cy', y)
		.attr('class', 'point')
		.attr('r', 5*Math.log(size) / Math.sqrt(self.scale) )
		.attr('fill', '#B80004')
		.attr('stroke', '#B80004')
		.attr('stroke-width', 2 / self.scale)
		.attr('fill-opacity', 0.3)
		.on('mouseover', function() {
			d3.select(this).attr('stroke', '#348D61').attr('fill', '#348D61');
		})
		.on('mouseout', function() {
			d3.select(this).attr('stroke', '#B80004').attr('fill', '#B80004');
		})
		.on('click', function() {
			self.drawPieChart(name, bucket);
		});
}

WorldMapVisualisation.prototype._createBuckets = function() {
	var self = this;

	var locations = self._unique(dataHandler.locations.map(function(entry) {
		return entry.name
	}));

	var buckets = {};

	locations.forEach(function(name) {
		buckets[name] = {
			coords: self._findCoordinates(name),
			values: []
		}
	});

	return buckets;
}

WorldMapVisualisation.prototype._unique = function(array) {
    var seen = {};
    return array.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

WorldMapVisualisation.prototype._findCoordinates = function(name) {
	for (var i = 0; i < dataHandler.locations.length; i++) {
		if (dataHandler.locations[i].name.indexOf(name) !== -1) {
			return {
				lat: dataHandler.locations[i].lat, 
				lon: dataHandler.locations[i].lon
			};
		}
	}

	return null;
}

WorldMapVisualisation.prototype._createMapping = function() {
	var mapping = {};

	dataHandler.locations.forEach(function(location) {
		mapping[location.disc_location] = location.name;
	});

	return mapping;
}


WorldMapVisualisation.prototype._findTelescopes = function(bucket) {
	return bucket.values.map(function(entry) {
		return entry.pl_telescope;
	});
}

WorldMapVisualisation.prototype.drawPieChart = function(name, bucket) {
	var self = this;

	d3.select('#detail-pie-chart').remove();
	d3.select('#pie-chart-wrapper').style('display', 'block');
	d3.select('#pie-chart-close').on('click', function() {
		d3.select('#pie-chart-wrapper').style('display', 'none');
	});
	d3.select('#pie-chart-body').append('div').attr('id', 'detail-pie-chart');
	d3.select('#pie-chart-title span').text(name);

    var telescopes = self._findTelescopes(bucket);
    var truncatedTelescopes = [];
    
    telescopes.forEach(function(entry) {
        if (entry.length > self.MAX_LABEL_LENGTH) {
            truncatedTelescopes.push(entry.substring(0, self.MAX_LABEL_LENGTH - 3) + '...');
        } else {
            truncatedTelescopes.push(entry);
        }
    });

	var groups = d3.nest()
					.key(function(d) { return d; })
					.rollup(function(v) { return v.length; })
					.entries(truncatedTelescopes)
					.map(function(entry) {
						return [entry.key, entry.values]
					});


	var chart = c3.generate({
		bindto: '#detail-pie-chart',
		size: {
			height: 200
		},
		legend: {
			position: 'right'
		},
		data: {
			type: 'pie',
			columns: groups
		},
		pie: {
			label: {
				format: function(value, ratio, id) {
					return value;
				}
			}
		}
	});
}
