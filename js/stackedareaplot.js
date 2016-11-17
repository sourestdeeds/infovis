var StackedAreaPlot = function() {
    this.tabID = "#stacked-area-plot";
    this.chart = null;
}

StackedAreaPlot.prototype.draw = function() {
    console.log('StackedAreaPlot drawn');
    
    /*
    var methods = this.discMethods(dataHandler.selectedData);
    console.log(methods);
    
    if (this.chart == null) {
        this.chart = c3.generate({
            bindto: '#stacked-area-plot-div',
            data: {
                columns: [
                    ['data1', 300, 350, 300, 0, 0, 120],
                    ['data2', 130, 100, 140, 200, 150, 50]
                ],
                types: {
                    data1: 'area-spline',
                    data2: 'area-spline'
                    // 'line', 'spline', 'step', 'area', 'area-step' are also available to stack
                },
                groups: [['data1', 'data2']]
            }
        });
    } else {
        console.log('update ignored');
    }
    */
}

StackedAreaPlot.prototype.discMethods = function(data) {
    var methods = {};
    
    data.forEach(function(entry) {
        var method = entry['pl_discmethod'];
        var year = entry['pl_discyear'];
        
        if (method in methods) {
            methods[method] += 1;
        } else {
            methods[method] = 1;
        }
    });
    
    return methods;
}

StackedAreaPlot.prototype.hist = function(data, bucketWidth) {
    
}
