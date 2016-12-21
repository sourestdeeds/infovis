var HistogramVisualisation = function() {
    this.tabID = "#histograms";
    this.chart = null;
}

HistogramVisualisation.prototype.draw = function() {
    var data = dataHandler.selectedData;
    
    data = this._groupPerMethod(data, function(entry) {
        var sma = entry['pl_orbsmax'];
        
        if (sma === "") {
            return null;
        } else {
            return Math.log(Number(sma) + Math.exp(1));
        }
    });
    
    var hists = this._hists(data);
    var groups = [];
    var types = {};
    
    hists.forEach(function(hist) {
        groups.push(hist[0]);
    });
    
    groups.forEach(function(group) {
        types[group] = 'spline';
    });
    
    if (this.chart == null) {
        this.chart = c3.generate({
            'bindto': '#histograms-div',
            'data': {
                'columns': hists,
                'types': types
            },
            'axis': {
                'x': {'show': false},
                'y': {'show': false}
            },
            'point': {
                'show': false
            },
            'interaction': {
                'enabled': false
            },
            'legend': {
                'show': false
            }
        });
    } else {
        this.chart.load({
            'columns': hists,
            'types': types,
            'unload': true
        });
    }
}

HistogramVisualisation.prototype._groupPerMethod = function(data, selector) {
    var methods = {};
    
    data.forEach(function(entry) {
        var method = entry['pl_discmethod'];
        var value = selector(entry);
        
        if (value) {
            if (method in methods) {
                methods[method].push(value);
            } else {
                methods[method] = [value];
            }
        }
    });
    
    return methods;
}

HistogramVisualisation.prototype._hists = function(methods) {
    var hists = [];
    var l = [];
    
    for (var method in methods) {
        if (methods.hasOwnProperty(method)) {
            l = l.concat(methods[method]);
        }
    }
    
    var bounds = [Math.min(...l), Math.max(...l)];

    for (var method in methods) {
        if (methods.hasOwnProperty(method)) {
            var bins = d3.layout.histogram()
                .bins(40)
                .range(bounds)
                (methods[method]);
            
            var hist = [];
            var sum = 0.0;
            
            bins.forEach(function(bin) {
                sum += bin.y;
            });
            
            if (sum > 0.0) {
                bins.forEach(function(bin) {
                    hist.push(bin.y / sum);
                });
                
                hists.push([method].concat(hist));
            }
        }
    }
    
    return hists;
}

