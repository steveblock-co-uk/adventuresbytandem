var imageSize = 640;
var imageSpacing = 20;
// Note that if we request an image size greater than the original photo, we only get the original, but the feed describes
// dimensions equal to the request, not the image. Some of the photos are only 640x480.
// If we request n thumb sizes, we get exactly n thumbs

var numPhotos = null;
var timer = null;

function ConfigurePhotos() {
  // Called from onload
  // Add handler to call this every time the scroll bar is moved
  document.getElementById( 'photosScroller' ).onscroll = function() {
    UpdateArrows( GetClosestIndex() );
  }
}

function ShowPhotos( index ) {
  // Show status indicator
  document.getElementById( 'photosStatus' ).style.visibility = 'visible';

  var photos = allPhotos[days.Day( index ).tag];
  numPhotos = photos.length;

  if( numPhotos > 0 ) {
    // Set width of photos div to force photosScroller to expand horizontally, rather than vertically
    document.getElementById( 'photos' ).style.width = ((imageSize+imageSpacing)*numPhotos) + 'px';
    document.getElementById( 'photos' ).innerHTML = '';
    AddPhotos( photos );
  } else {
    document.getElementById( 'photos' ).style.width = '100%';
    document.getElementById( 'photos' ).innerHTML = '<p style="text-align: center;">Too busy pedalling for photos today!</p>';
  }

  // Hide status indicator
  document.getElementById( 'photosStatus' ).style.visibility = 'hidden';

  // Jump to left-most extent
  // Don't use ScrollToPhoto, because slising is slow!
  document.getElementById( 'photosScroller' ).scrollLeft = 0;
  UpdateArrows( 1 );
}

function AddPhotos( photos ) {

  // TODO - set photo order?

  for( var i=0; i<numPhotos; i++ ) {
    var caption  = photos[i].caption;
    var url      = "photos/" + photos[i].filename;
    var aspectRatio = photos[i].width / photos[i].height;
    var width       = aspectRatio >= 1 ? imageSize : imageSize * aspectRatio;
    var height      = aspectRatio <= 1 ? imageSize : imageSize / aspectRatio;

    var n = caption.indexOf( ':' );
    var tag = caption.substring( 0, n );
    var ramble = caption.substring( n+1 );

    document.getElementById( 'photos' ).innerHTML
      += '<div class="photoBox" id="photo' + (i+1) + '" style="width:' + imageSize +'px; margin-right:' + imageSpacing + 'px;">'
      +  '  <img class="photo" src="' + url + '" alt="' + tag + '" '
      +       'style="width:' + width + 'px; height:' + height + 'px; margin-top:' + (imageSize-height)/2 + 'px;">'
      +  '  <div class="tag">' + tag + '</div>'
      +  '  <div class="ramble">' + ramble + '</div>'
      +  '</div>';
  }
}

function UpdateArrows( index ) {
  if( index <= 1 ) {
    document.getElementById( 'photoPrev' ).style.visibility = 'hidden';
  } else {
    document.getElementById( 'photoPrev' ).style.visibility = 'visible';
  }
  if( index >= numPhotos ) {
    document.getElementById( 'photoNext' ).style.visibility = 'hidden';
  } else {
    document.getElementById( 'photoNext' ).style.visibility = 'visible';
  }
}

function GetClosestIndex() {

  // Find the index of the image we're closest to
  var currentPos    = document.getElementById( 'photosScroller' ).scrollLeft;
  var firstImagePos = document.getElementById( 'photo1' ).offsetLeft - 10; // account for padding
  var lastImagePos  = document.getElementById( 'photo' + numPhotos ).offsetLeft - 10; // account for padding
  var closestIndex = null;
  if( currentPos < firstImagePos ) {
    closestIndex = 1;
  } else if( currentPos > lastImagePos ) {
    closestIndex = numPhotos;
  } else {
    var leftImagePos  = null;
    var rightImagePos = firstImagePos;
    for( var i=2; i<=numPhotos; i++ ) {
      leftImagePos = rightImagePos;
      rightImagePos = document.getElementById( 'photo' + i ).offsetLeft - 10; // account for padding
      // Break when the right-hand image is beyond our scroll position
      if( rightImagePos >= currentPos ) {
        break;
      }
    }
    // Select which image we're closest to
    // i is the index of the right image
    if( currentPos < ( leftImagePos + rightImagePos ) / 2 ) {
      closestIndex = i-1;
    } else {
      closestIndex = i;
    }
  }
  // alert( 'i=' + i + ' currentPos=' + currentPos + ' leftImagePos=' + leftImagePos + ' rightImagePos=' + rightImagePos );
  return closestIndex;
}

function Scroll( next ) {

  var closestIndex = GetClosestIndex();
  if( ( closestIndex == 1 && !next ) || ( closestIndex == numPhotos && next ) ) {
    alert( 'scroll error!' );
    return;
  }

  // Get position of target
  var targetIndex = null;
  if( next ) {
    targetIndex = closestIndex + 1;
  } else {
    targetIndex = closestIndex - 1;
  }
  var targetPos = document.getElementById( 'photo' + targetIndex ).offsetLeft - 10; // account for padding
  
  // Scroll to target pos
  var command = 'ScrollToTarget( ' + targetPos + ', ' + next + ' );';
  timer = window.setInterval( command, 1 );
}

function ScrollToTarget( targetPos, next ) {
  var increment = null;
  if( next ) {
    increment = +30;
  } else {
    increment = -30;
  }
  var scroller = document.getElementById( 'photosScroller' );
  if( Math.abs( targetPos - scroller.scrollLeft ) > Math.abs( increment ) ) {
    scroller.scrollLeft += increment;
  } else {
    scroller.scrollLeft = targetPos;
    window.clearInterval( timer );
  }
}
