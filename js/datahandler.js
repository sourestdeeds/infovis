var DataHandler = function(dataFile, locationsFile) {
	this.dataFile = dataFile;
	this.locationsFile = locationsFile;

	this.dataLoaded = false;
	this.locationsLoaded = false

	this.data = [];
	this.selectedData = [];
	this.highlightedData = [];
	this.discoveryMethods = [];
	this.discoveryMethodFilter = {}
	this.discoveryMethodsColorMap = d3.scale.ordinal().range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#cfa36b', '#bcbd22', '#17becf']);
	
	this.dataLoadedCallbackQueue = [];
	this.currentRange = undefined;
	this.currentRadiusRange = undefined;
	this.locations = [];

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

		self._processCallbacks();
	});

	d3.text(this.locationsFile, function(csv) {
		var csv = csv.replace(/^[#@][^\n]*\n/mg, '');
		self.locations = d3.csv.parse(csv);
		self.locationsLoaded = true;

		self._processCallbacks();
	});
};

DataHandler.prototype.onDataLoaded = function(callback) {
	if (this.dataLoaded && this.locationsLoaded) {
		callback();
	} else {
		this.dataLoadedCallbackQueue.push(callback);
	}
};

DataHandler.prototype.setRange = function(fromYear, toYear) {
    this.currentRange = [fromYear, toYear];
};

DataHandler.prototype.setRadiusRange = function(fromRadius, toRadius) {
    this.currentRadiusRange = [fromRadius, toRadius];
};

DataHandler.prototype.filterData = function() {
	var self = this;

	this.selectedData = this.data.filter(function(entry) {
		year = parseInt(entry['pl_disc']);
		radius = parseFloat(entry['pl_rade']);
		method = entry['pl_discmethod'];

		if (self.timeFilterOn && !(self.currentRange[0] <= year && year <= self.currentRange[1]))
			return false;

		//console.log(self.currentRadiusRange[0], radius, self.currentRadiusRange[1]);

		if (self.radiusFilterOn && !(self.currentRadiusRange[0] <= radius && radius <= self.currentRadiusRange[1]))
			return false;

		return self.discoveryMethodFilter[method];
	});
}

DataHandler.prototype._createDiscoveryMethods = function () {
	this.discoveryMethods = this.data.map(function(entry) {
		return entry['pl_discmethod'];
	}).filter(function(value, index, self) {
		return self.indexOf(value) === index;
	});
	this.discoveryMethods.sort();
	this.discoveryMethodsColorMap.domain(this.discoveryMethods);
};

DataHandler.prototype._processCallbacks = function() {
	if (this.dataLoaded && this.locationsLoaded) {
		this.dataLoadedCallbackQueue.forEach(function(callback) {
		    callback();
	    });
	}
}

DataHandler.prototype.initFilter = function() {
	var self = this;

	for (var i = 0; i < self.discoveryMethods.length; i++) {
		self.discoveryMethodFilter[self.discoveryMethods[i]] = true;
	}
	self.timeFilterOn = true;
	self.radiusFilterOn = false;

	for (var i = 0; i < self.discoveryMethods.length/2; i++) {
		var meth1 = self._createDiscoveryMethodFilterHTML(self.discoveryMethods[2*i]);
		var meth2 = self._createDiscoveryMethodFilterHTML(self.discoveryMethods[2*i+1]);

		var div = $('<div class="col-sm-2"/>');
		div.append(meth1);
		div.append(meth2);

		$('#disc-methods').append(div);
	}

	$('#time-checkbox').on('change', function() {
		self.timeFilterOn = this.checked;
		self.filterData();
		visualisationManager.updateAll();
	});
	$('#radius-checkbox').on('change', function() {
		self.radiusFilterOn = this.checked;
		self.filterData();
		visualisationManager.updateAll();
	});
}

DataHandler.prototype._createDiscoveryMethodFilterHTML = function(method) {
	var self = this;

	var checkbox = $('<input>', { type:'checkbox', checked:'checked' });
	checkbox.css({'border' : '1px solid ' + self.discoveryMethodsColorMap(method)})
	checkbox.css({'background-color' : (self.discoveryMethodFilter[method] ? self.discoveryMethodsColorMap(method) : 'transparent')})
	checkbox.on('change', function() {
		self.discoveryMethodFilter[method] = this.checked;
		self.filterData();
		visualisationManager.updateAll();
		checkbox.css({'background-color' : (self.discoveryMethodFilter[method] ? self.discoveryMethodsColorMap(method) : 'transparent')})
	})
	var label = $('<label>');
	label.append(checkbox);
	label.append(method);
	var div = $('<div/>');
	div.append(label);

	return div;
}

var dataHandler = new DataHandler('data/planets.csv', 'data/locations.csv');
