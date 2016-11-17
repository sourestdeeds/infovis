var DataHandler = function(dataFile) {
	this.dataFile = dataFile;
	this.dataLoaded = false;
	this.data = []
	this.selectedData = []
	this.highlightedData =[]
	this.dataLoadedCallbackQueue = [];

	this.parseData();
};

DataHandler.prototype.parseData = function() {
	var self = this;
	d3.text(this.dataFile, function(csv) {
		var csv = csv.replace(/^[#@][^\n]*\n/mg, '');
		self.data = d3.csv.parse(csv);
		self.selectedData = self.data;
		self.dataLoaded = true;
		self.dataLoadedCallbackQueue.forEach(function(callback) {callback()});
	});
};

DataHandler.prototype.onDataLoaded = function(callback) {
	if(this.dataLoaded) {
		callback()
	} else {
		this.dataLoadedCallbackQueue.push(callback);
	}
};

DataHandler.prototype.setRange = function (fromYear, toYear) {
	this.selectedData = this.data.filter(function(entry) {
		year = parseInt(entry['pl_disc']);
		return fromYear <= year && year <= toYear;
	});
};

var dataHandler = new DataHandler('data/planets.csv');
