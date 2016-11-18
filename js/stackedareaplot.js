var StackedAreaPlot = function() {
    this.tabID = "#stacked-area-plot";
}

StackedAreaPlot.prototype.draw = function() {
    var methods = this._discMethods(dataHandler.selectedData);
    var hists = this._hists(methods);
    var groups = [for (hist of hists) hist[0]];
    var types = {};
    
    groups.forEach(function(group) {
        types[group] = 'area-spline';
    });
    
    console.log(hists[0]);
    
    this.chart = c3.generate({
        bindto: '#stacked-area-plot-div',
        data: {
            'columns': hists,
            'types': types,
            'groups': [groups]
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
    var binCount = Math.floor((dataHandler.currentRange[1] - dataHandler.currentRange[0]) / 2);
    
    console.log(binCount);

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

