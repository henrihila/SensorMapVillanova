DOMAIN = 'http://localhost:3000';

API_ROOT = '/api';

API = {
    SITES: DOMAIN + API_ROOT + '/sites',
    DATA_STREAM: DOMAIN + API_ROOT + '/data-stream'
};

var SECTIONS = [
    {
        name: 'Marker',
        id: 'site-marker-section',
        site: {},
        views: [],
        generateHTML: function () {

            var _this_ = this;

            var html = '';

            html += '<div id="' + _this_.id + '" class="site-overview-balloon">';

            // Header -- open
            var tabLinks = '';
            var tabs = '';

            if (_this_.views.length > 1) {

                tabLinks += '<li class="active"><a data-toggle="tab" href="#' + _this_.views[0]._id + '">'+ _this_.views[0].name + '</a></li>';
                tabs += '<div id="' + _this_.views[0]._id + '" class="tab-pane fade in active">' + _this_.views[0].content + '</div>';

                _this_.views.slice(1, _this_.views.length).forEach(function (view) {
                    tabLinks += '<li><a data-toggle="tab" href="#' + view._id + '">'+ view.name + '</a></li>';
                    tabs += '<div id="' + view._id + '" class="tab-pane fade">' + view.content + '</div>';
                });

            } else {
                tabLinks += '<li class="active"><a data-toggle="tab" href="#' + _this_.views[0]._id + '">'+ _this_.views[0].name + '</a></li>';
                tabs += '<div id="' + _this_.views[0]._id + '" class="tab-pane fade in active">' + _this_.views[0].content + '</div>';
            }

            html += '<div class="site-overview-balloon-header"><h4>' + _this_.site.name + '</h4>';
            html += '<ul class="nav nav-tabs">';
            html += tabLinks;
            html += '</ul>';
            html += '</div>';
            // Header -- close
            
            // Tabs content
            html += '<div class=" site-overview-balloon-tab tab-content">';
            html += tabs;
            html += '</div>';
            
            html += '</div>';

            $('#' + _this_.id).replaceWith(html);
        },
        init: function () {

            var _this_ = this;
            var initContent = _this_.site ? _this_.site.name : NOT_SELECTED_SITE_WARNING;
            $('#' + _this_.id).replaceWith('<div id="' + _this_.id + '">' + initContent + '</div>');

        },
        clear: function () {

            var _this_ = this;
            _this_.site = null;
            _this_.views = null;
            
        }
    }, {
        name: 'About',
        id: 'site-about-section',
        site: {},
        views: [],
        generateHTML: function () {

            var _this_ = this;
            
            var html = '';

            html += '<div id="' + _this_.id + '">';

            // Header -- open
            var tabLinks = '';
            var tabs = '';

            if (_this_.views.length > 1) {

                tabLinks += '<li class="active"><a data-toggle="tab" href="#' + _this_.views[0]._id + '">'+ _this_.views[0].name + '</a></li>';
                tabs += '<div id="' + _this_.views[0]._id + '" class="tab-pane fade in active">' + _this_.views[0].content + '</div>';

                _this_.views.slice(1, _this_.views.length).forEach(function (view) {
                    tabLinks += '<li><a data-toggle="tab" href="#' + view._id + '">'+ view.name + '</a></li>';
                    tabs += '<div id="' + view._id + '" class="tab-pane fade">' + view.content + '</div>';
                });

            } else {
                tabLinks += '<li class="active"><a data-toggle="tab" href="#' + _this_.views[0]._id + '">'+ _this_.views[0].name + '</a></li>';
                tabs += '<div id="' + _this_.views[0]._id + '" class="tab-pane fade in active">' + _this_.views[0].content + '</div>';
            }


            html += '<ul class="nav nav-tabs nav-justified">';
            html += tabLinks;
            html += '</ul>';
            // Header -- close

            // Tabs content
            html += '<div class="tab-content">';
            html += tabs;
            html += '</div>';

            html += '</div>';

            $('#' + _this_.id).replaceWith(html);
            
        },
        init: function () {

            var _this_ = this;
            var initContent = _this_.site ? _this_.site.description : NOT_SELECTED_SITE_WARNING;
            $('#' + _this_.id).replaceWith('<div id="' + _this_.id + '">' + initContent + '</div>');


        },
        clear: function () {

            var _this_ = this;
            _this_.site = null;
            _this_.views = null;

        }
    },{
        name: 'Data Viewer',
        id: 'site-data-viewer-section',
        site: {},
        views: [],
        generateHTML: function () {

            var _this_ = this;

            var html = '';

            html += '<div id="' + _this_.id + '">';

            // Header -- open
            var tabLinks = '';
            var tabs = '';
            

            var genToolbar = function (view) {

                // Sensors selector
                var getSensorById = function (id) {
                    for (var i = 0, len = _this_.site.sensors.length; i < len; i++) {
                        if (_this_.site.sensors[i]._id == id)
                            return _this_.site.sensors[i];
                    }
                    return null;
                };

                var sensorsSL = '<div class="panel panel-default">' +
                    '<div class="panel-heading">' +
                    '<p class="panel-title">' +
                    '<a id="data-selector" data-toggle="collapse" data-parent="#'+ view._id + '-graphs-toolbar-sensors" href="#' +  view._id + '-sensor-selector">Sensors</a>' +
                    '</p>' +
                    '</div>';

                sensorsSL += '<div id="' +  view._id + '-sensor-selector" class="panel-collapse collapse in">' +
                    '<div class="panel-body">';
                
                sensorsSL += '<div class="btn-group" style="margin: 0 auto;">' +
                    '<button data-toggle="dropdown" class="btn dropdown-toggle" data-placeholder="Please select">Select sensors<span class="caret"></span></button>' +
                    '<ul class="dropdown-menu" id="sensors-list-' + view._id + '">';

                view.sensors.forEach(function (sensorId) {
                    //console.log("SensorID: ", sensorId);
                    try {

                        var _sensor_ = getSensorById(sensorId);

                        if (_sensor_) {
                            var _selectId_ = 'selection-' + view._id + '-' + _sensor_._id;
                            sensorsSL += '<li><input id="' + _selectId_ + '" type="checkbox" name="sensor" value="' + _sensor_._id + '"><label for="' + _selectId_ + '" name="sensor">' + _sensor_.name + '</label></li>';
                        }

                    } catch (err) {
                        log('Could find sensor in site', err);
                    }
                });

                sensorsSL += '</ul></div></div></div></div>';

                // Filters

                var filters = '<div class="panel panel-default">\n\t<div class="panel-heading">\n\t\t<p class="panel-title">\n\t\t\t<a class="collapsed" data-toggle="collapse" data-parent="#data-viewer-filters"\n\t\t\t\t href="#' + view._id + '-graphs-toolbar-filters">Data Filters</a>\n\t\t</p>\n\t</div>\n\t<div id="' + view._id + '-graphs-toolbar-filters" class="panel-collapse collapse">\n\n\t\t<div class="panel-body">\n\t\t\t<div class="row">\n\t\t\t\t<div class="col-xs-12 col-sm-4 col-md-4 text-center">\n\t\t\t\t\t<div><h6>View Mode</h6></div>\n\t\t\t\t\t<div class="btn-group btn-group-sm">\n\t\t\t\t\t\t<button data-toggle="dropdown" class="btn btn-default dropdown-toggle">Separated<span\n\t\t\t\t\t\t\t\tclass="caret"></span></button>\n\t\t\t\t\t\t<ul class="dropdown-menu">\n\t\t\t\t\t\t\t<li><input type="radio" id="' + view._id + '-separated" name="' + view._id + '-view-mode" value="separated" checked><label\n\t\t\t\t\t\t\t\t\tfor="separated">Separated</label></li>\n\t\t\t\t\t\t\t<li><input type="radio" id="' + view._id + '-combined" name="' + view._id + '-view-mode" value="combined"><label for="combined">Combined</label>\n\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t<li><input type="radio" id="' + view._id + '-synchronized" name="' + view.id + '-view-mode" value="synchronized"><label\n\t\t\t\t\t\t\t\t\tfor="synchronized">Synchronized</label></li>\n\t\t\t\t\t\t</ul>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="col-xs-12 col-sm-3 col-md-3 text-center">\n\t\t\t\t\t<div><h6>Average</h6></div>\n\t\t\t\t\t<div class="btn-group btn-group-sm text-center">\n\t\t\t\t\t\t<input type="checkbox" id="' + view._id + '-average-checkbox" name="' + view._id + '-average-checkbox" data-size="small">\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="col-xs-12 col-sm-5 col-md-5 text-center">\n\t\t\t\t\t<div><h6>Date Range</h6></div>\n\t\t\t\t\t<div class="btn-group btn-group-sm text-center">\n\t\t\t\t\t\t<div class="input-daterange input-group" id="' + view._id +'-datepicker">\n\t\t\t\t\t\t\t<input type="text" class="input-sm form-control" data-size="small" name="start"/>\n\t\t\t\t\t\t\t<span class="input-group-addon">to</span>\n\t\t\t\t\t\t\t<input type="text" class="input-sm form-control" data-size="small" name="end"/>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n</div>';

                // Toolbar
                var toolbar = '<div id="combined-graphs-menu" class="row">' +
                        '<div class="col-xs-10 col-xs-offset-1">' +
                        '<div class="panel-group graph-toolbar" id="'+ view._id + '-graphs-toolbar">';

                toolbar += sensorsSL;
                toolbar += filters;
                
                toolbar += '</div></div></div>';


                var plotArea = '<div class="text-center">' +
                    '<button id="' + view._id+ '-graphs-plot-button" type="button" class="btn btn-primary btn-sm graphs-plot-button">' +
                    '<span class="glyphicon glyphicon-triangle-right"></span> Plot' +
                    '</button>' +
                    '</div>' +
                    '<hr>' +
                    '<div id="' + view._id + '-plot-area"></div>';

                toolbar += plotArea;

                // log('Toolbar', toolbar);

                setTimeout(function() {

                    $("[id='"+view._id + "-average-checkbox']").bootstrapSwitch(); //OnOffSwitch
                    $("[id='"+view._id + "-datepicker']").datepicker();
                    $("[id='"+view._id + "-graphs-plot-button']").on('click', function(event) {
                        generateGraphs(view);
                    });

                }, 500);

                return toolbar;

            };

            if (_this_.views.length > 1) {

                tabLinks += '<li class="active"><a data-toggle="tab" href="#' + _this_.views[0]._id + '">'+ _this_.views[0].name + '</a></li>';
                tabs += '<div id="' + _this_.views[0]._id + '" class="tab-pane fade in active">' + genToolbar(_this_.views[0]) + '</div>';

                _this_.views.slice(1, _this_.views.length).forEach(function (view) {

                    tabLinks += '<li><a data-toggle="tab" href="#' + view._id + '">'+ view.name + '</a></li>';
                    tabs += '<div id="' + view._id + '" class="tab-pane fade">' + genToolbar(view) + '</div>';
                });

            } else {
                
                tabLinks += '<li class="active"><a data-toggle="tab" href="#' + _this_.views[0]._id + '">'+ _this_.views[0].name + '</a></li>';
                tabs += '<div id="' + _this_.views[0]._id + '" class="tab-pane fade in active">' + genToolbar(_this_.views[0]) + '</div>';
            
            }


            html += '<ul class="nav nav-tabs nav-justified">';
            html += tabLinks;
            html += '</ul>';
            // Header -- close

            // Tabs content
            html += '<div class="tab-content">';
            html += tabs;
            html += '</div>';

            html += '</div>';

            $('#' + _this_.id).replaceWith(html);




        },
        init: function () {

            var _this_ = this;
            var initContent = _this_.site ? 'No data is currently available for this site.' : NOT_SELECTED_SITE_WARNING;
            $('#' + _this_.id).replaceWith('<div id="' + _this_.id + '">' + initContent + '</div>');

        },
        clear: function () {

            var _this_ = this;
            _this_.site = null;
            _this_.views = null;

        }
    }];

DEBUG = true;