var OrbitsVisualisation = function() {
    this.tabID = "#methodquality";
    this.columns = ['pl_bmasse', 'pl_dens', 'pl_eqt', 'pl_imppar',
                    'pl_insol', 'pl_occdep', 'pl_orbeccen', 'pl_orbincl',
                    'pl_orblper', 'pl_orbper', 'pl_orbsmax', 'pl_orbtper',
                    'pl_rade', 'pl_ratdor', 'pl_ratror', 'pl_rvamp'];
    this.svg = d3.select('#methodquality-svg');
}

OrbitsVisualisation.prototype.draw = function() {
    $("#methodquality-svg").empty();
    
    console.log('yes');

    var presence = this._presence();
    var errors = this._errors();
    var counts = this._counts();
    
    var data = [];
    
    for (method in presence) {
        if (presence.hasOwnProperty(method)) {
            data.push({method: method, n: counts[method], x: errors[method], y: presence[method]});
        }
    }

    this._drawSVG(data);
}

OrbitsVisualisation.prototype._drawSVG = function(data) {
    var width = $('#methodquality-svg').outerWidth();
	var height = $('#methodquality-svg').outerHeight();
    
    var xScale = d3.scale.linear()
                     .domain([0, 1])
                     .range([10, width - 10]);
    var yScale = d3.scale.linear()
                     .domain([0, 1])
                     .range([10, height - 10]);

    this.svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return xScale(d.x); })
        .attr("cy", function(d) { return yScale(d.y); })
        .attr("r", function(d) { return 2; });
}

OrbitsVisualisation.prototype._counts = function() {
    var data = {};
    
    dataHandler.selectedData.forEach(function(entry) {
        var method = entry['pl_discmethod'];
        
        if (method in data) {
            data[method] += 1;
        } else {
            data[method] = 1;
        }
    });
    
    return data;
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
            values.push(total / count);
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
