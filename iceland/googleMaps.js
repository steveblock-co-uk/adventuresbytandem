// Does basic Google maps loading and adding points from a file

// Global map object
var map = null;

// Need to work out a way to be able to pass Google Maps constants to this function.
// Problem is they're not defined until we get the onload callback.
function LoadGoogleMaps(mapId, mapStatus, onLoadHandler) {
  google.load( 'maps', '2' );
  google.setOnLoadCallback(function() {
    document.onload = GUnload;
    CreateMap(mapId);
    map.setCenter( new GLatLng(mapStatus.latitude, mapStatus.longitude), mapStatus.zoom /*, mapStatus.type*/);
    onLoadHandler();
  });
}

function CreateMap( divID ) {
  // This method sets up the Google Maps object
  // We can't configure the Google Maps object until the map object in the HTML has been created.
  if( !GBrowserIsCompatible() ) {
    document.getElementById( divID ).innerHTML = "Browser not compatible with Google Maps!";
    return;
  }
  map = new GMap2(document.getElementById(divID));
  //map.addControl( new GLargeMapControl() );
  //map.addControl( new GMapTypeControl() );
  //map.addControl( new GScaleControl() );
  map.enableScrollWheelZoom();
}

function LoadMapData( mapData ) {
  var lines = mapData.lines;
  for (var a = 0; a < lines.length; a++) {

    // get line attributes
    var colour              = lines[a].colour;
    var width               = lines[a].width;
    var name                = lines[a].name;
    var defaultMarkerImage  = lines[a].defaultMarkerImage;
    var defaultShadowImage  = lines[a].defaultShadowImage;
    var clickHandler        = lines[a].clickHandler;
    // Set defaults
    if( colour == null) { colour = "#0000FF"; }
    if( width == null ) { width = 2; } else { width = parseFloat( width ); }
    if( width<0 ) { width = 0; }
    if( defaultMarkerImage == null) { defaultMarkerImage = "none"; }
    if( defaultShadowImage == null) { defaultShadowImage = "standardShadow.png"; }
    //alert( 'Read line: ' + name + ', ' + width + 'px, ' + colour + ', ' + defaultMarkerImage + ', ' + defaultShadowImage );

    // read each point on that line
    var points = lines[a].points;
    var pts = [];
    for (var i = 0; i < points.length; i++) {
      // Read marker properties
      var lat                = points[i].lat;
      var lng                = points[i].lng;
      var location           = points[i].location;
      var description        = points[i].description;
      var markerImage        = points[i].markerImage;
      var shadowImage        = points[i].shadowImage;
      var markerClickHandler = points[i].clickHandler;
      
      var point = new GLatLng(lat,lng);
      pts[i] = point;

      // Apply defaults
      if( markerImage == null ) { markerImage = defaultMarkerImage; }
      if( shadowImage == null ) { shadowImage = defaultShadowImage; }
      // alert( 'Read marker: ' + point + ', ' + location + ', ' + description + ', ' + clickHandler + ', ' + markerImage + ', ' + shadowImage );

      // Add marker if marker image is not "none"
      if( markerImage != "none" ) {
        AddMarker( point, CreateMarkerIcon( markerImage, shadowImage ), location, description, markerClickHandler );
      }
    }
    // Add line unless width is zero
    if( points.length > 1 && width > 0 ) {
      AddLine( pts, colour, width, clickHandler );
    }
  } // end loop over lines
}

// Need to use a function to add listener, so that variables we pass to GEvent are locals and won't be changed
function AddLine( pts, colour, width, clickHandler ) {
  var polyline = new GPolyline(pts,colour,width,0.7);
  // if there's a valid click handler, make the line clickable
  if( clickHandler != null ) {
    var x = clickHandler.indexOf( '(' );
    var y = clickHandler.indexOf( ')' );
    var functionName = clickHandler.substring( 0, x );
    var args = clickHandler.substring( x+1, y );
    // TODO
    // var func = googleMapsClickHandler[ functionName ];
    if( func != null ) {
      GEvent.addListener( polyline, 'click', function(point) { func( null, point, args ); } ); 
    }
  }
  map.addOverlay( polyline );
}

function AddMarker( coords, theIcon, location, description, clickHandler, customArgsArray ) {
  var options = { icon: theIcon };

  // If there's a location, add a tooltip
  // If there's a description, add it to the tooltip
  if( location ) {
    options.title = location;
    if( description ) {
      options.title += ' : ' + description;
    }
  }

  // if there's a valid click handler, make the marker clickable
  options.clickable = false;
  if( clickHandler != null ) {
    options.clickable = true;
  }

  var marker = new GMarker( coords, options );

  if( options.clickable ) {
    // This doesn't work - need extra level of indirection
    // GEvent.addListener( marker, 'click', func(customArgsArray) ); 
    GEvent.addListener( marker, 'click', function(point) { clickHandler( marker, point, customArgsArray ); } ); 
  }
  map.addOverlay(marker);
}

function CreateMarkerIcon( markerImage, shadowImage ) {
  // icon.image = "http://labs.google.com/ridefinder/images/mm_20_red.png";
  // icon.shadow = "http://labs.google.com/ridefinder/images/mm_20_shadow.png";
  if( !markerImage ) {
    alert( "Marker image not supplied!" );
  }
  if( !shadowImage ) {
    alert( "Shadow image not supplied!" );
  }
  var icon = new GIcon();
  var path = pathToScripts + 'Scripts/MapIcons/';
  icon.image  = path + markerImage;
  icon.shadow = path + shadowImage;
  // TODO : Dirty hack
  if( markerImage == "endOfLine.png" || markerImage == "smallMarkerRed.png" ) {
    icon.iconSize = new GSize( 9, 9 );
    icon.shadowSize = new GSize( 0, 0 );
    icon.iconAnchor = new GPoint( 5, 5 );
    icon.infoWindowAnchor = new GPoint( 5, 5 );
  } else if (markerImage == "tandem.png") {
    icon.iconSize = new GSize( 51, 61 );
    icon.shadowSize = new GSize( 0, 0 );
    icon.iconAnchor = new GPoint( 26, 61 );
    icon.infoWindowAnchor = new GPoint( 6, 20 );
  } else {
    icon.iconSize = new GSize( 12, 20 );
    icon.shadowSize = new GSize( 22, 20 );
    icon.iconAnchor = new GPoint( 6, 20 );
    icon.infoWindowAnchor = new GPoint( 6, 20 );
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
  geocoderErrorCodes[G_GEO_SUCCESS]            = "Success";
  geocoderErrorCodes[G_GEO_MISSING_ADDRESS]    = "Missing Address: The address was either missing or had no value.";
  geocoderErrorCodes[G_GEO_UNKNOWN_ADDRESS]    = "Unknown Address:  No corresponding geographic location could be found for the specified address.";
  geocoderErrorCodes[G_GEO_UNAVAILABLE_ADDRESS]= "Unavailable Address:  The geocode for the given address cannot be returned due to legal or contractual geocoderErrorCodes.";
  geocoderErrorCodes[G_GEO_BAD_KEY]            = "Bad Key: The API key is either invalid or does not match the domain for which it was given";
  geocoderErrorCodes[G_GEO_TOO_MANY_QUERIES]   = "Too Many Queries: The daily geocoding quota for this site has been exceeded.";
  geocoderErrorCodes[G_GEO_SERVER_ERROR]       = "Server error: The geocoding request could not be successfully processed.";
}

/*
A note on KML files ...

KML files are GMaps specific
The marker objects don't support tooltips
They don't allow JS in the tags (for CSC attack reasons)
You can't access the created objects (markers, lines etc) programatically
So there's no way to get tooltips or to get the rest of the page to respond to a click on the map
So stick to my own format
*/
