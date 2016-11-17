/*
 * Visualisation implementation objects should be added to this object in the
 * main routine. It will invoke the draw() method on all visualisations when
 * drawAll() is invoked, for example when the DataHandler has loaded the CSV or
 * when the timeline slider is changed by the user.
 */

var VisualisationManager = function() {
    this.visualisations = [];
}

VisualisationManager.prototype.addVisualisation = function(visualisation) {
    this.visualisations.push(visualisation);
}

// Invoked whenever redrawing should happen
VisualisationManager.prototype.drawAll = function() {
    this.visualisations.forEach(function(visualisation) {
        visualisation.draw();
    });
}

var visualisationManager = new VisualisationManager();
