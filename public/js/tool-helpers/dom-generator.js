var DASHBOARD_DATA_VIEWER_SECTION = '<div class="panel-body">\n\n\t<div>\n\t\t<ul class="nav nav-tabs" id="selection-tabs">\n\t\t\t<li class="active"><a href="#all-quads" role="tab" data-toggle="tab">Quadrants</a></li>\n\t\t\t<li><a role="tab" data-toggle="tab" href="#rain">Rain</a></li>\n\t\t\t<li><a role="tab" data-toggle="tab" href="#cistern">Cistern</a></li>\n\t\t\t<li><a role="tab" data-toggle="tab" href="#other-sensors">Other Sensors</a></li>\n\t\t</ul>\n\t</div>\n\t<div class="tab-content">\n\n\t\t<div id="all-quads" role="tabpanel" class="tab-pane active tab-plot">\n\n\n\t\t\t<div id="combined-graphs-menu" class="row">\n\t\t\t\t<div class="panel-group" id="data-viewer-filters">\n\n\t\t\t\t\t<div class="panel panel-default">\n\t\t\t\t\t\t<div class="panel-heading">\n\t\t\t\t\t\t\t<p class="panel-title">\n\t\t\t\t\t\t\t\t<a id="data-selector" data-toggle="collapse" data-parent="#data-viewer-filters"\n\t\t\t\t\t\t\t\t\t href="#data-viewer-filters-col-1">Data Selector</a>\n\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div id="data-viewer-filters-col-1" class="panel-collapse collapse in">\n\t\t\t\t\t\t\t<div class="panel-body">\n\t\t\t\t\t\t\t\t<div class="row">\n\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t<div class="col-xs-12 col-sm-4 col-md-4 text-center">\n\t\t\t\t\t\t\t\t\t\t<div><h6>Quadrants</h6></div>\n\t\t\t\t\t\t\t\t\t\t<div class="btn-group btn-group-sm" role="group" data-toggle="buttons">\n\t\t\t\t\t\t\t\t\t\t\t<label class="btn btn-default">\n\t\t\t\t\t\t\t\t\t\t\t\t<input type="checkbox" name="Quadrant" value="q-1">1\n\t\t\t\t\t\t\t\t\t\t\t</label>\n\t\t\t\t\t\t\t\t\t\t\t<label class="btn btn-default">\n\t\t\t\t\t\t\t\t\t\t\t\t<input type="checkbox" name="Quadrant" value="q-2">2\n\t\t\t\t\t\t\t\t\t\t\t</label>\n\t\t\t\t\t\t\t\t\t\t\t<label class="btn btn-default">\n\t\t\t\t\t\t\t\t\t\t\t\t<input type="checkbox" name="Quadrant" value="q-3">3\n\t\t\t\t\t\t\t\t\t\t\t</label>\n\t\t\t\t\t\t\t\t\t\t\t<label class="btn btn-default">\n\t\t\t\t\t\t\t\t\t\t\t\t<input type="checkbox" name="Quadrant" value="q-4">4\n\t\t\t\t\t\t\t\t\t\t\t</label>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t<div class="col-xs-12 col-sm-4 col-md-4 text-center">\n\t\t\t\t\t\t\t\t\t\t<div><h6>Probes</h6></div>\n\t\t\t\t\t\t\t\t\t\t<div class="btn-group btn-group-sm" role="group" aria-label="..." data-toggle="buttons">\n\t\t\t\t\t\t\t\t\t\t\t<label class="btn btn-default">\n\t\t\t\t\t\t\t\t\t\t\t\t<input type="checkbox" name="Probe" value="p-1">1\n\t\t\t\t\t\t\t\t\t\t\t</label>\n\t\t\t\t\t\t\t\t\t\t\t<label class="btn btn-default">\n\t\t\t\t\t\t\t\t\t\t\t\t<input type="checkbox" name="Probe" value="p-2">2\n\t\t\t\t\t\t\t\t\t\t\t</label>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div class="col-xs-12 col-sm-4 col-md-4 text-center">\n\t\t\t\t\t\t\t\t\t\t<div><h6>Temperature</h6></div>\n\t\t\t\t\t\t\t\t\t\t<div class="btn-group btn-group-sm" role="group" aria-label="..." data-toggle="buttons">\n\t\t\t\t\t\t\t\t\t\t\t<label class="btn btn-default">\n\t\t\t\t\t\t\t\t\t\t\t\t<input type="checkbox" name="Temp" value="t-1">1\n\t\t\t\t\t\t\t\t\t\t\t</label>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t\n\t\t\t\t\t<div class="panel panel-default">\n\t\t\t\t\t\t<div class="panel-heading">\n\t\t\t\t\t\t\t<p class="panel-title">\n\t\t\t\t\t\t\t\t<a class="collapsed" data-toggle="collapse" data-parent="#data-viewer-filters"\n\t\t\t\t\t\t\t\t\t href="#data-viewer-filters-col-2">Data Filters</a>\n\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div id="data-viewer-filters-col-2" class="panel-collapse collapse">\n\n\t\t\t\t\t\t\t<div class="panel-body">\n\t\t\t\t\t\t\t\t<div class="row">\n\t\t\t\t\t\t\t\t\t<div class="col-xs-12 col-sm-4 col-md-4 text-center">\n\t\t\t\t\t\t\t\t\t\t<div><h6>View Mode</h6></div>\n\t\t\t\t\t\t\t\t\t\t<div class="btn-group btn-group-sm">\n\t\t\t\t\t\t\t\t\t\t\t<button data-toggle="dropdown" class="btn btn-default dropdown-toggle">Separated<span\n\t\t\t\t\t\t\t\t\t\t\t\t\tclass="caret"></span></button>\n\t\t\t\t\t\t\t\t\t\t\t<ul class="dropdown-menu">\n\t\t\t\t\t\t\t\t\t\t\t\t<li><input type="radio" id="separated" name="view-mode" value="separated" checked><label\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tfor="separated">Separated</label></li>\n\t\t\t\t\t\t\t\t\t\t\t\t<li><input type="radio" id="combined" name="view-mode" value="combined"><label for="combined">Combined</label>\n\t\t\t\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t\t\t\t<li><input type="radio" id="synchronized" name="view-mode" value="synchronized"><label\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tfor="synchronized">Synchronized</label></li>\n\t\t\t\t\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div class="col-xs-12 col-sm-3 col-md-3 text-center">\n\t\t\t\t\t\t\t\t\t\t<div><h6>Average</h6></div>\n\t\t\t\t\t\t\t\t\t\t<div class="btn-group btn-group-sm text-center">\n\t\t\t\t\t\t\t\t\t\t\t<input type="checkbox" name="average-checkbox" data-size="small">\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div class="col-xs-12 col-sm-5 col-md-5 text-center">\n\t\t\t\t\t\t\t\t\t\t<div><h6>Date Range</h6></div>\n\t\t\t\t\t\t\t\t\t\t<div class="btn-group btn-group-sm text-center">\n\t\t\t\t\t\t\t\t\t\t\t<div class="input-daterange input-group" id="datepicker">\n\t\t\t\t\t\t\t\t\t\t\t\t<input type="text" class="input-sm form-control" data-size="small" name="start"/>\n\t\t\t\t\t\t\t\t\t\t\t\t<span class="input-group-addon">to</span>\n\t\t\t\t\t\t\t\t\t\t\t\t<input type="text" class="input-sm form-control" data-size="small" name="end"/>\n\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="text-center">\n\t\t\t\t<button type="button"\n\t\t\t\t\t\t\t\tclass="btn btn-primary btn-sm graphs-plot-button" onclick="generateMixedGraphs_()">\n\t\t\t\t\t<span class="glyphicon glyphicon-triangle-right"></span> Plot\n\t\t\t\t</button>\n\t\t\t</div>\n\t\t\t<hr>\n\t\t\t<div id="plot-area"></div>\n\t\t</div>\n\n\t\t<div id="rain" role="tabpanel" class="tab-pane tab-plot">\n\t\t\t<div id="rain-graphs-menu" class="row">\n\t\t\t\t<div class="col-xs-12 text-center">\n\t\t\t\t\t<div><h6>Date Range</h6></div>\n\t\t\t\t\t<div class="btn-group btn-group-sm">\n\t\t\t\t\t\t<div class="input-daterange input-group" id="rain-datepicker">\n\t\t\t\t\t\t\t<input type="text" class="input-sm form-control" data-size="small" name="start"/>\n\t\t\t\t\t\t\t<span class="input-group-addon">to</span>\n\t\t\t\t\t\t\t<input type="text" class="input-sm form-control" data-size="small" name="end"/>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="text-center">\n\t\t\t\t<button type="button"\n\t\t\t\t\t\t\t\tclass="btn btn-primary btn-sm graphs-plot-button" onclick="generateRainGraphs()">\n\t\t\t\t\t<span class="glyphicon glyphicon-triangle-right"></span> Plot\n\t\t\t\t</button>\n\t\t\t</div>\n\t\t\t<hr>\n\t\t\t<div id="rain-plot-area"></div>\n\t\t</div>\n\n\t\t<div id="cistern" role="tabpanel" class="tab-pane tab-plot">\n\t\t\t<div id="cistern-graphs-menu" class="row">\n\t\t\t\t<div class="col-xs-12 text-center">\n\t\t\t\t\t<div><h6>Date Range</h6></div>\n\t\t\t\t\t<div class="btn-group btn-group-sm">\n\t\t\t\t\t\t<div class="input-daterange input-group" id="cistern-datepicker">\n\t\t\t\t\t\t\t<input type="text" class="input-sm form-control" data-size="small" name="start"/>\n\t\t\t\t\t\t\t<span class="input-group-addon">to</span>\n\t\t\t\t\t\t\t<input type="text" class="input-sm form-control" data-size="small" name="end"/>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="text-center">\n\t\t\t\t<button type="button"\n\t\t\t\t\t\t\t\tclass="btn btn-primary btn-sm graphs-plot-button" onclick="generateCisternGraphs()">\n\t\t\t\t\t<span class="glyphicon glyphicon-triangle-right"></span> Plot\n\t\t\t\t</button>\n\t\t\t</div>\n\t\t\t<hr>\n\t\t\t<div id="cistern-plot-area"></div>\n\t\t</div>\n\n\t\t<div id="other-sensors" role="tabpanel" class="tab-pane tab-plot">\n\t\t\t<div id="other-sensors-graphs-menu" class="row">\n\t\t\t\t<div class="col-xs-12 text-center">\n\t\t\t\t\t<div><h6>Date Range</h6></div>\n\t\t\t\t\t<div class="btn-group btn-group-sm">\n\t\t\t\t\t\t<div class="input-daterange input-group" id="other-sensors-datepicker">\n\t\t\t\t\t\t\t<input type="text" class="input-sm form-control" data-size="small" name="start"/>\n\t\t\t\t\t\t\t<span class="input-group-addon">to</span>\n\t\t\t\t\t\t\t<input type="text" class="input-sm form-control" data-size="small" name="end"/>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="text-center">\n\t\t\t\t<button type="button"\n\t\t\t\t\t\t\t\tclass="btn btn-primary btn-sm graphs-plot-button" onclick="generateOtherSensorsGraphs()">\n\t\t\t\t\t<span class="glyphicon glyphicon-triangle-right"></span> Plot\n\t\t\t\t</button>\n\t\t\t</div>\n\t\t\t<hr>\n\t\t\t<div id="other-sensors-plot-area"></div>\n\n\t\t</div>\n\t</div>\n</div>';
var NOT_SELECTED_SITE_WARNING = '<div class="col-xs-12 alert alert-info"><div class="glyphicon glyphicon-exclamation-sign"></div><div>Select a green site from the map to display information here.</div>';
var MAP_TOOLBAR_HANDHELD = '<div id="map-toolbar" class="btn-group">\
        <button type="button" class="btn btn-default" onclick="openToolbar()">Dashboard\
        </button>\
        <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">\
        <span class="caret"></span>\
        </button>\
        <ul class="dropdown-menu" role="menu">\
        <li><a href="#"onclick="populateSitesOnMap()">Show Sites</a></li>\
        <li><a href="#"onclick="clearMap()">Clear Map</a></li>\
        </ul>\
        </div>'

var MAP_TOOLBAR_NORMAL =
    '<div id="map-toolbar" class="btn-group">\
            <button type="button" class="btn btn-default" onclick="openToolbar()">Dashboard</button>\
            <button type="button" class="btn btn-default" onclick="populateSitesOnMap()">Show Sites</button>\
            <button type="button" class="btn btn-default" onclick="clearMap()">Clear Map</button>\
     </div>';


function initializeQuadrantsDomElements() {
    // for(var i=0; i<streams.length; i++) {
    // 	$("#quad-" + streams[i].quad).append('<div class="row dygraph-plot-row-wrapper">' +
    // 					'<div class="col-sm-2 text-center"></div>' +
    // 					'<div class="col-sm-8 text-center graph-container">' +
    // 						'<div id=' + streams[i].name + ' style="width:100%"></div>' +
    // 					'</div>' +
    // 					'<div class="col-sm-2 text-center"></div>' +
    // 				'</div>');
    // }
}

function showMapToolbar() {
    if ($(window).width() <= 500) {
        mapToolbar("Handheld");
    } else {
        mapToolbar("Normal");
    }
}

function mapToolbar(screenSize) {
    if (screenSize === "Handheld") {
        $("#map-toolbar").replaceWith(MAP_TOOLBAR_HANDHELD);
    } else {
        $("#map-toolbar").replaceWith(MAP_TOOLBAR_NORMAL);
    }

}

var ViewsManager = {

    sections: [],

    initSections: function () {
        ViewsManager.sections = jQuery.extend(true, {}, SECTIONS);
    },

    populateSections: function (site) {

        var _this_ = this;

        _this_.initSections();

        SECTIONS.forEach(function (section) {

            section.site = site;
            section.views = [];
            section.init();

            log('views', site.views);

            site.views.forEach(function (view) {

                if (view.pageSection === section.name) {
                    section.views.push(view);
                }

            });

            if (section.views.length)
                section.generateHTML();
        });

    },

    populateView: function (view) {

    },
    
    reset: function () {

        var _this_ = this;
        _this_.sections = [];
        _this_.initSections();

        SECTIONS.forEach(function (section) {

            section.clear();
            section.init();

        });

    }
};

$(document).ready(function () {

    initializeQuadrantsDomElements();
    ViewsManager.initSections();
    showMapToolbar();

    $(window).resize(function () {
        if ($(window).width() <= 500) {
            mapToolbar("Handheld");
        } else {
            mapToolbar("Normal");
        }
    });

});