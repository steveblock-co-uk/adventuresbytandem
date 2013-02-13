var mapOverlays = new Array();
function AddLine(pts, colour, width, clickHandler) {
  // A hack for CanadaByTandem. Add two lines, one thick red, one thin blue.
  var redLine = new google.maps.Polyline({
    path: pts,
    strokeColor: '#FF0000',
    strokeWeight: 6,
    strokeOpacity: 0.5,
    map: map,
  });
  var blueLine = new google.maps.Polyline({
    path: pts,
    strokeColor: '#0000FF',
    strokeWeight: 3,
    strokeOpacity: 0.5,
    map: map,
  });
  redLine.setVisible(false);
  mapOverlays.push({
    redLine: redLine,
    blueLine: blueLine
  });
}
