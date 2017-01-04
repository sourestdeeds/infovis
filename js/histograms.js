var HistogramVisualisation = function() {
    this.tabID = '#histograms';
    this.div = document.getElementById('histograms-div');
    this.PADDING = 20;
    this.DATA_COUNT_THRESH = 30;
    
    this._initializeSelection();
}

HistogramVisualisation.prototype._initializeSelection = function() {
    this.dataColumns = [
        'pl_orbsmax',
        'pl_orbper',
        'pl_bmasse',
        'pl_orbeccen',
        'pl_pnum',
        'st_age',
        'st_dist',
        'st_mass',
        'ra'
    ];
    
    if (!this._isPerfectSquare(this.dataColumns.length)) {
        throw new Error("Amount of dataColumns in HistogramVisualisation must be a perfect square.");
    } else {
        this.tableSide = Math.sqrt(this.dataColumns.length);
    }
    
    this.isLog = [];
    var self = this;
    
    this.dataColumns.forEach(function(entry) {
        self.isLog.push(false);
    });
}

HistogramVisualisation.prototype.draw = function() {
    this.div.innerHTML = '';
    
    this.cellSide = Math.round(Math.min(this.div.clientWidth, this.div.clientHeight) / this.tableSide) - this.PADDING;
    var tableWidth = ((this.cellSide + this.PADDING + 1) * this.tableSide) + 'px';
    
    this.div.style.maxWidth = tableWidth;
    
    for (var i = 0; i < this.tableSide; ++i) {
        var rowDiv = document.createElement('div');
        rowDiv.style.clear = 'both';
    
        for (var j = 0; j < this.tableSide; ++j) {
            let cell = document.createElement('div');
            var index = i * this.tableSide + j;
            var cellId = 'histCell' + index;
            
            cell.setAttribute('id', cellId);
            cell.style.width = this.cellSide + 'px';
            cell.style.height = this.cellSide + 'px';
            
            this._updateCell(cell, index);
            
            let _i = i;
            let _j = j;
            var self = this;
            
            cell.onclick = function() {
                cell.innerHTML = '';
                let index = _i * self.tableSide + _j;
                self.isLog[index] = !self.isLog[index];
                self._updateCell(cell, index);
                
                setTimeout(function() {
                    self._attachHistogram(index, 'histCell' + index, self.isLog[index], self.dataColumns[index]);
                }, 0);
            };
            
            this._setMargin(i, j, cell);
            rowDiv.appendChild(cell);
        }
        
        this.div.appendChild(rowDiv);
    }
    
    var self = this;
    
    setTimeout(function() {
        for (var i = 0; i < self.dataColumns.length; ++i) {
            self._attachHistogram(i, 'histCell' + i, self.isLog[i], self.dataColumns[i]);
        }
    }, 0);
}

HistogramVisualisation.prototype._updateCell = function(cell, index) {
    cell.setAttribute('class', 'histCell' + (this.isLog[index] ? ' log' : ''));
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

HistogramVisualisation.prototype._attachHistogram = function(index, cellId, isLog, dataColumn) {
    var data = dataHandler.selectedData;
    
    grouped = this._groupPerMethod(data, function(entry) {
        var value = Number(entry[dataColumn]);
        
        if (isNaN(value) || value === 0) {
            return null;
        } else {
            return isLog ? Math.log(value + Math.exp(1)) : value;
        }
    });
    
    var filtered = this._filter(grouped);
    var hists = this._hists(filtered);
    var groups = [];
    var types = {};
    
    hists.forEach(function(hist) {
        groups.push(hist[0]);
    });
    
    groups.forEach(function(group) {
        types[group] = 'spline';
    });
    
    var self = this;
    var titleText = dataHandler.COLUMN_DESCRIPTIONS[this.dataColumns[index]];
    titleText += self.isLog[index] ? ' (Logaritmic)' : ' (Linear)';
    
    var chart = c3.generate({
        'bindto': '#' + cellId,
        'data': {
            'columns': hists,
            'types': types,
            'colors': StackedAreaPlot.prototype._colorMapping()
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
        },
        'title': {
            'text': titleText
        }
    });
}

HistogramVisualisation.prototype._filter = function(grouped) {
    var filtered = {};
    
    for (var method in grouped) {
        if (grouped.hasOwnProperty(method)) {
            if (grouped[method].length >= this.DATA_COUNT_THRESH) {
                filtered[method] = grouped[method];
            }
        }
    }
    
    return filtered;
}

HistogramVisualisation.prototype._groupPerMethod = function(data, selector) {
    var methods = {};
    
    data.forEach(function(entry) {
        var method = entry['pl_discmethod'];
        var value = selector(entry);
        
        if (value != null) {
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
                .bins(20)
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
                
                hist = this._smooth(hist);
                hists.push([method].concat(hist));
            }
        }
    }
    
    return hists;
}

HistogramVisualisation.prototype._smooth = function(a) {
    var b = [];
    
    a.forEach(function(entry) {
        b.push(0.0);
    });

    for (var i = 2; i < a.length - 2; ++i) {
        b[i] = (0.5 * a[i - 2] + a[i - 1] + a[i] + a[i + 1] + 0.5 * a[i + 2]) / 4.0;
    }
    
    return b;
}

HistogramVisualisation.prototype._isPerfectSquare = function(x) {
	var y = Math.sqrt(x);
	return Math.floor(y) === y;
};

