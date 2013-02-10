function Size( width, height ) {
  this.width=width;
  this.height=height;
}

Size.prototype.AspectRatio = function() {
  return this.width / this.height;
}

Size.prototype.Print = function() {
  return '( ' + this.width + ', ' + this.height + ' )';
}

function StripQuotes( s ) {
  var len = s.length;
  var c1 = s.charAt(0);
  var c2 = s.charAt(len-1);
  if( ( c1 == "'" && c2 == "'" ) || ( c1 == '"' && c2 == '"' ) ) {
    return s.substring( 1, len-1 );
  }
  return s;
}

// Function to fit an object to a given box
function FitToBoundingBox(box, objectAR) {
  var boxAR    = box.AspectRatio();
  var resized = null;
  if( objectAR > boxAR ) { // width limits
    resized = new Size( box.width, box.width / objectAR );
  } else { // height limits
    resized = new Size( box.height * objectAR, box.height );
  }
  return resized;
}

function GetWindowSize() {
  var width  = document.documentElement.clientWidth;
  var height = document.documentElement.clientHeight;
  var scrollbarThickness = 17;
  if( window.scrollMaxX > 0 ) { height-=scrollbarThickness; }
  if( window.scrollMaxY > 0 ) { width-=scrollbarThickness; }
  var size = new Size( width, height );
  return size;
}
