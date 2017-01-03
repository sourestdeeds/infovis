var HistogramVisualisation = function() {
    this.tabID = '#histograms';
    this.dataColumns = ['pl_orbsmax', 'pl_orbsmax', 'pl_orbsmax', 'pl_orbsmax', 'pl_orbsmax', 'pl_orbsmax', 'pl_orbsmax', 'pl_orbsmax', 'pl_orbsmax', 'pl_orbsmax', 'pl_orbsmax', 'pl_orbsmax', 'pl_orbsmax', 'pl_orbsmax', 'pl_orbsmax', 'pl_orbsmax'];
    this.div = document.getElementById('histograms-div');
    this.PADDING = 20;
    
    if (!this._isPerfectSquare(this.dataColumns.length)) {
        throw new Error("Amount of dataColumns in HistogramVisualisation must be a perfect square.");
    } else {
        this.tableSide = Math.sqrt(this.dataColumns.length);
    }
}

HistogramVisualisation.prototype.draw = function() {
    this.div.innerHTML = '';
    var cellSide = Math.round(Math.min(this.div.clientWidth, this.div.clientHeight) / this.tableSide) - this.PADDING;
    var tableWidth = ((cellSide + this.PADDING + 1) * this.tableSide) + 'px';
    
    this.div.style.maxWidth = tableWidth;
    
    for (var i = 0; i < this.tableSide; ++i) {
        var rowDiv = document.createElement('div');
        rowDiv.style.clear = 'both';
    
        for (var j = 0; j < this.tableSide; ++j) {
            var cell = document.createElement('div');
            var index = i * this.tableSide + j;
            var cellId = 'histCell' + index;
            var tooltipText = dataHandler.COLUMN_DESCRIPTIONS[this.dataColumns[index]];
            
            cell.setAttribute('id', cellId);
            cell.setAttribute('class', 'histCell');
            cell.setAttribute('title', tooltipText);
            cell.style.width = cellSide + 'px';
            cell.style.height = cellSide + 'px';
            
            this._setMargin(i, j, cell);
            
            rowDiv.appendChild(cell);
        }
        
        this.div.appendChild(rowDiv);
    }
    
    var self = this;
    
    setTimeout(function() {
        for (var i = 0; i < self.dataColumns.length; ++i) {
            self._attachHistogram('histCell' + i, self.dataColumns[i]);
        }
    }, 0);
}

HistogramVisualisation.prototype._setMargin = function(i, j, cell) {
    if (i === 0) {
        cell.style.marginTop = Math.round(this.PADDING / 2) + 'px';
    } else {
        cell.style.marginTop = this.PADDING + 'px';
    }
    
    if (j === 0) {
        cell.style.marginLeft = Math.round(this.PADDING / 2) + 'px';
    } else {
        cell.style.marginLeft = this.PADDING + 'px';
    }
}

HistogramVisualisation.prototype._attachHistogram = function(cellId, dataColumn) {
    var data = dataHandler.selectedData;
    
    grouped = this._groupPerMethod(data, function(entry) {
        var sma = entry[dataColumn];
        
        if (sma === "") {
            return null;
        } else {
            return Math.log(Number(sma) + Math.exp(1));
        }
    });
    
    var hists = this._hists(grouped);
    var groups = [];
    var types = {};
    
    hists.forEach(function(hist) {
        groups.push(hist[0]);
    });
    
    groups.forEach(function(group) {
        types[group] = 'spline';
    });
    
    var chart = c3.generate({
        'bindto': '#' + cellId,
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

HistogramVisualisation.prototype._isPerfectSquare = function(x) {
	var y = Math.sqrt(x);
	return Math.floor(y) === y;
};

