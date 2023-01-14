var blogID = '514366542416623469';

function LoadBlogData() {
  document.getElementById('blogText').innerHTML = 'Fetching blog posts ...';
  var script = document.createElement('script');
  script.setAttribute('src', 'https://www.blogger.com/feeds/' + blogID + '/posts/default?alt=json-in-script&callback=OnFetchedBlog' );
  script.setAttribute('type', 'text/javascript');
  document.documentElement.firstChild.appendChild(script);
}

function OnFetchedBlog(root) {
  var feed = root.feed;
  var numEntries = feed['openSearch$totalResults'].$t;

  if (numEntries == 0) {
    document.getElementById('blogText').innerHTML =
        'The adventure starts August 10th.<br><br>' +
        'Check back soon to see our updates from the road ...';
    return;
  }
  document.getElementById('more').style.display = 'block';

  var entries = feed.entry;
  for (var i = 0; i < numEntries; i++) {
    var entry = entries[i];

    var title = entry.title.$t;
    //var date = entry.published.$t;
    var content = entry.content.$t.replace(/http:\/\//g, "https://");;

    var blogRaw = document.createElement('div');
    blogRaw.innerHTML = content;
    var locationElements = blogRaw.getElementsByTagName('location');
    if (locationElements.length == 1) {
      var location = locationElements[0].getAttribute('name');
      var lat = locationElements[0].getAttribute('lat');
      var lng = locationElements[0].getAttribute('lng');
      var date = locationElements[0].getAttribute('date');
      //alert(name + lat + lng);
      var point = new google.maps.LatLng(lat,lng);
      var argsArray = [title, location, date, content];
      AddMarker(point,
                CreateMarker('tandem.png'),
                location,
                null,
                ShowBlog,
                argsArray);
    }
    // Show last post by default
    if (i == 0) {
      ShowBlog(argsArray); 
    }
  }
}

function ShowBlog(argsArray) {
  var blogText = argsArray[1];
  var blogTitleElement = document.getElementById('blogTitle');
  if (blogTitleElement) {
    blogTitleElement.innerHTML = argsArray[0];
  }
  var blogLocationElement = document.getElementById('blogLocation');
  if (blogLocationElement) {
    blogLocationElement.innerHTML = argsArray[1] + ', ';
  }
  var blogDateElement = document.getElementById('blogDate');
  if (blogDateElement) {
/*
    var dateString = argsArray[2].substr(0, argsArray[2].indexOf('T'));
    var dateStringStandardised = dateString.replace(/-/g, '/');
    var milliseconds = Date.parse(dateStringStandardised);
    var date = new Date(milliseconds);
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();
    var months = ['January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December'];
    blogDateElement.innerHTML = months[month] + ' ' + day + ', ' + year;
*/
    blogDateElement.innerHTML = argsArray[2];
  }
  var blogTextElement = document.getElementById('blogText');
  if (blogTextElement) {
    blogTextElement.innerHTML = argsArray[3];  // Just use innerText?
  }
}
