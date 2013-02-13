// Does basic Google maps loading and adding points from a file.

// Global map object.
var map = null;

// This is a map containing all of the click handler methods referenced in the
// XML file. Functions are written as functionName(arg1,arg2,...). It should be
// populated by the page that calls this script. Each function takes a single 
// param; the args specified in the xml file, as a string.
var clickHandlers = new Array();

function CreateMap(divID, addControls) {
  // This method sets up the Google Maps object. We can't configure the Google
  // Maps object until the map object in the HTML has been created.
  var mapOptions = {};
  if (addControls === undefined || addControls) {
    mapOptions.zoomControl = true;
    mapOptions.panControl = true;
    mapOptions.mapTypeControl = true;
    mapOptions.scaleControl = true;
  } else {
    mapOptions.disableDefaultUI = true;
  }
  map = new google.maps.Map(document.getElementById(divID), mapOptions);
}

function LoadMapData(filename) {
  var request = new XMLHttpRequest;
  request.open('GET', filename, true);
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      ProcessXML(request.responseXML);
    }
  };
  request.send(null);
}

function ProcessXML(xmlDoc) {
  var lines = xmlDoc.documentElement.getElementsByTagName('line');
  for (var a = 0; a < lines.length; a++) {

    // Get line attributes.
    var colour = lines[a].getAttribute('colour');
    var width = lines[a].getAttribute('width');
    var name = lines[a].getAttribute('name');
    var defaultMarkerImage = lines[a].getAttribute('defaultMarkerImage');
    var defaultShadowImage = lines[a].getAttribute('defaultShadowImage');
    var clickHandler = lines[a].getAttribute('clickHandler');
    // Set defaults.
    if (colour == null) {
      colour = '#0000FF';
    }
    width = width == null ? 2 : Math.max(0, parseFloat(width));
    if (defaultMarkerImage == null) {
      defaultMarkerImage = 'none';
    }
    if (defaultShadowImage == null) {
      defaultShadowImage = 'standardShadow.png';
    }
    //console.log('Read line: ' + name + ', ' + width + 'px, ' + colour +
    //    ', ' + defaultMarkerImage + ', ' + defaultShadowImage);

    // Read each point on that line.
    var points = lines[a].getElementsByTagName('point');
    var pts = [];
    for (var i = 0; i < points.length; i++) {
      // Read marker properties.
      var lat = parseFloat(points[i].getAttribute('lat'));
      var lng = parseFloat(points[i].getAttribute('lng'));
      var location = points[i].getAttribute('location');
      var description = points[i].getAttribute('description');
      var markerImage = points[i].getAttribute('markerImage');
      var shadowImage = points[i].getAttribute('shadowImage');
      var markerClickHandler = points[i].getAttribute('clickHandler');
      
      var point = new google.maps.LatLng(lat,lng);
      pts[i] = point;

      // Apply defaults.
      if (markerImage == null) {
        markerImage = defaultMarkerImage;
      }
      if (shadowImage == null) {
        shadowImage = defaultShadowImage;
      }
      //console.log('Read marker: ' + point + ', ' + location + ', ' +
      //    description + ', ' + clickHandler + ', ' + markerImage + ', ' +
      //    shadowImage);

      // Add marker if marker image is not 'none'.
      if (markerImage != 'none') {
        var funcAndArgs = parseClickHandler(markerClickHandler);
	AddMarker(point, CreateMarker(markerImage, shadowImage), location,
            description, funcAndArgs.func, funcAndArgs.args);
      }
    }
    // Add line unless width is zero.
    if (points.length > 1 && width > 0) {
      var funcAndArgs = parseClickHandler(clickHandler);
      AddLine(pts, colour, width, funcAndArgs.func, funcAndArgs.args);
    }
  } // End loop over lines.
}

function parseClickHandler(clickHandler) {
  var func = null;
  var args = null;
  if (clickHandler != null) {
    var x = clickHandler.indexOf('(');
    var y = clickHandler.indexOf(')');
    var functionName = clickHandler.substring(0, x);
    args = clickHandler.substring(x + 1, y);
    func = clickHandlers[functionName];
  }
  return {func: func, args: args};
}

// Need to use a function to add listener to bind args.
function AddLine(pts, colour, width, clickHandler, clickHandlerArgs) {
  var polyline = new google.maps.Polyline({
    path: pts,
    strokeColor: colour,
    strokeWeight: width,
    strokeOpacity: 0.5,
    map: map,
  });
  if (clickHandler != null) {
    polyline.addListener('click', function() {
      clickHandler(clickHandlerArgs);
    }); 
  }
}

// Note that clickHandlerArgs may be of any type, as this function can be used
// directly, as well as when parsing an XML route file.
function AddMarker(coords, marker, location, description, clickHandler,
    clickHandlerArgs) {
  marker.setPosition(coords);

  // If there's a location, add a tooltip. If there's a description, add it to
  // the tooltip.
  if (location) {
    var title = location;
    if (description) {
      title += ' : ' + description;
    }
    marker.setTitle(title);
  }

  // If there's a valid click handler, make the marker clickable.
  if (clickHandler != null) {
    marker.setClickable(true);
    marker.addListener('click', function() {
      clickHandler(clickHandlerArgs);
    }); 
  }

  marker.setMap(map);
}

function CreateMarker(markerImage, shadowImage) {
  if (!markerImage) {
    throw new Error('Marker image not supplied!');
  }
  var icon = new google.maps.MarkerImage();
  var path = pathToScripts + 'Scripts/MapIcons/';
  icon.url = path + markerImage;

  // TODO : Dirty hack
  if (markerImage == 'endOfLine.png' || markerImage == 'smallMarkerRed.png') {
    icon.size = new google.maps.Size(9, 9);
    icon.anchor = new google.maps.Point(5, 5);
    var anchorPoint = new google.maps.Point(5, 5);
  } else if (markerImage == 'tandem.png') {
    icon.size = new google.maps.Size(51, 61);
    icon.anchor = new google.maps.Point(26, 61);
    var anchorPoint = new google.maps.Point(6, 20);
  } else {
    icon.size = new google.maps.Size(12, 20);
    icon.anchor = new google.maps.Point(6, 20);
    var anchorPoint = new google.maps.Point(6, 20);
    if (shadowImage) {
      var shadow = {};
      shadow.url = path + shadowImage;
      shadow.anchor = new google.maps.Point(6, 20);
      shadow.size = new google.maps.Size(22, 20);
    }
  }
  var options = {icon: icon, anchorPoint: anchorPoint};
  if (shadowImage) {
    options.shadow = shadow;
  }
  return new google.maps.Marker(options);
}
// Adds geocoding stuff for Google maps

// The goecoder object
var geocoder = null;
var geocoderErrorCodes=[];

function CreateGeocoder() {
  geocoder = new GClientGeocoder();
  // Error codes
  geocoderErrorCodes[G_GEO_SUCCESS] = 'Success';
  geocoderErrorCodes[G_GEO_MISSING_ADDRESS] =
      'Missing Address: The address was either missing or had no value.';
  geocoderErrorCodes[G_GEO_UNKNOWN_ADDRESS] =
      'Unknown Address:  No corresponding geographic location could be ' +
      'found for the specified address.';
  geocoderErrorCodes[G_GEO_UNAVAILABLE_ADDRESS] =
      'Unavailable Address:  The geocode for the given address cannot be ' +
      'returned due to legal or contractual geocoderErrorCodes.';
  geocoderErrorCodes[G_GEO_BAD_KEY] =
      'Bad Key: The API key is either invalid or does not match the domain ' +
      'for which it was given';
  geocoderErrorCodes[G_GEO_TOO_MANY_QUERIES] =
      'Too Many Queries: The daily geocoding quota for this site has been ' +
      'exceeded.';
  geocoderErrorCodes[G_GEO_SERVER_ERROR] =
      'Server error: The geocoding request could not be successfully ' +
      'processed.';
}
