// script for the blog component of PBM.js

var blogID = '422819841918559779';

function ShowBlog( index ) {
  // Update status
  document.getElementById( 'blogStatus' ).style.visibility = 'visible';
  // Create script to make request
  var script = document.createElement('script');
  script.setAttribute('src', 'http://www.blogger.com/feeds/' + blogID + '/posts/default/' + days.Day(index).blogID + '?alt=json-in-script&callback=OnFetchedBlog' );
  script.setAttribute('type', 'text/javascript');
  document.documentElement.firstChild.appendChild(script);
}

function OnFetchedBlog( root ) {
  var entry = root.entry;
  document.getElementById("title").innerHTML = entry.title.$t;
  var mileage = days.Day(currentIndex).mileage;
  if( mileage > 0 ) {
    document.getElementById("mileage").innerHTML = mileage + ' miles';
  } else {
    document.getElementById("mileage").innerHTML = '';
  }
  document.getElementById( 'blog' ).innerHTML = entry.content.$t;
  document.getElementById( 'blogStatus' ).style.visibility = 'hidden';
  var blogPrev = document.getElementById( 'blogPrev' );
  if( currentIndex > 0 ) {
    blogPrev.style.visibility = 'visible';
  } else {
    blogPrev.style.visibility = 'hidden';
  }
  var blogNext = document.getElementById( 'blogNext' );
  if( currentIndex < days.NumDays()-1 ) {
    blogNext.style.visibility = 'visible';
  } else {
    blogNext.style.visibility = 'hidden';
  }
}
