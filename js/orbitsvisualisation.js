var OrbitsVisualisation = function() {
    this.tabID = "#orbitsvisualisation";
    this.chart = null;
}

OrbitsVisualisation.prototype.draw = function() {
    var methods = this._discMethods(dataHandler.selectedData);
    var hists = this._hists(methods);
    var groups = [];
    
    hists.forEach(function(hist) {
        groups.push(hist[0]);
    });
    
    var types = {};
    var ticks = this._generateXTicks();
    
    groups.forEach(function(group) {
        types[group] = 'area';
    });
    
    if (this.chart == null) {
        this.chart = c3.generate({
            'bindto': '#orbits-div',
            'data': {
                'columns': hists,
                'types': types,
                'groups': [groups]
            },
            'axis': {
                'x': {
                    'type': 'category',
                    'categories': ticks
                }
            }
        });
    } else {
        this.chart.load({
            'columns': hists,
            'types': types,
            'groups': [groups],
            'categories': ticks,
            'unload': true
        });
    }
    
    console.log(this.chart);
}

OrbitsVisualisation.prototype._discMethods = function(data) {
    var methods = {};
    
    data.forEach(function(entry) {
        var method = entry['pl_discmethod'];
        var year = Number(entry['pl_disc']);
        
        if (method in methods) {
            methods[method].push(year);
        } else {
            methods[method] = [year];
        }
    });
    
    return methods;
}

OrbitsVisualisation.prototype._hists = function(methods) {
    var hists = [];
    var binCount = dataHandler.currentRange[1] - dataHandler.currentRange[0] + 1;

    for (var method in methods) {
        if (methods.hasOwnProperty(method)) {
            var bins = d3.layout.histogram()
                .bins(binCount)
                .range(dataHandler.currentRange)
                (methods[method]);
            
            var hist = [];
            
            bins.forEach(function(bin) {
                hist.push(bin.y);
            });

            hists.push([method].concat(hist));
        }
    }
    
    return hists;
}

OrbitsVisualisation.prototype._generateXTicks = function() {
    var i = dataHandler.currentRange[0];
    var ticks = [];
    
    while (i <= dataHandler.currentRange[1]) {
        ticks.push(i.toString());
        i += 1;
    }
    
    return ticks;
}

