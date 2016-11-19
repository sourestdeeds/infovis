var DataHandler = function(dataFile) {
	this.dataFile = dataFile;
	this.dataLoaded = false;
	this.data = [];
	this.selectedData = [];
	this.highlightedData = [];
	this.discoveryMethods = [];
	this.discoveryMethodsColorMap = d3.scale.category10();
	this.dataLoadedCallbackQueue = [];
	this.currentRange = undefined;

	this.parseData();
};

DataHandler.prototype.parseData = function() {
	var self = this;

	d3.text(this.dataFile, function(csv) {
		var csv = csv.replace(/^[#@][^\n]*\n/mg, '');
		self.data = d3.csv.parse(csv);
		self.selectedData = self.data;
		self._createDiscoveryMethods();
		self.dataLoaded = true;

		self.dataLoadedCallbackQueue.forEach(function(callback) {
		    callback();
	    });
	});
};

DataHandler.prototype.onDataLoaded = function(callback) {
	if (this.dataLoaded) {
		callback();
	} else {
		this.dataLoadedCallbackQueue.push(callback);
	}
};

DataHandler.prototype.setRange = function(fromYear, toYear) {
    this.currentRange = [fromYear, toYear];
	this.selectedData = this.data.filter(function(entry) {
		year = parseInt(entry['pl_disc']);
		return fromYear <= year && year <= toYear;
	});
};

DataHandler.prototype._createDiscoveryMethods = function () {
	this.discoveryMethods = this.data.map(function(entry) {
		return entry['pl_discmethod'];
	}).filter(function(value, index, self) {
		return self.indexOf(value) === index;
	});
	this.discoveryMethods.sort();
	this.discoveryMethodsColorMap.domain(this.discoveryMethods);
};

var dataHandler = new DataHandler('data/planets.csv');
