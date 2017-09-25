// Map
var map = null;
var center = {lat: 40.036577, lng: -75.342661};
var regionArray = []; 
var markers = [];
var selectedMarker = null;
var selectedMarkers = [];
var sensorArray = [];

// Info window
var infowindow = null;
var sensorJSONRaw = {};
var dummyCoords = [{x: 40.036602, y: -75.345526},
	{x: 40.036266, y: -75.340768},
	{x: 40.036568, y: -75.342916},
	{x: 40.036210, y: -75.338388},
	{x: 40.035802, y: -75.342565}];
var Sensors = [];
var selectedSensors = [];
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;

window.onkeydown = function(e) {
	console.log(e.which);
	ctrlPressed = ((e.keyIdentifier == 'Control') || (e.ctrlKey == true) || (e.which == 91));
};

window.onkeyup = function(e) {
	ctrlPressed = false;
};

/*
 * Initialize Map
*/
function initialize() {

	var mapOptions = {
		center: center,
		zoom: 17,
		scrollwheel: false
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	/* initialise the infowindows */
	infowindow = new google.maps.InfoWindow({
		content: "Waiting for content..."
	});
}

function loadSites() {
    if (sites.length) {
        return $.Deferred().resolve();
    }
    return $.ajax({
        url: "/getSites",
        dataType: "json",
        success: function (results) {
            $.each(results, function (i, site) {
                var sensors = [];
                site.sensors.forEach(function (sensor) {
                    sensors.push($.extend(new Sensor(), sensor));
                });
                newSite = $.extend(new Site(), site);
                newSite.sensors = sensors;
                sites.push(newSite);
            });
        }
    });
}

/*
 * Populate sites on map
*/
function populateSitesOnMap() {
	clearMap();
    $.when(loadSites()).done(function(results) {
        for (var s in sites) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(sites[s].location.x, sites[s].location.y),
                map: map,
                // label: "A",
                icon: {url: 'http://maps.gstatic.com/mapfiles/markers2/marker.png'},
                //animation: google.maps.Animation.DROP,
                title: sites[s].name
            });

            markers.push(marker);
            marker.setMap(map);
            bindInfoWindow(marker, map, infowindow, sites[s]);
        }
    });
}

var ctrlPressed = false;

function clearSelectedMarkers() {
	for (var i = 0; i < selectedMarkers.length; i++) {
		var m = selectedMarkers[i];
		m.setIcon({url: 'http://maps.google.com/mapfiles/ms/micons/red.png'});
	}
	selectedMarkers.length = 0;
}

function bindInfoWindow(marker, map, infowindow, site) {
	google.maps.event.addListener(marker, 'click', function () {
		if (ctrlPressed) {
			if (selectedMarkers.indexOf(marker) == -1) {
				selectedMarkers.push(marker);
				marker.setIcon({url: 'http://maps.gstatic.com/mapfiles/markers2/icon_green.png'});
				// marker.set(labelContent', 'labels[labelIndex++ % labels.length]);
				selectedSensors.push(site);
				updateSiteWindowPane();
			}
		}
		else {
			// Handle 1 selected marker on map
			clearSelectedMarkers();
			clearSelectedSensors();
			labelIndex = 0;
			selectedMarker = marker;
            indexSite = site._id;

			if (selectedMarkers.indexOf(marker) == -1) {
				// loadSiteData();
                // Place camera at center and on top of marker
				if (Dashboard.state.localeCompare("minimized") == 0)
					offsetCenter(marker.getPosition(), -($(window).width() * 0.15), 0);
				else
					map.panTo(marker.getPosition());

				selectedMarkers.push(selectedMarker);
				selectedSensors.push(site);
				//TODO: add local icon
				marker.setIcon({url: 'http://maps.gstatic.com/mapfiles/markers2/icon_green.png'});

                site.initView("site-about");

                // InfoWindow
                //TODO: Id of ballon should be the site id
                //TODO: Include this in Dom elements
                var windowContent = '<div class="site-overview-balloon">\n    <div class="site-overview-balloon-header"><h4>' + site.name + '</h4>\n        <ul class="nav nav-tabs nav-justified">\n            <li class="active"><a href="#AboutSite" data-toggle="tab">About this site</a></li>\n            <li><a href="#LMetrics" data-toggle="tab">Latest Metrics</a></li>\n        </ul>\n    </div>\n    <div class="site-overview-balloon-tab tab-content">\n        <div id = "AboutSite" class="about-site tab-pane fade in active">\n            ' + site.overview + '\n        </div>\n        <div id = "LMetrics" class="tab-pane fade tab-plot"></div>\n    </div>\n</div>';
                infowindow.setContent(windowContent);
                infowindow.open(map, marker);
                populateLastMetricsTab();

            }
		}
		// infoWindow Pane
		// infowindow.setContent("SensorID: " + sensor.id + "\n TimeValue: " + sensor.timeValue + "\nValue: " + sensor.value);
		// updateSiteWindowPane("SensorID: " + sensor.id + "/n TimeValue: " + sensor.timeValue + "/nValue: " + "+ sensor.value");
	});
}

function createMarkers(type) {
	//modify the views to handle different types of points
}

function getInfoContent(id) {
	var content;
	$.ajax({async: false, url: "http://127.0.0.1:5000/getInfoPane/" + id, success:function(result) { //change url
		content = result;
	}});
  return content;
}

function hideMarkers() {
	for(x in markers) {
		markers[x].setMap(null);
		//markers[x].remove();
	}
}

function clearMap() {
	hideMarkers();
	clearDashboard();
}

function toggleBounce() {
	if (marker.getAnimation() != null) {
		marker.setAnimation(null);
	} else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
	}
}

/*
	Moves the camera to latlng with an offset
	latlng is the apparent centre-point
	offsetx is the distance you want that point to move to the right, in pixels
	offsety is the distance you want that point to move upwards, in pixels
	offset can be negative
	offsetx and offsety are both optional
*/
function offsetCenter(latlng, offsetx, offsety) {
	var scale = Math.pow(2, map.getZoom());
	var nw = new google.maps.LatLng(
		map.getBounds().getNorthEast().lat(),
		map.getBounds().getSouthWest().lng()
	);
	var worldCoordinateCenter = map.getProjection().fromLatLngToPoint(latlng);
	var pixelOffset = new google.maps.Point((offsetx/scale) || 0,(offsety/scale) ||0)
	var worldCoordinateNewCenter = new google.maps.Point(
		worldCoordinateCenter.x - pixelOffset.x,
		worldCoordinateCenter.y + pixelOffset.y
	);

	var newCenter = map.getProjection().fromPointToLatLng(worldCoordinateNewCenter);
	// Set a tiny delay to avoid glitches while opening sidebar and shifting the map simultaneously
	setTimeout(function(){ map.panTo(newCenter); }, 30);
}

function clearSelectedSensors () {
	selectedSensors.length = 0;
}

//TODO: Remove this
function updateSiteWindowPane() {
	// var sensorsData = [];
	// if (selectedSensors.length == 1) {
	// 	populateLastMetricsTab();
	// } else {
	// 	for (sensor in selectedSensors) {
	// 		//TODO: Handle multiple selected sites
	// 	}
	// }
}

google.maps.event.addDomListener(window, 'load', initialize);