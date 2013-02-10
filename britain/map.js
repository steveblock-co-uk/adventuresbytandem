// script for the map component of PBM.html

// This is a map containing all of the ClickHandler methods referenced in the XML file
// Functions are written as functionName(arg1,arg2,...)
// It should be populated by the page that calls this script
// Each function takes 3 params
// - the marker clicked (if any)
// - the point clicked (if not a marker)
// - the args specified in the xml file, as a string
// Here, the args is just the ID of the day to show
googleMapsClickHandler[ 'ShowDay' ] = function( marker, point, index ){ 
  // The arguments gets passed as strings
  // Convert index to integer to make thigs work properly
  ShowDay( parseFloat( index ), false );
};

function ConfigureMap() {
  CreateMap( 'map' );
  LoadMapData( 'map.xml' );
  // Must call set center to display map
  // Can't set map type until we've done this
  ResetMap();
  // map.setMapType( G_HYBRID_MAP );
}

function MoveMap( index ) {
  // We pan to the specified position, at a zoom level between 6 and 8
  // The idea is that this view is wide enough to see the whole day's route, but narrow enough that it still
  // feels like the map 'follows' the route.
  // (At zoom 6 you can see the width of the country to maintain persepctive)
  var MIN_ZOOM_LEVEL = 7;
  var MAX_ZOOM_LEVEL = 8;
  var lat = days.Day(index).lat;
  var lng = days.Day(index).lng;
  if( lat!=null && lng!=null ) {
    var z = map.getZoom();
    if( z > MAX_ZOOM_LEVEL ) {
      map.setZoom( 8 );
    } else if ( z < MIN_ZOOM_LEVEL ) {
      map.setZoom( MIN_ZOOM_LEVEL );
    }
    map.panTo( new GLatLng( lat, lng ) );
  }
}

function ResetMap() {
  map.setCenter( new GLatLng( 54.8, -4.0 ), 5 );
}

function ResizeMap( windowSize ) {
  document.getElementById("map").style.height = ( windowSize.height - 380 ) + 'px';
}
