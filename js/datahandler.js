var DataHandler = function(dataFile) {
	this.dataFile = dataFile;
	this.dataLoaded = false;
	this.callbackQueue = [];
	this.parseData();
}

DataHandler.prototype.parseData = function() {
	var self = this;
	d3.text(this.dataFile, function(csv) {
		var csv = csv.replace(/^[#@][^\n]*\n/mg, '');
		self.data = d3.csvParse(csv);
		self.dataLoaded = true;
		self.callbackQueue.forEach(function(callback) {callback()});
	})
}

DataHandler.prototype.onDataLoaded = function(callback) {
	if(this.dataLoaded) {
		callback()
	} else {
		this.callbackQueue.push(callback);
	}
}

var dataHandler = new DataHandler('data/planets.csv');
