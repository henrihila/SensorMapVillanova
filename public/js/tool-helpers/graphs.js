//Global vars
var indexSite;
var sites = [];
var dygraphs = {};


// Helper functions
var helperFunctions = {
    getZone: function (number, zones) {
        var cnt = 0;
        for (var i = 0; i < zones.length; i++) {
            cnt += zones[i];
            if (number < cnt)
                return i;
        }
        return NaN;
    },
    /**
     * Returns the index of an object in an array based on an object attribute as the search key.
     * @param array: The array of objects.
     * @param attr: The object attribute and search key.
     * @param value: The value of the search key.
     * @returns {number}: The index of the object in the array.
     */
    getIndexIfObjWithAttr: function (array, attr, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][attr] === value) {
                return i;
            }
        }
        return -1;
    },
    datePeriodComparator: function (a, b) {
        if (a.s < b.s)
            return -1;
        else if (a.s > b.s)
            return 1;
        else
            return 0;
    },
    /**
     * Returns true if rangeA contains part of rangeB
     * @param rangeA
     * @param rangeB
     * @returns {boolean}
     */
    datePeriodContainsPartially: function (rangeA, rangeB) {
        return rangeB.s >= rangeA.s && rangeB.s <= rangeA.e ||
            rangeB.e <= rangeA.e && rangeB.e >= rangeA.s;
    },
    /**
     * Returns true if rangeA fully contains rangeB
     * @param rangeA
     * @param rangeB
     * @returns {boolean}
     */
    datePeriodContains: function (rangeA, rangeB) {
        // console.log(rangeA, rangeB);
        return rangeB.s >= rangeA.s && rangeB.e <= rangeA.e;
    },
    /*
     * Returns the parts of rangeB not contained in rangeA
     */
    // getExcludedDatePeriods: function (rangeA, rangeB) {
    //     var excludedDatePeriods = [];
    //     if (!helperFunctions.datePeriodContains(rangeA, rangeB)) {
    //         if (rangeA[0] > rangeB[0])
    //             excludedDatePeriods.push([rangeB[0], rangeA[0]]);
    //         if (rangeA[1] < rangeB[1])
    //             excludedDatePeriods.push([rangeA[1], rangeB[1]]);
    //     }
    //     return excludedDatePeriods;
    // },
    toArrayOfArrays: function (arrayOfObjects) {
        return $.map(arrayOfObjects, function (value, index) {
            return [value];
        });
    },
    /**
     * Returns the currently selected site on the map.
     * @returns {*} the selected site or {null} if no site is selected.
     */
    getIndexSite: function () {
        for (s in sites) {
            if (sites[s]._id === indexSite)
                return sites[s];
        }
        return null;
    },
    /**
     * Runs the input function. Useful in callback functions in async tasks.
     * @param fn
     */
    call: function (fn) {
        fn();
    },
    /**
     * Concatenates request url and params. Used in ajax requests.
     * @param url
     * @param requestParams
     * @returns {*}
     */
    concatenateUrlAndParams: function (url, requestParams) {
        if (!jQuery.isEmptyObject(requestParams)) {
            var params = "";
            for (p in requestParams) {
                params += p + "=" + requestParams[p] + "&"
            }
            if (url.slice(-1) === "/") {
                url = url.slice(0, -1);
            }
            url += "?" + params.slice(0, -1);
        }
        return url;
    }
};

/**
 *
 * @constructor
 */
function Sensor() {
    this._id = "";
    this.name = "";
    this.description = "";
    this.labels = [];
    this.data = [];
    this.requestedDatePeriodsHistory = []; //array of objects
}

Sensor.prototype.getData = function () {
    return this.data;
};

Sensor.prototype.setData = function (data) {
    this.data = data;
};

//TODO: perform double concat for double ranges to avoid sorting
Sensor.prototype.addData = function (newData) {
    this.data = this.data.concat(newData);
    // this.data = this.data.sort(function (a, b) {
    //     return a.timeValue.localeCompare(b.timeValue);
    // });
};

Sensor.prototype.containsLoadedPeriod = function (period) {
    for (var i = 0; i < this.requestedDatePeriodsHistory.length; i++) {
        if (helperFunctions.datePeriodContains(this.requestedDatePeriodsHistory[i], period))
            return true;
    }
    return false;
};

//TODO: heavily test this. It works for now ...
//TODO: This functionality might fit better to dataprovider class
Sensor.prototype.addRequestedDatePeriodToHistory = function (period) {
    if (!this.requestedDatePeriodsHistory.length) {
        this.requestedDatePeriodsHistory.push(period);
    }
    else {
        var toBeMerged = [];
        for (var i = 0; i < this.requestedDatePeriodsHistory.length; i++) {
            if (helperFunctions.datePeriodContainsPartially(period, this.requestedDatePeriodsHistory[i])) {
                toBeMerged.push(this.requestedDatePeriodsHistory[i]);
            }
        }

        // console.log("--- ToBeMerged ---");
        // console.log(toBeMerged);

        if (toBeMerged.length) {
            var s = toBeMerged[0].s > period.s ? period.s : toBeMerged[0].e;
            var e = toBeMerged[toBeMerged.length - 1].e > period.e ? toBeMerged[toBeMerged.length - 1].e : period.e;
            var mergedPeriod = {'s': s, 'e': e};

            // console.log("--- Merged period ---" + mergedPeriod);

            // Merge included date periods
            var sIndx = helperFunctions.getIndexIfObjWithAttr(this.requestedDatePeriodsHistory, 's', toBeMerged[0].s);
            var eIndx = helperFunctions.getIndexIfObjWithAttr(this.requestedDatePeriodsHistory, 's', toBeMerged[toBeMerged.length - 1].s);
            this.requestedDatePeriodsHistory.splice(sIndx, eIndx - sIndx + 1, mergedPeriod);
        } else {
            this.requestedDatePeriodsHistory.push(period);
        }
    }
    this.requestedDatePeriodsHistory.sort(helperFunctions.datePeriodComparator);
};

/**
 * Scans the request history and returns the date periods not included by the union of the new requested period and
 * the previous ones stored in the requests history.
 * @param period. The requested period to fetch data.
 * @returns {Array}. The intermediate excluded date periods.
 */
Sensor.prototype.getExcludedDatePeriods = function (period) {
    var toBeMerged = [];
    var excludedPeriods = [];

    for (var i = 0; i < this.requestedDatePeriodsHistory.length; i++) {
        if (helperFunctions.datePeriodContainsPartially(period, this.requestedDatePeriodsHistory[i])) {
            toBeMerged.push(this.requestedDatePeriodsHistory[i]);
        }
    }

    if (toBeMerged.length) {
        for (var i = 0; i < toBeMerged.length - 1; i++) {
            excludedPeriods.push({'s': toBeMerged[i].e, 'e': toBeMerged[i + 1].s});
        }

        var leftExcluded = toBeMerged[0].s > period.s ? {'s': period.s, 'e': toBeMerged[0].s} : 0;
        var rightExcluded = toBeMerged[toBeMerged.length - 1].e < period.e ?
        {'s': toBeMerged[toBeMerged.length - 1].e, 'e': period.e} : 0;

        if (leftExcluded)
            excludedPeriods.splice(0, 0, leftExcluded);
        if (rightExcluded)
            excludedPeriods.splice(excludedPeriods.length - 1, 0, rightExcluded);
    }
    return excludedPeriods;
};

//TODO: test if null causes problems in date filtering.. so far it works
Sensor.prototype.getDateRange = function () {
    var from = new Date(this.data[this.data.length - 1].timeValue);
    var to = new Date(this.data[0].timeValue);
    from.setHours(0);
    from.setMinutes(0);
    from.setSeconds(0);
    from.setMilliseconds(0);
    to.setDate(to.getDate() + 1);
    to.setHours(0);
    to.setMinutes(0);
    to.setSeconds(0);
    to.setMilliseconds(0);
    return this.data.length ? [from.toISOString(), to.toISOString()] : null;
};


/**
 * Site Class
 * @constructor
 */
function Site() {
    this._id = "";
    this.name = "";
    this.overview = "";
    this.description = "";
    this.sensors = [];
    this.views = {"site-about": "", "site-data-viewer": "", "site-more": ""};
}

Site.prototype.addSensor = function (sensorID) {
    this.sensors.push(parseInt(sensorID));
};

Site.prototype.getSensorById = function (sensorId) {
    return $.grep(this.sensors, function (e) {
        return e._id == sensorId;
    })[0];
};

/**
 * Returns an array with all the sensors that match the requested ids
 * @param sensorIds
 * @returns {Array}
 */
Site.prototype.getSensorsById = function (sensorIds) {
    var _this = this;
    var sensors = [];
    sensorIds.forEach(function (sensorId) {
        sensors.push(_this.getSensorById(sensorId));
    });
    return sensors;
};

/**
 * Initializes html views of the site.
 * @param view: The div id to place the site view.
 */
Site.prototype.initView = function (view) {
    if (view === "site-about") {
        var html = this.description;

        this.views["site-about"] = html;
        this.appendView("site-about");

    }
};

/**
 * Appends the site view in the page html.
 * @param view: The site view id.
 */
Site.prototype.appendView = function (view) {
    
    // var sensorsCheckList = "";
    //
    // sensors.forEach(function (s) {
    //    sensorsCheckList += '<li><input type="checkbox" id="'+ s._id +'" name="NAME" value="VALUE"><label for="'+ s._id +'">s._id</label></li>';
    // });
    //
    // var test = "\n\n\n\n\n<div class=\"row\">\n\t<div class=\"panel-group\" id=\"data-viewer-filters\">\n\t\t<div class=\"panel panel-default\">\n\t\t\t<div class=\"panel-heading\">\n\t\t\t\t<p class=\"panel-title\">\n\t\t\t\t\t<a id=\"data-selector\" data-toggle=\"collapse\" data-parent=\"#data-viewer-filters\" href=\"#data-viewer-filters-col-1\">Data Selector</a>\n\t\t\t\t</p>\n\t\t\t</div>\n\t\t\t<div id=\"data-viewer-filters-col-1\" class=\"panel-collapse collapse in\">\n\t\t\t\t<div class=\"panel-body\">\n\t\t\t\t\t\n\t\t\t\t\t<div class=\"row\">\n\t\t\t\t\t\t<div class=\"col-xs-12\">\n\t\t\t\t\t\t\t<div class=\"btn-group\">\n\t\t\t\t\t\t\t\t<button class=\"btn btn-primary\" data-label-placement>Checked option</button>\n\t\t\t\t\t\t\t\t<button data-toggle=\"dropdown\" class=\"btn btn-primary dropdown-toggle\"><span class=\"caret\"></span></button>\n\t\t\t\t\t\t\t\t<ul class=\"dropdown-menu\">\n\t\t\t\t\t\t\t\t\t<!-- loop sensors -->\n\t\t\t\t\t\t\t\t\t<li><input type=\"checkbox\" id=\"ID\" name=\"NAME\" value=\"VALUE\"><label for=\"ID\">Label</label></li>\n\t\t\t\t\t\t\t\t\t<!-- Other items -->\n\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t\t<div class=\"panel panel-default\">\n\t\t\t<div class=\"panel-heading\">\n\t\t\t\t<p class=\"panel-title\">\n\t\t\t\t\t<a class=\"collapsed\" data-toggle=\"collapse\" data-parent=\"#data-viewer-filters\" href=\"#data-viewer-filters-col-2\">Data Filters</a>\n\t\t\t\t</p>\n\t\t\t</div>\n\t\t\t<div id=\"data-viewer-filters-col-2\" class=\"panel-collapse collapse\">\n\n\t\t\t\t<div class=\"panel-body\">\n\t\t\t\t\t<div class=\"row\">\n\t\t\t\t\t\t<div class=\"col-xs-12 col-sm-4 col-md-4 text-center\">\n\t\t\t\t\t\t\t<div><h6>View Mode</h6></div>\n\t\t\t\t\t\t\t<div class=\"btn-group btn-group-sm\">\n\t\t\t\t\t\t\t\t<button data-toggle=\"dropdown\" class=\"btn btn-default dropdown-toggle\">Separated<span class=\"caret\"></span></button>\n\t\t\t\t\t\t\t\t<ul class=\"dropdown-menu\">\n\t\t\t\t\t\t\t\t\t<li><input type=\"radio\" id=\"separated\" name=\"view-mode\" value=\"separated\" checked><label for=\"separated\">Separated</label></li>\n\t\t\t\t\t\t\t\t\t<li><input type=\"radio\" id=\"combined\" name=\"view-mode\" value=\"combined\"><label for=\"combined\">Combined</label></li>\n\t\t\t\t\t\t\t\t\t<li><input type=\"radio\" id=\"synchronized\" name=\"view-mode\" value=\"synchronized\"><label for=\"synchronized\">Synchronized</label></li>\n\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"col-xs-12 col-sm-3 col-md-3 text-center\">\n\t\t\t\t\t\t\t<div><h6>Average</h6></div>\n\t\t\t\t\t\t\t<div class=\"btn-group btn-group-sm text-center\">\n\t\t\t\t\t\t\t\t<input type=\"checkbox\" name=\"average-checkbox\" data-size=\"small\">\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"col-xs-12 col-sm-5 col-md-5 text-center\">\n\t\t\t\t\t\t\t<div><h6>Date Range</h6></div>\n\t\t\t\t\t\t\t<div class=\"btn-group btn-group-sm text-center\">\n\t\t\t\t\t\t\t\t<div class=\"input-daterange input-group\" id=\"datepicker\">\n\t\t\t\t\t\t\t\t\t<input type=\"text\" class=\"input-sm form-control\" data-size=\"small\" name=\"start\" />\n\t\t\t\t\t\t\t\t\t<span class=\"input-group-addon\">to</span>\n\t\t\t\t\t\t\t\t\t<input type=\"text\" class=\"input-sm form-control\" data-size=\"small\" name=\"end\" />\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n</div>\n<div class=\"text-center\">\n\t<button type=\"button\"\n\t\t\t\t\tclass=\"btn btn-primary btn-sm graphs-plot-button\" onclick=\"generateMixedGraphs_()\">\n\t\t<span class=\"glyphicon glyphicon-triangle-right\"></span> Plot\n\t</button>\n</div>\n<hr>\n<div id=\"plot-area\"></div>";
    
    
    // Dashboard.aboutSection.set(this.name, this.views[view]);
    // Dashboard.aboutSection.set(this.name, test);
    // Dashboard.dataViewerSection.set(DASHBOARD_DATA_VIEWER_SECTION);
};


/**
 * DygraphPlotter Class
 * @constructor
 */
function DygraphPlotter() {
    this.dataProvider = new DygraphDataProvider();
    this.hasSeparateLegendDiv = true;
    this.wrapperElement = "";
    this.dygraphWrapper = "";
    this.divElement = "";
    this.plotHTML = "";
    this.toolbar = "<div class=\"row\">\n    <div class=\"dygraph-toolbar col-xs-10 text-center\">\n        <div class=\"btn-group\" role=\"group\" aria-label=\"...\">\n            <button name=\"hour\" type=\"button\" class=\"btn btn-default btn-responsive\">Hour</button>\n            <button name=\"day\" type=\"button\" class=\"btn btn-default btn-responsive\">Day</button>\n            <button name=\"week\" type=\"button\" class=\"btn btn-default btn-responsive\">Week</button>\n            <button name=\"month\" type=\"button\" class=\"btn btn-default btn-responsive\">Month</button>\n            <button name=\"full\" type=\"button\" class=\"btn btn-default btn-responsive\">Reset</button>\n        </div>\n        <div class=\"btn-group\" role=\"group\" aria-label=\"...\">\n            <button name=\"left\" type=\"button\" class=\"btn btn-default btn-responsive\">\n                <span class=\"glyphicon glyphicon-circle-arrow-left\" aria-hidden=\"true\"></span></button>\n            <button name=\"right\" type=\"button\" class=\"btn btn-default btn-responsive\">\n                <span class=\"glyphicon glyphicon-circle-arrow-right\" aria-hidden=\"true\"></span>\n            </button>\n        </div>\n    </div>\n</div>";
    this.hasVisibletoolbar = true;
    this.hasVisibleSpinner = true;
    this.plotParams = {
        // "labels" : ["Time","a","b","c","d","e","f","g","h","i","j","k","l"],
        "connectSeparatedPoints": true,
        "rollPeriod": 15,
        "showLabelsOnHighlight": true,
        "highlightSeriesOpts": {
//		strokeBorderWidth: 1.2,
//		"strokeWidth": 1.4,
//		"highlightCircleSize": 5
        },
        "labelsDivStyles": {
            'text-align': 'right',
            'background': 'none'
        },
        axes: {
            y2: {"valueRange": [0, 30]}
        },
        "drawPoints": false, //Making this true really affects the performance
        "title": "Title",
        "showRoller": false,
        "showRangeSelector": true,
        "rangeSelectorHeight": 20,
        "fillGraph": false,
        "legend": 'always',
        "ylabel": '',
        "labelsDivWidth": 150,
        "labelsSeparateLines": true,
        "labelsUTC": true,
        "labelsDiv": ""
//	"valueRange": [],
    };
}

DygraphPlotter.prototype.setWrapperElement = function (wrapperElement) {
    this.wrapperElement = wrapperElement;
};

DygraphPlotter.prototype.updatePlotHTML = function () {
    this.plotParams.labelsDiv = this.divElement + "-labels-div";
    var graphHTML = this.hasSeparateLegendDiv ? "<div class=\"col-xs-10 text-center graph-container\">\n    <div id=\"" + this.divElement + "\" class=\"dygraph-plot\" style=\"width:100%\"></div>\n</div>\n<div id=\"" + this.plotParams.labelsDiv + "\" class=\"dygraph-legend col-xs-2 text-left\"></div>" : "<div class=\"col-xs-12 text-center graph-container\">\n    <div id=\"" + this.divElement + "\" class=\"dygraph-plot\" style=\"width:100%\"></div>\n</div>";
    if (this.hasVisibletoolbar)
        this.plotHTML = "<form id=\"" + this.dygraphWrapper + "\" class=\"text-center dygraph-plot-and-toolbar-wrapper\">\n    <div class=\"row dygraph-plot-row-wrapper\">\n        <div class=\"col-xs-12 text-center\">\n            <div class=\"row\">\n            " + graphHTML + "            </div>\n            " + this.toolbar + "\n        </div>\n    </div>\n</form>";
    else
        this.plotHTML = "<form id=\"" + this.dygraphWrapper + "\" class=\"text-center dygraph-plot-and-toolbar-wrapper\">\n    <div class=\"row dygraph-plot-row-wrapper\">\n        <div class=\"col-xs-12 text-center\">\n            <div class=\"row\">\n            " + graphHTML + "      \n            </div>\n        </div>\n    </div>\n</form>";
};

DygraphPlotter.prototype.setDivElement = function (divElement) {
    this.dygraphWrapper = "#dygraph-plot-and-toolbar-wrapper-" + divElement;
    this.divElement = divElement;
    this.updatePlotHTML();
};

DygraphPlotter.prototype.appendHTML = function () {
    $(this.dygraphWrapper).remove();
    $('#' + this.wrapperElement).append(this.plotHTML);
    adjustDygraphsPlotAreaHTMLonResize();
};

DygraphPlotter.prototype.plot = function () {
    console.log("Plotting..");
    log('Response', this.dataProvider.data);
    //TODO: Check the following: may be undifined
    dygraphs[this.divElement] = new Dygraph(document.getElementById(this.divElement), this.dataProvider.data, this.plotParams);
    dygraphs[this.divElement].resize(); //Force drawing. Resolves issues inside tabs
};

DygraphPlotter.prototype._requestData = function () {
    this.showSpinner();
    // this.graphDataProvider.loadData("Series-A", null, null, this.detailStartDateTm, this.detailEndDateTm, this.$graphCont.width());
};

DygraphPlotter.prototype.showSpinner = function () {
    if (this.hasVisibleSpinner === true) {
        if (this.spinner == null) {
            var opts = {
                lines: 15 // The number of lines to draw
                , length: 6 // The length of each line
                , width: 14 // The line thickness
                , radius: 32 // The radius of the inner circle
                , scale: 0.25 // Scales overall size of the spinner
                , corners: 0.6 // Corner roundness (0..1)
                , color: '#000' // #rgb or #rrggbb or array of colors
                , opacity: 0.4 // Opacity of the lines
                , rotate: 0 // The rotation offset
                , direction: 1 // 1: clockwise, -1: counterclockwise
                , speed: 1 // Rounds per second
                , trail: 100 // Afterglow percentage
                , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
                , zIndex: 2e9 // The z-index (defaults to 2000000000)
                , className: 'spinner' // The CSS class to assign to the spinner
                , top: '50%' // Top position relative to parent
                , left: '50%' // Left position relative to parent
                , shadow: false // Whether to render a shadow
                , hwaccel: false // Whether to use hardware acceleration
                , position: 'absolute' // Element positioning
            };
            var target = document.getElementById(this.divElement);
            this.spinner = new Spinner(opts);
            this.spinner.spin(target);
            this.spinnerIsSpinning = true;
        } else {
            if (this.spinnerIsSpinning === false) { //else already spinning
                this.spinner.spin(this.divElement);
                this.spinnerIsSpinning = true;
            }
        }
    } else if (this.spinner != null && this.hasVisibleSpinner === false) {
        this.spinner.stop();
        this.spinnerIsSpinning = false;
    }
};

DygraphPlotter.prototype.stopSpinner = function () {
    if (this.spinner != undefined)
        this.spinner.stop();
};

DygraphPlotter.prototype.loadAndPlot = function (sensorIds, period) {
    var _this = this;
    _this.appendHTML();
    _this.showSpinner();
    _this.dataProvider._onDoneFetchingData(sensorIds, period,
        [function () {
            _this.dataProvider.addDataStreams(helperFunctions.getIndexSite().getSensorsById(sensorIds));
            _this.stopSpinner();
            _this.plot();
        }]);
};


/**
 * DygraphDataProvider class
 * @constructor
 */
function DygraphDataProvider() {
    this.dataCallbacks = $.Callbacks();
    this.lastRangeReqNum = null;
    this.calculateAverages = false;
    this.averageGroups = [1];
    this.numberOfStreams = 0;
    this.data = [];
}

// DygraphDataProvider.prototype.load = function (sensorIds, dateWindow) {
//     var requestParams = {
//         "key": "z5ywCWZ4rLh3lu*3i234StqF"
//     };
//     for (sId in sensorIds) {
//         requestParams.dataStreamId = sensorIdsensorIds[sId];
//         this.makeRequest("/getDataStream/", requestParams);
//         // if (sites[indexSite].getSensor(sensorIds[sensorId]).
//     }
// };

/**
 * Generates an ajax request: If the request already exists in the requests history, it resolves the request. If
 * not, it checks if the request partially exists (contains dates for which there is already fetched data) and generates
 * one request (no dates included in the requests history) or more sub-requests (non existing dates in the history).
 * @param url: The request url without any params.
 * @param params: The request url params.
 * @returns {resolved Deferred} or {array} of ajax requests.
 */
DygraphDataProvider.prototype.makeRequest = function (url, params) {
    var indexSensor = helperFunctions.getIndexSite().getSensorById(params.dataStreamId);
    var newRequestedPeriod = {'s': params.periodFrom, 'e': params.periodTo};

    console.log('making request... ', params);

    // Requested period already exists in requests history
    if (indexSensor.data.length && indexSensor.containsLoadedPeriod(newRequestedPeriod)) {
        console.log("RESOLVED");
        return $.Deferred().resolve();
    }
    else {
        var requests = [];
        // console.log(indexSensor.getExcludedDatePeriods(newRequestedPeriod));
        var excludedPeriods = indexSensor.getExcludedDatePeriods(newRequestedPeriod);

        if (excludedPeriods.length) {
            for (var i = 0; i < excludedPeriods.length; i++) {
                params.periodFrom = excludedPeriods[i].s;
                params.periodTo = excludedPeriods[i].e;

                requests.push(new $.ajax({
                    url: helperFunctions.concatenateUrlAndParams(url, params),
                    dataType: "json",
                    success: function (response) {
                        // console.log(response.items);
                        helperFunctions.getIndexSite().getSensorById(params.dataStreamId).addData(response.items);
                    }
                }));
            }
        } else {
            requests.push(new $.ajax({
                url: helperFunctions.concatenateUrlAndParams(url, params),
                dataType: "json",
                success: function (response) {
                    console.log(response);
                    helperFunctions.getIndexSite().getSensorById(params.dataStreamId).addData(response);
                    console.log(helperFunctions.getIndexSite());
                }
            }));
        }

        indexSensor.addRequestedDatePeriodToHistory(newRequestedPeriod);
        // console.log(indexSensor.requestedDatePeriodsHistory);
        return requests;
    }
};

/**
 * Generates requests for the input parameters.
 * @param ids: The ids of the data sources.
 * @param dateWindow: The date period for the requested data.
 * @returns {Array} of requests.
 */
DygraphDataProvider.prototype.generateRequests = function (ids, dateWindow) {
    var requests = [];
    for (var id in ids) {
        // requests.push(new this.makeRequest(API.DATA_STREAM,
        //     {"dataStreamId": ids[id], "periodFrom": dateWindow.periodFrom, "periodTo": dateWindow.periodTo}));
        requests = requests.concat(this.makeRequest(API.DATA_STREAM,
            {"dataStreamId": ids[id], "periodFrom": dateWindow.periodFrom, "periodTo": dateWindow.periodTo}));
    }
    return requests;
};

/**
 * Handles async data requests.
 * @param ids: The ids of the data sources.
 * @param dateWindow: The date period for the requested data.
 * @param dataHandlingFunctions: Array of functions to be executed after all the requested data has been fetched.
 * @private
 */
DygraphDataProvider.prototype._onDoneFetchingData = function (ids, dateWindow, dataHandlingFunctions) {
    $.when.apply($, this.generateRequests(ids, dateWindow)).done(function () {
        dataHandlingFunctions.forEach(helperFunctions.call);
    });
};

/**
 * @param: an array of objects that contains pairs of values to be plotted
 */
DygraphDataProvider.prototype.addDataStreams = function (dataStreams) {
    this.numberOfStreams = dataStreams.length;
    var arrayOfArrays = [];
    dataStreams.forEach(function (dataStream) {
        var stream = [];
        dataStream.data.forEach(function (item) {
            // stream.push([new Date(item.timeValue), item.value]);
            stream.push([item.timeValue, item.value]);
        });
        arrayOfArrays.push(stream);
    });
    this.data = this.toDygraphNativeFormat(arrayOfArrays);
};

//TODO: Remove this
DygraphDataProvider.prototype.addDataStream = function (dataStream) {
    var arrayOfArrays = [];
    dataStream.forEach(function (item) {
        arrayOfArrays.push([item.timeValue, item.value]);
    });
    this.data.push(arrayOfArrays);
};

/**
 * Gets dygraph-data in a hashmap form and returns it in array form with calculated averages and min-max values
 * @param dataHashMap
 * @param sortedKeys
 * @returns {Array}
 */
DygraphDataProvider.prototype.getAverages = function (dataHashMap, sortedKeys) {
    var averages = [];
    var averagesMap = {};
    var numberOfKeys = sortedKeys.length;
    var groups = this.averageGroups;
    var numOfZones = groups.length;

    // Fill empty columns in merged hashmap (prepare)
    for (var i = 0; i < this.numberOfStreams; i++) {
        var previous, next, nxtIndx;
        for (var k = 0; k < numberOfKeys; k++) {
            var key = sortedKeys[k];
            if (!isNaN(parseFloat(dataHashMap[key][i]))) {
                previous = parseFloat(dataHashMap[key][i]);
            } else {
                nxtIndx = (k < numberOfKeys - 1) ? k + 1 : k;
                while ((nxtIndx < numberOfKeys - 1) && isNaN(parseFloat(dataHashMap[sortedKeys[nxtIndx]][i]))) {
                    nxtIndx++;
                }
                next = parseFloat(dataHashMap[sortedKeys[nxtIndx]][i]);
                if (!isNaN(parseFloat(previous)) && !isNaN(parseFloat(next)))
                    dataHashMap[key][i] = (previous + next) / 2;
                else if (!isNaN(parseFloat(previous)))
                    dataHashMap[key][i] = previous;
                else if (!isNaN(parseFloat(next)))
                    dataHashMap[key][i] = next;
            }
        }
    }

    // Calculate and populate Averages
    for (var k in dataHashMap) {
        var average = [], sum = [], numOfElements = [], max = [], min = [];
        averagesMap[k] = [];

        for (var i = 0; i < numOfZones; i++) {
            average.push(NaN);
            sum.push(0);
            numOfElements.push(0);
            max.push(Number.NEGATIVE_INFINITY);
            min.push(Number.POSITIVE_INFINITY);
        }

        for (var i = 0; i < this.numberOfStreams; i++) {
            var val = parseFloat(dataHashMap[k][i]);
            if (!isNaN(val)) {
                var indx = helperFunctions.getZone(i, groups);
                if (val > max[indx]) max[indx] = val;
                if (val < min[indx]) min[indx] = val;
                sum[indx] += val;
                numOfElements[indx]++;
            }
        }

        for (var i = 0; i < numOfZones; i++) {
            if (numOfElements[i] > 0) { // Do I need this if??
                average[i] = sum[i] / numOfElements[i];
                averagesMap[k].push([min[i] + ";" + average[i] + ";" + max[i]]);
            }
        }
    }

    for (k in sortedKeys) {
        var key = sortedKeys[k];
        averages.push([key].concat(averagesMap[key].join()));
        // averages += key + "," + averagesMap[key].join(';') + "\n";
    }
    return averages;
};

/**
 * Gets an array of streams in the format [[[timeValue, value], ...], ...]
 * @param dataStreams
 * @returns {string}
 */
DygraphDataProvider.prototype.toDygraphNativeFormat = function (dataStreams) {

    var dataToPlot = [];
    var sorted_keys = [];
    var dataHashMap = {};
    var emptyDataRow = [];

    for (var i = 0; i < dataStreams.length; i++) {
        emptyDataRow.push(null)
    }

    for (var i = 0; i < dataStreams.length; i++) {

        var dataArray = dataStreams[i];

        // Populate hashmap
        for (var d = 0; d < dataArray.length; d++) {
            var key = dataArray[d][0];
            var val = dataArray[d][1];

            if (key !== "") {
                if (dataHashMap[key] === undefined) {
                    dataHashMap[key] = [].concat(emptyDataRow);
                    // console.log("inserted at: " + key + " the val: " + val);
                }
                dataHashMap[key][i] = val;
            }
            else
                console.log("Problem at : " + d + " elemnt: " + dataArray[d]);
        }
    }

    for (var k in dataHashMap)
        sorted_keys.push(k);

    sorted_keys.sort();

    if (this.calculateAverages)
        dataToPlot = this.getAverages(dataHashMap, sorted_keys);
    else {
        for (var k in sorted_keys) {
            var key = sorted_keys[k];
            // dataToPlot.push([new Date(key)].concat(dataHashMap[key]));
            dataToPlot.push([key].concat(dataHashMap[key]).join());
        }
    }
    dataToPlot = dataToPlot.join("\n");
    return dataToPlot;
};

DygraphDataProvider.prototype.toDygraphPlotAvergeData = function () {
};

// Dygraph Plot Toolbar buttons handlers
var dygraphToolbar = {
    desired_range: null,
    approach_range: function (graph) {
        graph.updateOptions({dateWindow: desired_range});
    },
    zoom: function (graph, res) {
        var w = graph.xAxisRange();
        desired_range = [w[0], w[0] + res * 1000];
        dygraphToolbar.approach_range(graph);
    },
    reset: function (graph) {
        graph.resetZoom();
    },
    pan: function (graph, dir) {
        var w = graph.xAxisRange();
        var scale = w[1] - w[0];
        var amount = scale * 1 * dir; // 1 is the percentage to shift
        desired_range = [w[0] + amount, w[1] + amount];
        dygraphToolbar.approach_range(graph);
    },
    addDygraphsToolbarListener: function () {
        $('body').on('click', 'button[name="hour"]', function () {
            dygraphToolbar.zoom(dygraphs[$(this).closest("form").find("div.dygraph-plot").attr('id')], 3600);
        }).on('click', 'button[name="day"]', function () {
            dygraphToolbar.zoom(dygraphs[$(this).closest("form").find("div.dygraph-plot").attr('id')], 86400);
        }).on('click', 'button[name="week"]', function () {
            dygraphToolbar.zoom(dygraphs[$(this).closest("form").find("div.dygraph-plot").attr('id')], 604800);
        }).on('click', 'button[name="month"]', function () {
            dygraphToolbar.zoom(dygraphs[$(this).closest("form").find("div.dygraph-plot").attr('id')], 604830 * 8640000);
        }).on('click', 'button[name="full"]', function () {
            dygraphToolbar.reset(dygraphs[$(this).closest("form").find("div.dygraph-plot").attr('id')]);
        }).on('click', 'button[name="left"]', function () {
            dygraphToolbar.pan(dygraphs[$(this).closest("form").find("div.dygraph-plot").attr('id')], -1);
        }).on('click', 'button[name="right"]', function () {
            dygraphToolbar.pan(dygraphs[$(this).closest("form").find("div.dygraph-plot").attr('id')], 1);
        });
    }
};

// Dygraph options
var gWidthRatioWhenMaximized = 0.7;
var gWidthRatioWhenMinimized = 1;
var gHeightRatioWhenMaximized = 0.3;
var gHeightRatioWhenMinimized = 0.9;
var dygraphParams = {
    // "labels" : ["Time","a","b","c","d","e","f","g","h","i","j","k","l"],
    // "connectSeparatedPoints": true,
    "rollPeriod": 15,
    "showLabelsOnHighlight": true,
    "highlightSeriesOpts": {
//		strokeBorderWidth: 1.2,
//		"strokeWidth": 1.4,
//		"highlightCircleSize": 5
    },
    "labelsDivStyles": {
        'text-align': 'right',
        'background': 'none'
    },
    axes: {
//		y2: {"valueRange": [0, 30]}
    },
    "drawPoints": false, //Making this true really affects the performance
    "title": "Test",
    "showRoller": false,
    "showRangeSelector": true,
    "fillGraph": false,
    "legend": 'always',
    "ylabel": '',
    "labelsDivWidth": 150,
    "labelsSeparateLines": true,
    "labelsUTC": true,
    labelsDiv: document.getElementById('status')
//	"valueRange": [],
};

var pages = 0;
var totalCount = 0;

/*Quadrants*/
var localFetchMode = true;
var streams = [
    {streamId: 18704, name: "quad-1_probe-1", quad: "1", probe: "1", labels: ["Date", "Cubic Meters"], data: ""},
    {streamId: 18711, name: "quad-1_probe-2", quad: "1", probe: "2", labels: ["Date", "Cubic Meters"], data: ""},
    {streamId: 18762, name: "quad-1_temperature-1", quad: "1", labels: ["Date", "Temperature C"], data: ""},

    {streamId: 18718, name: "quad-2_probe-1", quad: "2", probe: "1", labels: ["Date", "Cubic Meters"], data: ""},
    {streamId: 18725, name: "quad-2_probe-2", quad: "2", probe: "2", labels: ["Date", "Cubic Meters"], data: ""},
    {streamId: 18767, name: "quad-2_temperature-1", quad: "2", labels: ["Date", "Temperature C"], data: ""},

    {streamId: 18732, name: "quad-3_probe-1", quad: "3", probe: "1", labels: ["Date", "Cubic Meters"], data: ""},
    {streamId: 18739, name: "quad-3_probe-2", quad: "3", probe: "2", labels: ["Date", "Cubic Meters"], data: ""},
    {streamId: 18772, name: "quad-3_temperature-1", quad: "3", labels: ["Date", "Temperature C"], data: ""},

    {streamId: 18746, name: "quad-4_probe-1", quad: "4", probe: "1", labels: ["Date", "Cubic Meters"], data: ""},
    {streamId: 18753, name: "quad-4_probe-2", quad: "4", probe: "2", labels: ["Date", "Cubic Meters"], data: ""},
    {streamId: 18777, name: "quad-4_temperature-1", quad: "4", labels: ["Date", "Temperature C"], data: ""}
];

/*
 * Make ajax call and store result to siteData
 */
function getStreamData(siteData, url, requestParams) {
    //startLoading();
//	setTimeout(function(){ stopLoading(); }, 1000);

    if (localFetchMode === true) {
        var url_ = helperFunctions.concatenateUrlAndParams("/getDataStream/", requestParams);
        $.ajax({
            url: url_,
            dataType: "json"
        }).done(function (data) {
            $.each(data.items, function (i, item) {
                siteData.data += item.timeValue + ',' + item.value + '\n';
            });
        });
    } else {
        var url_ = helperFunctions.concatenateUrlAndParams(url, requestParams)
        $.ajax({
            url: url_,
            dataType: "json"
        }).done(function (data) {
            pages += 1;

            $.each(data.Items, function (i, item) {
                siteData.data += item.timeValue + ',' + item.value[0].value + '\n';
            });

            totalCount = totalCount + data.Count;

            if (typeof (data.NextPageLink) != 'undefined') {
                getStreamData(siteData, data.NextPageLink, {});
            } else {
                console.log("pages: " + pages);
                console.log(siteData.data);
                //setTimeout(function(){ stopLoading(); }, 1000);
            }
        });
    }
}

function showGraphof(site, divElement) {
    if (divElement === undefined) {
        divElement = site.name;
    }
    //$(divElement).empty();

    if (dygraphs[divElement] === undefined) {

        if (site.probe === undefined)
            graphTitle = site.labels[1] + " vs " + site.labels[0];
        else
            graphTitle = site.probe + ": " + site.labels[1] + " vs " + site.labels[0];

        var x = (Dashboard.state.localeCompare("minimized") == 0) ?
        $("#" + divElement).parent().width() * gWidthRatioWhenMinimized :
        $("#" + divElement).parent().width() * gWidthRatioWhenMaximized;

        var y = (Dashboard.state.localeCompare("minimized") == 0) ?
        $("#" + divElement).parent().width() * gHeightRatioWhenMinimized :
        $("#" + divElement).parent().width() * gHeightRatioWhenMaximized

        dygraphs[divElement] = new Dygraph(document.getElementById(divElement), site.data, {
//		"animatedZooms": true,
            "connectSeparatedPoints": true,
            "rollPeriod": 54,
//			"width": x,
//			"height": y,
            "strokeWidth": 1.2,
            "showLabelsOnHighlight": true,
            "highlightCircleSize": 2,
            "highlightSeriesOpts": {
                "strokeWidth": 1.4,
                "highlightCircleSize": 5
            },
            "labelsDivStyles": {
                'text-align': 'right',
                'background': 'none'
            },
            "labels": site.labels,
            "drawPoints": true,
            "title": graphTitle,
            "showRoller": false,
            "showRangeSelector": true
        });
    } else {
        if (Dashboard.state.localeCompare("minimized") == 0) {
            resizeGraphs(gWidthRatioWhenMinimized, gHeightRatioWhenMinimized);
//			dygraphs[divElement].width_ = 100;
//			dygraphs[divElement].height_ = 100;
        }
        else if (Dashboard.state.localeCompare("maximized") == 0) {
            resizeGraphs(gWidthRatioWhenMaximized, gHeightRatioWhenMaximized);
//			dygraphs[divElement].width = 500;
//			dygraphs[divElement].height = 500;
        }
    }
}

function resizeGraphs(x, y) {
    setTimeout(function () {
        for (var gKey in dygraphs) {
            dygraphs[gKey].resize();
//			dygraphs[gKey].resize($("#"+gKey).parent().width() * x, $("#"+gKey).parent().width() * y);
        }
    }, 200);
}

function startLoading() {
    $("#LMetrics").append('<div id="loader" data-toggle="tab" class="loader-container">' +
        '<div class="loader-content">' +
        '<div class="circle"></div>' +
        '<div class="circle1"></div>' +
        '</div>' +
        '</div>');
}

function stopLoading() {
    $("#loader").remove();
}

function getStreamByID(id) {
    var results = $.grep(streams, function (e) {
        return e.streamId === id;
    });
    return (results.length === 0) ? null : results[0];
}

function getStreamByName(name) {
    var results = $.grep(streams, function (e) {
        return e.name === name;
    });
    return (results.length === 0) ? null : results[0];
}

function resetCounters() {
    pages = 0;
    totalCount = 0;
}

function reduceData(strData, numOfLines, rev) {
    lines = 0;
    if (rev) {
        downTo = 0;
        for (var i = strData.length; i > 0; i--) {
            if (lines == numOfLines) {
                downTo = i;
                break;
            }
            if (strData[i] === "\n")
                lines++;
        }
        return strData.substring(downTo + 2, strData.length);
    } else {
        upTo = strData.lenght;
        for (var i in strData) {
            if (lines == numOfLines) {
                upTo = i;
                break;
            }
            if (strData[i] === "\n")
                lines++;
        }
        return strData.substring(0, upTo - 1);
    }
}

var generateGraphs = function (view) {

    // log('View plot area', view);

    $("#" + view._id + "-plot-area").empty();

    var sensorsInGraph = [];
    var synchedDygraphs = [];
    
    var viewMode = $('input[name="' + view._id + '-view-mode"]:checked').val();
    var showAverages = $('input[name="' + view._id + '-average-checkbox"]').bootstrapSwitch('state');
    var startDate = $('#' + view._id + '-datepicker').find('input[name="start"]').datepicker("getDate");
    var endDate = $('#' + view._id + '-datepicker').find('input[name="end"]').datepicker("getDate");
    var dateWindow = [startDate, endDate];

    $.each($("ul[id='sensors-list-" + view._id + "'] > li > input[name='sensor']:checked"), function () {
        sensorsInGraph.push($(this).val());
    });

    // log('viewMode: ', viewMode);
    // log('showAverages: ', showAverages);
    // log('startDate: ', startDate);
    // log('endDate: ', endDate);
    log('sensors: ', sensorsInGraph);

    
    if (view.advancedToolbar === true) {
        if (viewMode === "combined") {

            var g = new DygraphPlotter();
            g.plotParams.title = "Soil Moisture and Temperature";
            g.plotParams.labels = ['Time'].concat(probeLabels.concat(temperatureLabels));
            g.plotParams.ylabel = 'Moisture';
            g.plotParams.y2label = 'Temperature';
            g.plotParams.series = {};
            g.plotParams.series["Temperature (C)"] = {axis: 'y2'};
            g.plotParams.connectSeparatedPoints = true;
            g.plotParams.labelsSeparateLines = true;
            g.plotParams.customBars = showAverages; //Carefull with this
            g.plotParams.highlightSeriesOpts = '';
            g.plotParams.showRangeSelector = true;
            // g.plotParams.dateWindow = [Date.parse(dateWindow[0]), Date.parse(dateWindow[1])];

            // Additional Options
            g.dataProvider.calculateAverages = showAverages; //Hack: May need to add interface functions for this setting
            // g.dataProvider.averageGroups = [1, 2]; //Hack: May need to add interface functions for this setting
            g.hasVisibletoolbar = true;
            g.hasSeparateLegendDiv = true;
            g.setWrapperElement("plot-area");
            g.setDivElement("mixed-probes");
            g.appendHTML();
            g.showSpinner();

            if (showAverages === true) {
                g.plotParams.title = "Soil Moisture and Temperature Averages";
                g.plotParams.labels = ['Time', 'Moisture', 'Temperature (C)'];
                g.plotParams.series['Temperature (C)'] = {axis: 'y2'};
                g.plotParams.highlightSeriesOpts = '';
                g.dataProvider.averageGroups = [probeLabels.length, temperatureLabels.length];

            } else {
                for (var l in temperatureLabels) g.plotParams.series[temperatureLabels[l]] = {axis: 'y2'};
            }
            g.dataProvider._onDoneFetchingData(sensorsInGraph, {periodFrom: dateWindow[0], periodTo: dateWindow[1]},
                [function () {
                    return g.dataProvider.addDataStreams(helperFunctions.getIndexSite().getSensorsById(sensorsInGraph));
                },
                    function () {
                        return g.stopSpinner();
                    },
                    function () {
                        return g.plot();
                    }]);
        } else {

            var probesGraphComplete = $.Deferred();
            var tempsGraphComplete = $.Deferred();

            if (probeLabels.length) {

                var g1 = new DygraphPlotter();
                g1.plotParams.title = "Quadrants Soil Moisture";
                g1.plotParams.labels = ['Time'].concat(probeLabels);
                g1.plotParams.ylabel = 'Moisture';
                g1.plotParams.connectSeparatedPoints = true;
                g1.plotParams.labelsSeparateLines = true;
                g1.plotParams.customBars = showAverages; //Carefull with this
                g1.plotParams.highlightSeriesOpts = '';
                g1.plotParams.showRangeSelector = true;
                // g1.plotParams.dateWindow = [Date.parse(dateWindow[0]), Date.parse(dateWindow[1])];

                // Additional Options
                g1.dataProvider.calculateAverages = showAverages; //Hack: May need to add interface functions for this setting
                g1.dataProvider.averageGroups = [probesInGraph.length];
                g1.hasVisibletoolbar = true;
                g1.hasSeparateLegendDiv = true;
                g1.setWrapperElement(view._id + '-plot-area');
                g1.setDivElement(view._id + '-combined-graphs');
                g1.appendHTML();
                g1.showSpinner();

                if (showAverages)
                    g1.plotParams.labels = ['Time', 'Moisture'];

                g1.dataProvider._onDoneFetchingData(probesInGraph, {periodFrom: dateWindow[0], periodTo: dateWindow[1]},
                    [function () {
                        g1.dataProvider.addDataStreams(helperFunctions.getIndexSite().getSensorsById(probesInGraph));
                        g1.stopSpinner();
                        g1.plot();
                        synchedDygraphs.push(dygraphs['mixed-probes']);
                        probesGraphComplete.resolve();
                    }]);
            }

            if (temperatureLabels.length) {

                var g2 = new DygraphPlotter();
                g2.plotParams.title = "Quadrants Temperature";
                g2.plotParams.labels = ['Time'].concat(temperatureLabels);
                g2.plotParams.ylabel = 'Temperature (C)';
                g2.plotParams.connectSeparatedPoints = true;
                g2.plotParams.labelsSeparateLines = true;
                g2.plotParams.customBars = showAverages; //Carefull with this
                g2.plotParams.highlightSeriesOpts = '';
                g2.plotParams.showRangeSelector = false;
                // g2.plotParams.dateWindow = [Date.parse(dateWindow[0]), Date.parse(dateWindow[1])];

                // Additional Options
                g2.dataProvider.calculateAverages = showAverages; //Hack: May need to add interface functions for this setting
                g2.dataProvider.averageGroups = [tempsInGraph.length];
                g2.hasVisibletoolbar = true;
                g2.hasSeparateLegendDiv = true;
                g2.setWrapperElement("plot-area");
                g2.setDivElement("mixed-temperatures");
                g2.appendHTML();
                g2.showSpinner();

                if (showAverages)
                    g2.plotParams.labels = ['Time', 'Temperature'];

                g2.dataProvider._onDoneFetchingData(tempsInGraph, {periodFrom: dateWindow[0], periodTo: dateWindow[1]},
                    [function () {
                        g2.dataProvider.addDataStreams(helperFunctions.getIndexSite().getSensorsById(tempsInGraph));
                        g2.stopSpinner();
                        g2.plot();
                        synchedDygraphs.push(dygraphs['mixed-temperatures']);
                        tempsGraphComplete.resolve();
                    }]);
            }

            if (viewMode === "synchronized") {
                $.when(probesGraphComplete, tempsGraphComplete).done(function () {
                    Dygraph.synchronize(synchedDygraphs);
                });
            }
        }
    } else {
        
        var dygs = [];
        for (var i = 0; i < sensorsInGraph.length; i++) {

            var sensor = helperFunctions.getIndexSite().getSensorById(sensorsInGraph[i]);

            log('sensor', sensor);

            dygs.push(new DygraphPlotter());
            dygs[i].plotParams.title = sensor.name;
            dygs[i].plotParams.labels = [sensor.units[1], sensor.units[0]];  //Use Reverse function or change db schema?
            // dygs[i].plotParams.labels = ['x', 'y'];  //Use Reverse function or change db schema?
            dygs[i].plotParams.ylabel = sensor.units[0];
            // dygs[i].plotParams.ylabel = 'y';
            dygs[i].plotParams.labelsSeparateLines = true;
            dygs[i].plotParams.highlightSeriesOpts = '';
            dygs[i].plotParams.showRangeSelector = true;
            dygs[i].plotParams.fillGraph = true;
            dygs[i].plotParams.rollPeriod = 30;
            dygs[i].plotParams.color = "#5BAFF3";
            // dygs[i].plotParams.dateWindow = [Date.parse(dateWindow[0]), Date.parse(dateWindow[1])];

            // Additional Options
            dygs[i].hasVisibletoolbar = true;
            dygs[i].hasSeparateLegendDiv = true;
            dygs[i].setWrapperElement(view._id + '-plot-area');
            dygs[i].setDivElement(view._id + '-sensor-' + sensorsInGraph[i]);

            dygs[i].loadAndPlot([sensorsInGraph[i]], {periodFrom: dateWindow[0], periodTo: dateWindow[1]});
        }
        
    }
    
};

Date.prototype.setISO8601 = function (string) {
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
        "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
        "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = string.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) {
        date.setMonth(d[3] - 1);
    }
    if (d[5]) {
        date.setDate(d[5]);
    }
    if (d[7]) {
        date.setHours(d[7]);
    }
    if (d[8]) {
        date.setMinutes(d[8]);
    }
    if (d[10]) {
        date.setSeconds(d[10]);
    }
    if (d[12]) {
        date.setMilliseconds(Number("0." + d[12]) * 1000);
    }
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    time = (Number(date) + (offset * 60 * 1000));
    this.setTime(Number(time));
    return this;
}

function sortByDate(date1, date2) {
    var date1_ = (new Date()).setISO8601(date1);
    var date2_ = (new Date()).setISO8601(date2);
    return date2_ > date1_ ? 1 : -1;
}

function getAverageData(dataStreams) {
    var dataHashMap = {};
    var values = [];

    for (var i = 0; i < dataStreams.length; i++) {
        values.push("");
    }

    for (var i = 0; i < dataStreams.length; i++) {

        var dataArray = dataStreams[i].split("\n");

        // Check if the last element is empty
        if (dataArray[dataArray.length - 1].split(",").length === 1) {
            dataArray = dataArray.slice(0, dataArray.length - 1);
        }

        // Populate hashmap
        for (var d = 0; d < dataArray.length; d++) {

            var sp = dataArray[d].split(",");
            key = sp[0], val = sp[1];

            if (key !== "") {
                if (dataHashMap[key] != undefined) {
                    dataHashMap[key][i] = val;
                    // console.log("Updated at: " + key + " the val: " + val);
                } else {
                    dataHashMap[key] = [].concat(values);
                    dataHashMap[key][i] = val;
                    // console.log("inserted at: " + key + " the val: " + val);
                }
            }
            else
                console.log("Problem at : " + d + " elemnt: " + dataArray[d]);
        }
    }

    var dataToPlot = "";
    var sorted_keys = [];

    for (k in dataHashMap) {
        sorted_keys.push(k);
    }
    sorted_keys.sort();

    // Fill empty columns in merged hashmap
    for (var i = 0; i < dataStreams.length; i++) {
        var previous, next, nxtIndx;
        for (var k = 0; k < sorted_keys.length; k++) {
            var key = sorted_keys[k];
            if (!isNaN(parseFloat(dataHashMap[key][i]))) {
                previous = parseFloat(dataHashMap[key][i]);
            } else {
                nxtIndx = (k < sorted_keys.length - 1) ? k + 1 : k;
                while ((nxtIndx < sorted_keys.length - 1) && isNaN(parseFloat(dataHashMap[sorted_keys[nxtIndx]][i]))) {
                    nxtIndx++;
                }
                next = parseFloat(dataHashMap[sorted_keys[nxtIndx]][i]);
                if (!isNaN(parseFloat(previous)) && !isNaN(parseFloat(next)))
                    dataHashMap[key][i] = (previous + next) / 2;
                else if (!isNaN(parseFloat(previous)))
                    dataHashMap[key][i] = previous;
                else if (!isNaN(parseFloat(next)))
                    dataHashMap[key][i] = next;
            }
        }
    }

    var averages = {};

    // Averages
    for (var k in dataHashMap) {
        var average = NaN, sum = 0, numOfElements = 0, max = Number.NEGATIVE_INFINITY, min = Number.POSITIVE_INFINITY;

        for (var i = 0; i < dataStreams.length; i++) {
            var val = parseFloat(dataHashMap[k][i]);
            if (!isNaN(val)) {
                if (val > max) max = val;
                if (val < min) min = val;
                sum += val;
                numOfElements++;
            }
        }
        if (numOfElements > 0)
            average = sum / numOfElements;
        averages[k] = [min, average, max];
    }

    for (k in sorted_keys) {
        var key = sorted_keys[k];
        dataToPlot += key + "," + averages[key].join(';') + "\n";
    }

    dataToPlot = dataToPlot.substr(0, dataToPlot.length - 1);
    return dataToPlot;
}

/*
 gets a list [] of of arrays [[k, v], [k, v], ... ]
 */
function aggregateDataMod(dataStreams) {

    var dataHashMap = {};
    var values = [];

    for (var i = 0; i < dataStreams.length; i++) {
        values.push("");
    }

    for (var i = 0; i < dataStreams.length; i++) {

        var dataArray = dataStreams[i].split("\n");

        // Check if the last element is empty
        if (dataArray[dataArray.length - 1].split(",").length === 1) {
            dataArray = dataArray.slice(0, dataArray.length - 1);
        }

        // Populate hashmap
        for (var d = 0; d < dataArray.length; d++) {

            var sp = dataArray[d].split(",");
            key = sp[0], val = sp[1];

            if (key !== "") {
                if (dataHashMap[key] != undefined) {
                    dataHashMap[key][i] = val;
                    // console.log("Updated at: " + key + " the val: " + val);
                } else {
                    dataHashMap[key] = [].concat(values);
                    dataHashMap[key][i] = val;
                    // console.log("inserted at: " + key + " the val: " + val);
                }
            }
            else
                console.log("Problem at : " + d + " elemnt: " + dataArray[d]);
        }
    }

    var dataToPlot = "";
    var sorted_keys = [];

    for (k in dataHashMap) {
        sorted_keys.push(k);
//		dataToPlot += k + "," + dataHashMap[k].join() + "\n";
    }

    sorted_keys.sort();

    for (k in sorted_keys) {
        var key = sorted_keys[k];
        dataToPlot += key + "," + dataHashMap[key].join() + "\n";
    }

    dataToPlot = dataToPlot.substr(0, dataToPlot.length - 1);
    return dataToPlot;
}

function aggregateData(dataStreams) {

    var T = [];
    var D = [];
    var TimeCol = [];
    var aggregatedData = "";

    // Iterate Data args
    for (var i = 0; i < dataStreams.length; i++) {

        T[i] = [], D[i] = [];

        // Convert strings to arrays
        var dataArray = dataStreams[i].split("\n");
        // Check if the last element is empty
        if (dataArray[dataArray.length - 1].split(",").length === 1) {
            dataArray = dataArray.slice(0, dataArray.length - 1);
        }

        // Split to T and D
        for (var d = 0; d < dataArray.length; d++) {
            // First data column
            var t = dataArray[d].split(",")[0];
            if (t == "") {
                console.log("Problem at : " + d + " elemnt: " + dataArray[d]);
            }
            T[i].push(t);

            // Second data column
            D[i].push(dataArray[d].split(",")[1]);

            // If key not in array, then push it
            if ($.inArray(t, TimeCol) < 0) {
                TimeCol.push(t);
            }
        }
    }

    TimeCol.join();
    TimeCol.sort(sortByDate);

//	console.log("T: " + T + "\n");
//	console.log("D: " + D + "\n");
//	console.log("Time Col: " + TimeCol + "\n");

    for (var i = 0; i < TimeCol.length; i++) {
        datacol = "";
        for (var j = 0; j < T.length; j++) {

            var f = $.inArray(TimeCol[i], T[j]);
            if (f > -1) {
//				console.log("Data found at: " + T[j][f] + " f: " + f);
                if (j === T.length - 1) {
                    datacol += D[j][f];
                } else {
                    datacol += D[j][f] + ",";
                }
            } else {
                if (j === T.length - 1) {
                    datacol += "";
                } else {
                    datacol += ",";
                }
            }
        }
        aggregatedData += TimeCol[i] + "," + datacol + "\n";
    }
    ;
    return aggregatedData;
}

function populateGraphs(quad) {
    switch (parseInt(quad)) {
        case 1:
            showGraphof(getStreamByName("quad-1_probe-1"));
            showGraphof(getStreamByName("quad-1_probe-2"));
            showGraphof(getStreamByName("quad-1_temperature-1"));
            break;
        case 2:
            showGraphof(getStreamByName("quad-2_probe-1"));
            showGraphof(getStreamByName("quad-2_probe-2"));
            showGraphof(getStreamByName("quad-2_temperature-1"));
            break;
        case 3:
            showGraphof(getStreamByName("quad-3_probe-1"));
            showGraphof(getStreamByName("quad-3_probe-2"));
            showGraphof(getStreamByName("quad-3_temperature-1"));
            break;
        case 4:
            showGraphof(getStreamByName("quad-4_probe-1"));
            showGraphof(getStreamByName("quad-4_probe-2"));
            showGraphof(getStreamByName("quad-4_temperature-1"));
            break;
        default:
    }
}

function loadSiteData() {
    var url = "https://public.optirtc.com/api/datapoint/";
    var requestParams = {
        "key": "z5ywCWZ4rLh3lu*3i234StqF",
        "dataStreamId": 18704
    };

    for (var stream in streams) {
        requestParams.dataStreamId = streams[stream].streamId;
        getStreamData(streams[stream], url, requestParams);
        resetCounters();
    }

//	getStreamData(quad-1_probe-1, url, requestParams);
//	resetCounters();
//
//	requestParams.dataStreamId = 18711;
//	getStreamData(quad-1_probe-2, url, requestParams);
//	resetCounters();
}

var adjustDygraphsPlotAreaHTMLonResize = function () {
    if ($('div.graph-container').width() > 400) {
        $('div.dygraph-toolbar').removeClass('dashboard-small');
        $('button.btn-responsive').removeClass('btn-responsive-small');
        $('div.dygraph-title').removeClass('dashboard-small');
        $('div.graph-container').addClass('graph-container-desk');
    } else {
        $('div.dygraph-toolbar').addClass('dashboard-small');
        $('button.btn-responsive').addClass('btn-responsive-small');
        $('div.dygraph-title').addClass('dashboard-small');
        $('div.graph-container').removeClass('graph-container-desk');
    }
};


var resizeDygraphs = function () {
    setTimeout(function () {
        adjustDygraphsPlotAreaHTMLonResize();

        for (var indx in dygraphs) {
            if (dygraphs.hasOwnProperty(indx)) {
                dygraphs[indx].resize();
            }
        }
        // if (dygraphs['mixed-probes'] != undefined) {
        //     dygraphs['mixed-probes'].resize();
        // }
        // if (dygraphs['mixed-temperatures'] != undefined) {
        //     dygraphs['mixed-temperatures'].resize();
        // }
    }, 300); // Need to add a small delay in order to avoid breaking the internal split-pane listener
};

$(document).ready(function () {
    // loadSiteData();
    dygraphToolbar.addDygraphsToolbarListener();

    $('div.split-pane').on('splitpaneresize', resizeDygraphs);

    // $('div.graph-container').bind('resize', function(e) {
    //
    // });

    // $('a[href="#all-quads"]').on('shown.bs.tab', resizeDygraphs);

    // $('.nav-tabs a').on('shown.bs.tab', function(event) {
    // // populateGraphs($(event.target).text().split(" ")[1]);
    // });

    // if ($("#plot-area").width() <= 500) {
    //     $("button.btn-responsive").addClass("btn-responsive-small");
    //     // $( ".myclass.otherclass" ).css( "border", "13px solid red" );
    // } else {
    //     mapToolbar("Normal");
    // }

});