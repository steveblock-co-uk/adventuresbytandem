var mapOverlays = new Array();
function AddLine( pts, colour, width, clickHandler ) {
  // A hack for CanadaByTandem. Add two lines, one thick red, one thin blue.
  var redLine = new GPolyline(pts,'#FF0000',6);
  var blueLine = new GPolyline(pts,'#0000FF',3);
  redLine.hide();
  map.addOverlay( redLine );
  map.addOverlay( blueLine );
  mapOverlays.push( { redLine: redLine, blueLine: blueLine} );
}
