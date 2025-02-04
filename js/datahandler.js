var DataHandler = function(dataFile, locationsFile) {
	this.dataFile = dataFile;
	this.locationsFile = locationsFile;

	this.dataLoaded = false;
	this.locationsLoaded = false

	this.data = [];
	this.selectedData = [];
	this.selectedDataAllMethods = [];
	this.highlightedData = [];
	this.highlightedPlanet = null;
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
	
	this.selectedDataAllMethods = this.data.filter(function(entry) {
		year = parseInt(entry['pl_disc']);
		radius = parseFloat(entry['pl_rade']);

		if (self.timeFilterOn && !(self.currentRange[0] <= year && year <= self.currentRange[1]))
			return false;

		if (self.radiusFilterOn && !(self.currentRadiusRange[0] <= radius && radius <= self.currentRadiusRange[1]))
			return false;

		return true;
	});

	this.selectedData = this.selectedDataAllMethods.filter(function(entry) {
		return self.discoveryMethodFilter[entry['pl_discmethod']];
	});

    $('#amount').text(this.selectedData.length + ' planets selected');
}

DataHandler.prototype.toggleHighlightedPlanet = function(selectedPlanet) {
	if(this.highlightedPlanet == null || selectedPlanet == null || this.highlightedPlanet['rowid'] != selectedPlanet['rowid']) {
		this.highlightedPlanet = selectedPlanet;
	}
	else {
		this.highlightedPlanet = null;
	}
	visualisationManager.updateAll();
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
    $('#radius-slider-wrapper').hide();

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
        $('#time-slider-wrapper').toggle();
		self.filterData();
		visualisationManager.updateAll();
	});
	$('#radius-checkbox').on('change', function() {
		self.radiusFilterOn = this.checked;
        $('#radius-slider-wrapper').toggle();
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

/*
 * Column description object generated by columnmapper.py
 */
dataHandler.COLUMN_DESCRIPTIONS = {
    "dec": "Dec",
    "dec_str": "Dec",
    "hd_name": "HD Name",
    "hip_name": "HIP Name",
    "pl_astflag": "Planet Astrometry Flag",
    "pl_bmasse": "Planet Mass or M*sin(i)",
    "pl_bmasseerr1": "Planet Mass or M*sin(i) Upper Unc.",
    "pl_bmasseerr2": "Planet Mass or M*sin(i) Lower Unc.",
    "pl_bmasselim": "Planet Mass or M*sin(i) Limit Flag",
    "pl_bmassj": "Planet Mass or M*sin(i)",
    "pl_bmassjerr1": "Planet Mass or M*sin(i)Upper Unc.",
    "pl_bmassjerr2": "Planet Mass or M*sin(i)Lower Unc.",
    "pl_bmassjlim": "Planet Mass or M*sin(i)Limit Flag",
    "pl_bmassprov": "Planet Mass or M*sin(i) Provenance",
    "pl_cbflag": "Planet Circumbinary Flag",
    "pl_def_reflink": "Default Reference",
    "pl_dens": "Planet Density",
    "pl_denserr1": "Planet Density Upper Unc.",
    "pl_denserr2": "Planet Density Lower Unc.",
    "pl_denslim": "Planet Density Limit Flag",
    "pl_disc": "Year of Discovery",
    "pl_disc_reflink": "Discovery Reference",
    "pl_discmethod": "Discovery Method",
    "pl_edelink": "Link to Exoplanet Data Explorer",
    "pl_eqt": "Equilibrium Temperature",
    "pl_eqterr1": "Equilibrium Temperature Upper Unc.",
    "pl_eqterr2": "Equilibrium Temperature Lower Unc.",
    "pl_eqtlim": "Equilibrium Temperature Limit Flag",
    "pl_facility": "Discovery Facility",
    "pl_hostname": "Host Name",
    "pl_imgflag": "Planet Imaging Flag",
    "pl_imppar": "Impact Parameter",
    "pl_impparerr1": "Impact Parameter Upper Unc.",
    "pl_impparerr2": "Impact Parameter Lower Unc.",
    "pl_impparlim": "Impact Parameter Limit Flag",
    "pl_insol": "Insolation Flux",
    "pl_insolerr1": "Insolation Flux Upper Unc.",
    "pl_insolerr2": "Insolation Flux Lower Unc.",
    "pl_insollim": "Insolation Flux Limit Flag",
    "pl_instrument": "Discovery Instrument",
    "pl_k2flag": "K2 Mission Flag",
    "pl_kepflag": "Kepler Field Flag",
    "pl_letter": "Planet Letter",
    "pl_locale": "Discovery Locale",
    "pl_masse": "Planet Mass",
    "pl_masseerr1": "Planet Mass Upper Unc.",
    "pl_masseerr2": "Planet Mass Lower Unc.",
    "pl_masselim": "Planet Mass Limit Flag",
    "pl_massj": "Planet Mass",
    "pl_massjerr1": "Planet Mass Upper Unc.",
    "pl_massjerr2": "Planet Mass Lower Unc.",
    "pl_massjlim": "Planet Mass Limit Flag",
    "pl_mnum": "Number of Moons in System",
    "pl_msinie": "Planet M*sin(i)",
    "pl_msinieerr1": "Planet M*sin(i) Upper Unc.",
    "pl_msinieerr2": "Planet M*sin(i) Lower Unc.",
    "pl_msinielim": "Planet M*sin(i) Limit Flag",
    "pl_msinij": "Planet M*sin(i)",
    "pl_msinijerr1": "Planet M*sin(i) Upper Unc.",
    "pl_msinijerr2": "Planet M*sin(i) Lower Unc.",
    "pl_msinijlim": "Planet M*sin(i) Limit Flag",
    "pl_name": "Planet Name",
    "pl_nnotes": "Number of Notes",
    "pl_occdep": "Occultation Depth",
    "pl_occdeperr1": "Occultation Depth Upper Unc.",
    "pl_occdeperr2": "Occultation Depth Lower Unc.",
    "pl_occdeplim": "Occultation Depth Limit Flag",
    "pl_omflag": "Planet Orbital Modulation Flag",
    "pl_orbeccen": "Eccentricity",
    "pl_orbeccenerr1": "Eccentricity Upper Unc.",
    "pl_orbeccenerr2": "Eccentricity Lower Unc.",
    "pl_orbeccenlim": "Eccentricity Limit Flag",
    "pl_orbincl": "Inclination",
    "pl_orbinclerr1": "Inclination Upper Unc.",
    "pl_orbinclerr2": "Inclination Lower Unc.",
    "pl_orbincllim": "Inclination Limit Flag",
    "pl_orblper": "Long. of Periastron",
    "pl_orblpererr1": "Long. of Periastron Upper Unc.",
    "pl_orblpererr2": "Long. of Periastron Lower Unc.",
    "pl_orblperlim": "Long. of Periastron Limit Flag",
    "pl_orbper": "Orbital Period",
    "pl_orbpererr1": "Orbital Period Upper Unc.",
    "pl_orbpererr2": "Orbital Period Lower Unc.",
    "pl_orbperlim": "Orbital Period Limit Flag",
    "pl_orbsmax": "Orbit Semi-Major Axis",
    "pl_orbsmaxerr1": "Orbit Semi-Major Axis Upper Unc.",
    "pl_orbsmaxerr2": "Orbit Semi-Major Axis Lower Unc.",
    "pl_orbsmaxlim": "Orbit Semi-Major Axis Limit Flag",
    "pl_orbtper": "Time of Periastron",
    "pl_orbtpererr1": "Time of Periastron Upper Unc.",
    "pl_orbtpererr2": "Time of Periastron Lower Unc.",
    "pl_orbtperlim": "Time of Periastron Limit Flag",
    "pl_pelink": "Link to Exoplanet Encyclopaedia",
    "pl_pnum": "Number of Planets in System",
    "pl_publ_date": "Publication Date",
    "pl_rade": "Planet Radius",
    "pl_radeerr1": "Planet Radius Upper Unc.",
    "pl_radeerr2": "Planet Radius Lower Unc.",
    "pl_radelim": "Planet Radius Limit Flag",
    "pl_radj": "Planet Radius",
    "pl_radjerr1": "Planet Radius Upper Unc.",
    "pl_radjerr2": "Planet Radius Lower Unc.",
    "pl_radjlim": "Planet Radius Limit Flag",
    "pl_rads": "Planet Radius",
    "pl_radserr1": "Planet Radius Upper Unc.",
    "pl_radserr2": "Planet Radius Lower Unc.",
    "pl_radslim": "Planet Radius Limit Flag",
    "pl_ratdor": "Ratio of Distance to Stellar Radius",
    "pl_ratdorerr1": "Ratio of Distance to Stellar Radius Upper Unc.",
    "pl_ratdorerr2": "Ratio of Distance to Stellar Radius Lower Unc.",
    "pl_ratdorlim": "Ratio of Distance to Stellar Radius Limit Flag",
    "pl_ratror": "Ratio of Planet to Stellar Radius",
    "pl_ratrorerr1": "Ratio of Planet to Stellar Radius Upper Unc.",
    "pl_ratrorerr2": "Ratio of Planet to Stellar Radius Lower Unc.",
    "pl_ratrorlim": "Ratio of Planet to Stellar Radius Limit Flag",
    "pl_rvamp": "Radial Velocity Amplitude",
    "pl_rvamperr1": "Radial Velocity Amplitude Upper Unc.",
    "pl_rvamperr2": "Radial Velocity Amplitude Lower Unc.",
    "pl_rvamplim": "Radial Velocity Amplitude Limit Flag",
    "pl_rvflag": "Planet RV Flag",
    "pl_st_npar": "Number of Stellar and Planet Parameters",
    "pl_st_nref": "Number of Stellar and Planet References",
    "pl_status": "Status",
    "pl_telescope": "Discovery Telescope",
    "pl_trandep": "Transit Depth",
    "pl_trandeperr1": "Transit Depth Upper Unc.",
    "pl_trandeperr2": "Transit Depth Lower Unc.",
    "pl_trandeplim": "Transit Depth Limit Flag",
    "pl_trandur": "Transit Duration",
    "pl_trandurerr1": "Transit Duration Upper Unc.",
    "pl_trandurerr2": "Transit Duration Lower Unc.",
    "pl_trandurlim": "Transit Duration Limit Flag",
    "pl_tranflag": "Planet Transit Flag",
    "pl_tranmid": "Transit Midpoint",
    "pl_tranmiderr1": "Transit Midpoint Upper Unc.",
    "pl_tranmiderr2": "Transit Midpoint Lower Unc.",
    "pl_tranmidlim": "Transit Midpoint Limit Flag",
    "pl_tsystemref": "Time System Reference",
    "pl_ttvflag": "TTV Flag",
    "ra": "RA",
    "ra_str": "RA",
    "rowupdate": "Date of Last Update",
    "st_actlx": "X-ray Activity log(L<sub>x</sub>)",
    "st_actlxblend": "X-ray Activity log(L<sub>x</sub>) Blend Flag",
    "st_actlxerr": "X-ray Activity log(L<sub>x</sub>) Unc.",
    "st_actlxlim": "X-ray Activity log(L<sub>x</sub>) Limit Flag",
    "st_actr": "Stellar Activity log(R'HK)",
    "st_actrblend": "Stellar Activity log(R'HK) Blend Flag",
    "st_actrerr": "Stellar Activity log(R'HK) Unc.",
    "st_actrlim": "Stellar Activity log(R'HK) Limit Flag",
    "st_acts": "Stellar Activity S-index",
    "st_actsblend": "Stellar Activity S-index Blend Flag",
    "st_actserr": "Stellar Activity S-index Unc.",
    "st_actslim": "Stellar Activity S-index Limit Flag",
    "st_age": "Stellar Age",
    "st_ageerr1": "Stellar Age Upper Unc.",
    "st_ageerr2": "Stellar Age Lower Unc.",
    "st_agelim": "Stellar Age Limit Flag",
    "st_bj": "B-band (Johnson)",
    "st_bjblend": "B-band (Johnson) Blend Flag",
    "st_bjerr": "B-band (Johnson) Unc.",
    "st_bjlim": "B-band (Johnson) Limit Flag",
    "st_bmvj": "B-V (Johnson)",
    "st_bmvjblend": "B-V (Johnson) Blend Flag",
    "st_bmvjerr": "B-V (Johnson) Unc.",
    "st_bmvjlim": "B-V (Johnson) Limit Flag",
    "st_bmy": "b-y (Stromgren)",
    "st_bmyblend": "b-y (Stromgren) Blend Flag",
    "st_bmyerr": "b-y (Stromgren) Unc.",
    "st_bmylim": "b-y (Stromgren) Limit Flag",
    "st_c1": "c1 (Stromgren)",
    "st_c1blend": "c1 (Stromgren) Blend Flag",
    "st_c1err": "c1 (Stromgren) Unc.",
    "st_c1lim": "c1 (Stromgren) Limit Flag",
    "st_colorn": "Number of Color Measurements",
    "st_dens": "Stellar Density",
    "st_denserr1": "Stellar Density Upper Unc.",
    "st_denserr2": "Stellar Density Lower Unc.",
    "st_denslim": "Stellar Density Limit Flag",
    "st_dist": "Distance",
    "st_disterr1": "Distance Upper Unc.",
    "st_disterr2": "Distance Lower Unc.",
    "st_distlim": "Distance Limit Flag",
    "st_elat": "Ecliptic Latitude",
    "st_elon": "Ecliptic Longitude",
    "st_glat": "Galactic Latitude",
    "st_glon": "Galactic Longitude",
    "st_h": "H-band (2MASS)",
    "st_hblend": "H-band (2MASS) Blend Flag",
    "st_herr": "H-band (2MASS) Unc.",
    "st_hlim": "H-band (2MASS) Limit Flag",
    "st_hmk2": "H-Ks (2MASS)",
    "st_hmk2blend": "H-Ks (2MASS) Blend Flag",
    "st_hmk2err": "H-Ks (2MASS) Unc.",
    "st_hmk2lim": "H-Ks (2MASS) Limit Flag",
    "st_ic": "I-band (Cousins)",
    "st_icblend": "I-band (Cousins) Blend Flag",
    "st_icerr": "I-band (Cousins) Unc.",
    "st_iclim": "I-band (Cousins) Limit Flag",
    "st_irac1": "IRAC 3.6um",
    "st_irac1blend": "IRAC 3.6um Blend Flag",
    "st_irac1err": "IRAC 3.6um Unc.",
    "st_irac1lim": "IRAC 3.6um Limit Flag",
    "st_irac2": "IRAC 4.5um",
    "st_irac2blend": "IRAC 4.5um Blend Flag",
    "st_irac2err": "IRAC 4.5um Unc.",
    "st_irac2lim": "IRAC 4.5um Limit Flag",
    "st_irac3": "IRAC 5.8um",
    "st_irac3blend": "IRAC 5.8um Blend Flag",
    "st_irac3err": "IRAC 5.8um Unc.",
    "st_irac3lim": "IRAC 5.8um Limit Flag",
    "st_irac4": "IRAC 8.0um",
    "st_irac4blend": "IRAC 8.0um Blend Flag",
    "st_irac4err": "IRAC 8.0um Unc.",
    "st_irac4lim": "IRAC 8.0um Limit Flag",
    "st_iras1": "IRAS 12um Flux",
    "st_iras1blend": "IRAS 12um Flux Blend Flag",
    "st_iras1err": "IRAS 12um Flux Unc.",
    "st_iras1lim": "IRAS 12um Flux Limit Flag",
    "st_iras2": "IRAS 25um Flux",
    "st_iras2blend": "IRAS 25um Flux Blend Flag",
    "st_iras2err": "IRAS 25um Flux Unc.",
    "st_iras2lim": "IRAS 25um Flux Limit Flag",
    "st_iras3": "IRAS 60um Flux",
    "st_iras3blend": "IRAS 60um Flux Blend Flag",
    "st_iras3err": "IRAS 60um Flux Unc.",
    "st_iras3lim": "IRAS 60um Flux Limit Flag",
    "st_iras4": "IRAS 100um Flux",
    "st_iras4blend": "IRAS 100um Flux Blend Flag",
    "st_iras4err": "IRAS 100um Flux Unc.",
    "st_iras4lim": "IRAS 100um Flux Limit Flag",
    "st_j": "J-band (2MASS)",
    "st_jblend": "J-band (2MASS) Blend Flag",
    "st_jerr": "J-band (2MASS) Unc.",
    "st_jlim": "J-band (2MASS) Limit Flag",
    "st_jmh2": "J-H (2MASS)",
    "st_jmh2blend": "J-H (2MASS) Blend Flag",
    "st_jmh2err": "J-H (2MASS) Unc.",
    "st_jmh2lim": "J-H (2MASS) Limit Flag",
    "st_jmk2": "J-Ks (2MASS)",
    "st_jmk2blend": "J-Ks (2MASS) Blend Flag",
    "st_jmk2err": "J-Ks (2MASS) Unc.",
    "st_jmk2lim": "J-Ks (2MASS) Limit Flag",
    "st_k": "Ks-band (2MASS)",
    "st_kblend": "Ks-band (2MASS) Blend Flag",
    "st_kerr": "Ks-band (2MASS) Unc.",
    "st_klim": "Ks-band (2MASS) Limit Flag",
    "st_logg": "Stellar Surface Gravity",
    "st_loggblend": "Stellar Surface Gravity Blend Flag",
    "st_loggerr1": "Stellar Surface Gravity Upper Unc.",
    "st_loggerr2": "Stellar Surface Gravity Lower Unc.",
    "st_logglim": "Stellar Surface Gravity Limit Flag",
    "st_lum": "Stellar Luminosity",
    "st_lumblend": "Stellar Luminosity Blend Flag",
    "st_lumerr1": "Stellar Luminosity Upper Unc.",
    "st_lumerr2": "Stellar Luminosity Lower Unc.",
    "st_lumlim": "Stellar Luminosity Limit Flag",
    "st_m1": "m1 (Stromgren)",
    "st_m1blend": "m1 (Stromgren) Blend Flag",
    "st_m1err": "m1 (Stromgren) Unc.",
    "st_m1lim": "m1 (Stromgren) Limit Flag",
    "st_mass": "Stellar Mass",
    "st_massblend": "Stellar Mass Blend Flag",
    "st_masserr1": "Stellar Mass Upper Unc.",
    "st_masserr2": "Stellar Mass Lower Unc.",
    "st_masslim": "Stellar Mass Limit Flag",
    "st_metfe": "Stellar Metallicity",
    "st_metfeblend": "Stellar Metallicity Blend Flag",
    "st_metfeerr1": "Stellar Metallicity Upper Unc.",
    "st_metfeerr2": "Stellar Metallicity Lower Unc.",
    "st_metfelim": "Stellar Metallicity Limit Flag",
    "st_metratio": "Metallicity Ratio",
    "st_mips1": "MIPS 24um",
    "st_mips1blend": "MIPS 24um Blend Flag",
    "st_mips1err": "MIPS 24um Unc.",
    "st_mips1lim": "MIPS 24um Limit Flag",
    "st_mips2": "MIPS 70um",
    "st_mips2blend": "MIPS 70um Blend Flag",
    "st_mips2err": "MIPS 70um Unc.",
    "st_mips2lim": "MIPS 70um Limit Flag",
    "st_mips3": "MIPS 160um",
    "st_mips3blend": "MIPS 160um Blend Flag",
    "st_mips3err": "MIPS 160um Unc.",
    "st_mips3lim": "MIPS 160um Limit Flag",
    "st_naxa": "Number of Amateur Light Curves",
    "st_nglc": "Number of General Light Curves",
    "st_nimg": "Number of Images",
    "st_nplc": "Number of Planet Transit Light Curves",
    "st_nrvc": "Number of Radial Velocity Time Series",
    "st_nspec": "Number of Spectra",
    "st_nts": "Number of Time Series",
    "st_optband": "Optical Magnitude Band",
    "st_optmag": "Optical Magnitude",
    "st_optmagblend": "Optical Magnitude Blend Flag",
    "st_optmagerr": "Optical Magnitude Unc.",
    "st_optmaglim": "Optical Magnitude Limit Flag",
    "st_photn": "Number of Photometry Measurements",
    "st_plx": "Parallax",
    "st_plxblend": "Parallax Blend Flag",
    "st_plxerr1": "Parallax Upper Unc.",
    "st_plxerr2": "Parallax Lower Unc.",
    "st_plxlim": "Parallax Limit Flag",
    "st_pm": "Total Proper Motion",
    "st_pmblend": "Total Proper Motion Blend Flag",
    "st_pmdec": "Proper Motion (Dec)",
    "st_pmdecerr": "Proper Motion (Dec) Unc.",
    "st_pmdeclim": "Proper Motion (Dec) Limit Flag",
    "st_pmerr": "Total Proper Motion Unc.",
    "st_pmlim": "Total Proper Motion Limit Flag",
    "st_pmra": "Proper Motion (RA)",
    "st_pmraerr": "Proper Motion (RA) Unc.",
    "st_pmralim": "Proper Motion (RA) Limit Flag",
    "st_rad": "Stellar Radius",
    "st_radblend": "Stellar Radius Blend Flag",
    "st_raderr1": "Stellar Radius Upper Unc.",
    "st_raderr2": "Stellar Radius Lower Unc.",
    "st_radlim": "Stellar Radius Limit Flag",
    "st_radv": "Radial Velocity",
    "st_radvblend": "Radial Velocity Blend Flag",
    "st_radverr1": "Radial Velocity Upper Unc.",
    "st_radverr2": "Radial Velocity Lower Unc.",
    "st_radvlim": "Radial Velocity Limit Flag",
    "st_rah": "RA",
    "st_rc": "R-band (Cousins)",
    "st_rcblend": "R-band (Cousins) Blend Flag",
    "st_rcerr": "R-band (Cousins) Unc.",
    "st_rclim": "R-band (Cousins) Limit Flag",
    "st_sp": "Spectral Type",
    "st_spblend": "Spectral Type Blend Flag",
    "st_sperr": "Spectral Type Unc.",
    "st_splim": "Spectral Type Limit Flag",
    "st_spstr": "Spectral Type",
    "st_teff": "Effective Temperature",
    "st_teffblend": "Effective Temperature Blend Flag",
    "st_tefferr1": "Effective Temperature Upper Unc.",
    "st_tefferr2": "Effective Temperature Lower Unc.",
    "st_tefflim": "Effective Temperature Limit Flag",
    "st_uj": "U-band (Johnson)",
    "st_ujblend": "U-band (Johnson) Blend Flag",
    "st_ujerr": "U-band (Johnson) Unc.",
    "st_ujlim": "U-band (Johnson) Limit Flag",
    "st_umbj": "U-B (Johnson)",
    "st_umbjblend": "U-B (Johnson) Blend Flag",
    "st_umbjerr": "U-B (Johnson) Unc.",
    "st_umbjlim": "U-B (Johnson) Limit Flag",
    "st_vj": "V-band (Johnson)",
    "st_vjblend": "V-band (Johnson) Blend Flag",
    "st_vjerr": "V-band (Johnson) Unc.",
    "st_vjlim": "V-band (Johnson) Limit Flag",
    "st_vjmic": "V-I (Johnson-Cousins)",
    "st_vjmicblend": "V-I (Johnson-Cousins) Blend Flag",
    "st_vjmicerr": "V-I (Johnson-Cousins) Unc.",
    "st_vjmiclim": "V-I (Johnson-Cousins) Limit Flag",
    "st_vjmrc": "V-R (Johnson-Cousins)",
    "st_vjmrcblend": "V-R (Johnson-Cousins) Blend Flag",
    "st_vjmrcerr": "V-R (Johnson-Cousins) Unc.",
    "st_vjmrclim": "V-R (Johnson-Cousins) Limit Flag",
    "st_vsini": "Rot. Velocity V*sin(i)",
    "st_vsiniblend": "Rot. Velocity V*sin(i) Blend Flag",
    "st_vsinierr1": "Rot. Velocity V*sin(i) Upper Unc.",
    "st_vsinierr2": "Rot. Velocity V*sin(i) Lower Unc.",
    "st_vsinilim": "Rot. Velocity V*sin(i) Limit Flag",
    "st_wise1": "WISE 3.4um",
    "st_wise1blend": "WISE 3.4um Blend Flag",
    "st_wise1err": "WISE 3.4um Unc.",
    "st_wise1lim": "WISE 3.4um Limit Flag",
    "st_wise2": "WISE 4.6um",
    "st_wise2blend": "WISE 4.6um Blend Flag",
    "st_wise2err": "WISE 4.6um Unc.",
    "st_wise2lim": "WISE 4.6um Limit Flag",
    "st_wise3": "WISE 12.um",
    "st_wise3blend": "WISE 12.um Blend Flag",
    "st_wise3err": "WISE 12.um Unc.",
    "st_wise3lim": "WISE 12.um Limit Flag",
    "st_wise4": "WISE 22.um",
    "st_wise4blend": "WISE 22.um Blend Flag",
    "st_wise4err": "WISE 22.um Unc.",
    "st_wise4lim": "WISE 22.um Limit Flag",
    "swasp_id": "SWASP Identifier"
};
