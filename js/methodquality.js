var OrbitsVisualisation = function() {
    this.tabID = "#methodquality";
    this.svg = d3.select('#methodquality-svg');
}

OrbitsVisualisation.prototype.draw = function() {
    $("#methodquality-svg").empty();
    this.count();

    this.columns = ['pl_bmasse', 'pl_dens', 'pl_eqt', 'pl_imppar',
                    'pl_insol', 'pl_occdep', 'pl_orbeccen', 'pl_orbincl',
                    'pl_orblper', 'pl_orbper', 'pl_orbsmax', 'pl_orbtper',
                    'pl_rade', 'pl_ratdor', 'pl_ratror', 'pl_rvamp'];
    var presence = this._presence();
    this.columns = ['pl_bmasse', 'pl_orbper', 'pl_orbsmax'];
    var errors = this._errors();
    
    var data = [];
    var self = this;
    
    for (method in presence) {
        if (presence.hasOwnProperty(method)) {
            data.push({method: method, n: self.counts[method], x: errors[method], y: presence[method]});
        }
    }

    this._drawSVG(data);
}

OrbitsVisualisation.prototype._drawSVG = function(data) {
    var width = $('#methodquality-svg').outerWidth();
	var height = $('#methodquality-svg').outerHeight();
	var tooltip = d3.select('#tooltip');
    
    var xScale = d3.scale.linear()
                     .domain([0, 1])
                     .range([width - 160, 160]);
    var yScale = d3.scale.linear()
                     .domain([0, 1])
                     .range([height - 80, 80]);
    
    this.svg.append('line')
        .attr('x1', 40)
        .attr('x2', 40)
        .attr('y1', 40)
        .attr('y2', height - 40)
        .attr("stroke-width", 1)
        .attr("stroke", "black");
    
    this.svg.append('polyline')
        .attr('points', '37 40, 43 40, 40 27')
        .attr("stroke-width", 1)
        .attr("stroke", "black");
    
    this.svg.append('line')
        .attr('x1', 40)
        .attr('x2', width - 40)
        .attr('y1', height - 40)
        .attr('y2', height - 40)
        .attr("stroke-width", 1)
        .attr("stroke", "black");
        
    var pts = (width - 40) + ' ' + (height - 43) + ', ' + (width - 40) + ' ' + (height - 37) + ', ' + (width - 27) + ' ' + (height - 40);
    
    this.svg.append('polyline')
        .attr('points', pts)
        .attr("stroke-width", 1)
        .attr("stroke", "black");
    
    this.svg.append('text')
	    .attr("x", width - 100)
        .attr("y", height - 20)
        .text('better precision')
        .attr("text-anchor", "middle");
    
    // D3 fuckness prevention
    data = [{method: "Dummy Element", n: "0", x: "0", y: "0"}].concat(data);
    // No idea why this is necessary
    
    this.svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", function(d) { return xScale(d.x); })
        .attr("y", function(d) { return yScale(d.y); })
        .attr("opacity", "0.8")
        .text(function(d) { return d.method; })
        .attr("text-anchor", "middle")
        .attr("font-size", function(d) { return Math.log2(d.n + 2) * 4 + 'px'; })
        .attr('fill', function(d) { return dataHandler.discoveryMethodsColorMap(d.method); })
        .on('mouseover', function(d) {
            tooltip.transition()
			    .duration(200)
			    .style('opacity', .95)
		    tooltip.html('<b>' + d.method + '</b>: ' + d.n + ' confirmed planet' + ((d.n === 1) ? '' : 's'))
			    .style('left', (d3.event.pageX + 10) + 'px')
			    .style('top', (d3.event.pageY + 10) + 'px');
		    }
		)
		.on('mouseout', function(d) {
		    tooltip.transition()
			    .duration(500)
			    .style('opacity', 0);
		    }
		);
	
	this.svg.append('text')
        .text('better data availability')
        .attr("text-anchor", "middle")
        .attr('transform', 'translate(30, 120)rotate(-90)');
}

OrbitsVisualisation.prototype.count = function() {
    var data = {};
    
    dataHandler.selectedData.forEach(function(entry) {
        var method = entry['pl_discmethod'];
        
        if (method in data) {
            data[method] += 1;
        } else {
            data[method] = 1;
        }
    });
    
    this.counts = data;
}

OrbitsVisualisation.prototype._presence = function() {
    var data = {};
    var self = this;
    
    dataHandler.selectedData.forEach(function(entry) {
        var method = entry['pl_discmethod'];
        
        if (!(method in data)) {
            data[method] = [0, 0];
        }
        
        ++(data[method][0]);
        
        self.columns.forEach(function(column) {
            if (entry[column] !== '') {
                ++(data[method][1]);
            }
        });
    });
    
    var values = [];
    
    for (method in data) {
        if (data.hasOwnProperty(method)) {
            var v = data[method][1] / (data[method][0] * this.columns.length);
            data[method] = v;
            values.push(v);
        }
    }
    
    var lower = Math.min(...values);
    var upper = Math.max(...values);
    
    for (method in data) {
        if (data.hasOwnProperty(method)) {
            data[method] -= lower;
            data[method] /= upper - lower;
        }
    }
    
    return data;
}

OrbitsVisualisation.prototype._errors = function() {
    var data = {};
    var totals = {};
    var self = this;
    
    this.columns.forEach(function(column) {
        totals[column] = [0, 0];
    });
        
    dataHandler.selectedDataAllMethods.forEach(function(entry) {
        var method = entry['pl_discmethod'];
        
        if (!(method in data)) {
            var percolumn = {};
            
            self.columns.forEach(function(column) {
                percolumn[column] = [0, 0];
            });
        
            data[method] = percolumn;
        }
        
        self.columns.forEach(function(column) {
            if (entry[column] !== '') {
                var upper = Number(entry[column + 'err1']);
                var lower = Number(entry[column + 'err2']);            
                
                ++(data[method][column][0]);
                data[method][column][1] += upper - lower;
                ++(totals[column][0]);
                totals[column][1] += upper - lower;
            }
        });
    });
    
    this.columns.forEach(function(column) {
        totals[column] = totals[column][1] / totals[column][0];
    });
    
    var values = [];
    
    for (method in data) {
        if (data.hasOwnProperty(method)) {
            var total = 0.0;
            var count = 0;
            
            self.columns.forEach(function(column) {
                if (data[method][column][0] > 0) {
                    data[method][column][1] /= data[method][column][0];
                    data[method][column][1] /= totals[column];
                    total += data[method][column][1];
                    ++count;
                }
            });
            
            data[method] = total / count;
            
            if (method in self.counts) {
                values.push(total / count);
            }
        }
    }
    
    var lower = Math.min(...values);
    var upper = Math.max(...values);
    
    for (method in data) {
        if (data.hasOwnProperty(method)) {
            data[method] -= lower;
            data[method] /= upper - lower;
            data[method] = Math.pow(data[method], 1 / 4); /* gratuitious quartic root is gratuitious */
        }
    }
    
    return data;
}
