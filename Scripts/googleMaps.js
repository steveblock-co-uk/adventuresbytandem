// Does basic Google maps loading and adding points from a file.

// Global map object.
var map = null;

// This is a map containing all of the click handler methods referenced in the
// XML file. Functions are written as functionName(arg1,arg2,...). It should be
// populated by the page that calls this script. Each function takes a single 
// param; the args specified in the xml file, as a string.
var clickHandlers = new Array();

function LoadGoogleMaps(mapId, onLoadHandler, addControls) {
  google.load('maps', '2');
  google.setOnLoadCallback(function() {
    document.onunload = GUnload;
    CreateMap(mapId, addControls);
    onLoadHandler();
  });
}

function CreateMap(divID, addControls) {
  // This method sets up the Google Maps object. We can't configure the Google
  // Maps object until the map object in the HTML has been created.
  if (!GBrowserIsCompatible()) {
    document.getElementById(divID).innerHTML =
        'Browser not compatible with Google Maps!';
    return;
  }
  map = new GMap2(document.getElementById(divID));
  if (addControls === undefined || addControls) {
    map.addControl(new GLargeMapControl());
    map.addControl(new GMapTypeControl());
    map.addControl(new GScaleControl());
  }
  map.enableScrollWheelZoom();
}

function LoadMapData(filename) {
  var request = GXmlHttp.create();
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
      
      var point = new GLatLng(lat,lng);
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
	AddMarker(point, CreateMarkerIcon(markerImage, shadowImage), location,
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
  var polyline = new GPolyline(pts,colour,width);
  if (clickHandler != null) {
    GEvent.addListener(polyline, 'click', function(point) {
      clickHandler(clickHandlerArgs);
    }); 
  }
  map.addOverlay(polyline);
}

// Note that clickHandlerArgs may be of any type, as this function can be used
// directly, as well as when parsing an XML route file.
function AddMarker(coords, theIcon, location, description, clickHandler,
    clickHandlerArgs) {
  var options = {icon: theIcon};

  // If there's a location, add a tooltip. If there's a description, add it to
  // the tooltip.
  if (location) {
    options.title = location;
    if (description) {
      options.title += ' : ' + description;
    }
  }

  // If there's a valid click handler, make the marker clickable.
  options.clickable = false;
  if (clickHandler != null) {
    options.clickable = true;
  }

  var marker = new GMarker(coords, options);

  if (options.clickable) {
    GEvent.addListener(marker, 'click', function(point) {
      clickHandler(clickHandlerArgs);
    }); 
  }
  map.addOverlay(marker);
}

function CreateMarkerIcon(markerImage, shadowImage) {
  if (!markerImage) {
    throw new Error('Marker image not supplied!');
  }
  if (!shadowImage) {
    throw new Error('Shadow image not supplied!');
  }
  var icon = new GIcon();
  var path = pathToScripts + 'Scripts/MapIcons/';
  icon.image = path + markerImage;
  icon.shadow = path + shadowImage;
  // TODO : Dirty hack
  if (markerImage == 'endOfLine.png' || markerImage == 'smallMarkerRed.png') {
    icon.iconSize = new GSize(9, 9);
    icon.shadowSize = new GSize(0, 0);
    icon.iconAnchor = new GPoint(5, 5);
    icon.infoWindowAnchor = new GPoint(5, 5);
  } else if (markerImage == 'tandem.png') {
    icon.iconSize = new GSize(51, 61);
    icon.shadowSize = new GSize(0, 0);
    icon.iconAnchor = new GPoint(26, 61);
    icon.infoWindowAnchor = new GPoint(6, 20);
  } else {
    icon.iconSize = new GSize(12, 20);
    icon.shadowSize = new GSize(22, 20);
    icon.iconAnchor = new GPoint(6, 20);
    icon.infoWindowAnchor = new GPoint(6, 20);
  }
  return icon;
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
