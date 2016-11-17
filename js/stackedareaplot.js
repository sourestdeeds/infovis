var StackedAreaPlot = function() {
    this.tabID = "#stacked-area-plot";
    this.chart = null;
    this.BIN_COUNT = 20;
}

StackedAreaPlot.prototype.draw = function() {/*
    var methods = this.discMethods(dataHandler.selectedData);
    console.log(dataHandler.currentRange);
    
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
    }
*/}
/*
StackedAreaPlot.prototype.discMethods = function(data) {
    var methods = {};
    
    data.forEach(function(entry) {
        var method = entry['pl_discmethod'];
        var year = Number(entry['pl_discyear']);
        
        if (method in methods) {
            methods[method].push(year);
        } else {
            methods[method] = [year];
        }
    });
    
    return methods;
}

StackedAreaPlot.prototype.hists = function(methods, bucketWidth) {
    var hists = [];

    for (var method in methods) {
        if (methods.hasOwnProperty(method)) {
            //var hist = d3.layout.histogram()
            //    .bins(this.BIN_COUNT)
            //   .range(dataHandler.currentRange)
            //    (methods[method]));
            //console.log(hist);
        }
    }
}
*/
