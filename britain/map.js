// Here, args is just the ID of the day to show
clickHandlers['ShowDay'] = function(args) {
  // Convert index to integer to make thigs work properly
  ShowDay( parseFloat( args ), false );
};

function ConfigureMap() {
  LoadMapData( 'map.xml' );
  // Must call set center to display map
  // Can't set map type until we've done this
  ResetMap();
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
