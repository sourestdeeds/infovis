var VisualisationManager = function() {
    this.activeTab = undefined;
    this.tabs = {};
}

VisualisationManager.prototype.addVisualisation = function(visualisation) {
    this.tabs[visualisation.tabID] = {
        "pendingUpdate": true,
        "visualisation": visualisation
    };
}

VisualisationManager.prototype.update = function(tabID) {
    var tab = this.tabs[tabID];

    if (tab && tab.pendingUpdate) {
        tab.visualisation.draw();
        tab.pendingUpdate = false;
    }
}

VisualisationManager.prototype.switchTo = function(tabID) {
    this.update(tabID);
    this.activeTab = tabID;
}

VisualisationManager.prototype.updateAll = function() {
    for (var tab in this.tabs) {
        if (this.tabs.hasOwnProperty(tab)) {
            this.tabs[tab].pendingUpdate = true;
        }
    }
    
    this.update(this.activeTab);
}

var visualisationManager = new VisualisationManager();
