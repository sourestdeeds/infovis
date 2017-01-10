var OrbitsVisualisation = function() {
    this.tabID = "#methodquality";
    this.div = document.getElementById("methodquality-div");
    this.columns = ['pl_bmasse', 'pl_dens', 'pl_eqt', 'pl_imppar', 'pl_insol', 'pl_occdep', 'pl_orbeccen', 'pl_orbincl', 'pl_orblper', 'pl_orbper', 'pl_orbsmax', 'pl_orbtper', 'pl_rade', 'pl_ratdor', 'pl_ratror', 'pl_rvamp'];
}

OrbitsVisualisation.prototype.draw = function() {
    var presence = this._presence();
    var errors = this._errors();
    
    var data = ['data'];
    var data_x = ['data_x'];
    
    for (method in presence) {
        if (presence.hasOwnProperty(method)) {
            data.push(presence[method]);
            data_x.push(errors[method]);
        }
    }

    c3.generate({
        bindto: '#methodquality-div',
        data: {
            xs: {
                'data': 'data_x'
            },
            columns: [
                data_x,
                data
            ],
            type: 'scatter'
        }
    });
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
