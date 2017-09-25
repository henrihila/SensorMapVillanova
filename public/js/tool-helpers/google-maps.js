// Map
var map = null;
var center = {lat: 40.036577, lng: -75.342661};
var markers = [];
var selectedMarker = null;
var selectedMarkers = [];

// Info window
var infowindow = null;
var selectedSensors = [];
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;

var minZoom = 7;
var maxZoom = 15;
var bounds = new google.maps.LatLngBounds();

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
		zoom: minZoom,
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
		map.fitBounds(bounds);
        return $.Deferred().resolve();
    }

    return $.ajax({
		type: 'GET',
        url: API.SITES,
		crossDomain: false,
        dataType: "json",
		success: function (results) {

            $.each(results, function (i, site) {

            	console.log(site);

                var sensors = [];
                site.sensors.forEach(function (sensor) {
                	//console.log(sensor);
                    sensors.push($.extend(new Sensor(), sensor));
                });

				var newSite = $.extend(new Site(), site);
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

	clearData();

    $.when(loadSites()).done(function(results) {

		if (sites.length) {

			log('sites', sites);
			for (var s in sites) {
				// log('Placing marker', sites[s].location.geo);
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(sites[s].location.geo[1], sites[s].location.geo[0]),
					map: map,
					// label: "A",
					icon: {url: 'http://maps.gstatic.com/mapfiles/markers2/marker.png'},
					animation: google.maps.Animation.DROP,
					title: sites[s].name
				});

				markers.push(marker);
				marker.setMap(map);
				bounds.extend(marker.position);

				bindInfoWindow(marker, map, infowindow, sites[s]);
			}

			map.fitBounds(bounds);

		} else {

            $('#noSitesFound').modal();

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

//Adding click listeners to markers in map
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

				// log('Selected site', site);

                // Place camera at center and on top of marker
				if (Dashboard.state.localeCompare("minimized") == 0)
					offsetCenter(marker.getPosition(), -($(window).width() * 0.15), 0);
				else
					map.panTo(marker.getPosition());

				selectedMarkers.push(selectedMarker);
				selectedSensors.push(site);
				//TODO: add local icon
				marker.setIcon({url: 'http://maps.gstatic.com/mapfiles/markers2/icon_green.png'});
				
                // InfoWindow
                //TODO: Id of ballon should be the site id

				var markerSection = '<div id="site-marker-section"></div>';

                infowindow.setContent(markerSection);
				infowindow.open(map, marker);

				ViewsManager.populateSections(site);

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


var clearData = function () {

	hideMarkers();
	clearDashboard();
	ViewsManager.reset();
	ViewsManager.initSections();

};

function clearMap() {

	clearData();
	smoothZoom(map, minZoom, map.getZoom(), false);

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

// Smooth zoom function: http://stackoverflow.com/questions/4752340/how-to-zoom-in-smoothly-on-a-marker-in-google-maps
function smoothZoom (map, level, cnt, mode) {
	//alert('Count: ' + cnt + 'and Max: ' + level);

	// If mode is zoom in
	if (mode == true) {

		if (cnt >= level) {
			return;
		}
		else {
			var z = google.maps.event.addListener(map, 'zoom_changed', function (event) {
				google.maps.event.removeListener(z);
				smoothZoom(map, level, cnt + 1, true);
			});
			setTimeout(function () {
				map.setZoom(cnt)
			}, 80);
		}
	} else {
		if (cnt <= level) {
			return;
		}
		else {
			var z = google.maps.event.addListener(map, 'zoom_changed', function (event) {
				google.maps.event.removeListener(z);
				smoothZoom(map, level, cnt - 1, false);
			});
			setTimeout(function () {
				map.setZoom(cnt)
			}, 80);
		}
	}
}

google.maps.event.addDomListener(window, 'load', initialize);