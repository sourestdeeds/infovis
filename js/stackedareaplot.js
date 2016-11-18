var StackedAreaPlot = function() {
    this.tabID = "#stacked-area-plot";
}

StackedAreaPlot.prototype.draw = function() {
    var methods = this._discMethods(dataHandler.selectedData);
    var hists = this._hists(methods);
    var groups = [for (hist of hists) hist[0]];
    var types = {};
    var ticks = this._generateXTicks();
    
    console.log(ticks);
    
    groups.forEach(function(group) {
        types[group] = 'area';
    });
    
    this.chart = c3.generate({
        'bindto': '#stacked-area-plot-div',
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
}

StackedAreaPlot.prototype._discMethods = function(data) {
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

StackedAreaPlot.prototype._hists = function(methods) {
    var hists = [];
    var binCount = dataHandler.currentRange[1] - dataHandler.currentRange[0];

    for (var method in methods) {
        if (methods.hasOwnProperty(method)) {
            var bins = d3.layout.histogram()
                .bins(binCount)
                .range(dataHandler.currentRange)
                (methods[method]);
            
            var hist = [for (bin of bins) bin.y];
            hists.push([method].concat(hist));
        }
    }
    
    return hists;
}

StackedAreaPlot.prototype._generateXTicks = function() {
    var i = dataHandler.currentRange[0];
    var ticks = [];
    
    while (i <= dataHandler.currentRange[1]) {
        ticks.push(i.toString());
        i += 1;
    }
    
    return ticks;
}

