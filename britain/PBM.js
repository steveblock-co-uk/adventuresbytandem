// script for PBM.html

var pathToScripts = '../';

// Data handling object - Days
function Days() { this.daysArray = new Array(); }
Days.prototype.AddDay = function( tag, title, blogID, mileage, lat, lng ) {
  this.daysArray[ this.daysArray.length ] = new Day( tag, title, blogID, mileage, lat, lng );
}
Days.prototype.Day = function( index ) { return this.daysArray[index]; }
Days.prototype.NumDays = function() { return this.daysArray.length; }

// Data handling object - Day
// NB tag can't have spaces for use in picasa
function Day( tag, title, blogID, mileage, lat, lng ) {
  this.tag     = tag;
  this.title   = title;
  this.blogID  = blogID;
  this.mileage = mileage;
  this.lat     = lat;
  this.lng     = lng;
}

// Load data
// Order here sets display order!
var days = new Days();
days.AddDay( 'travels', 'Travels', '2736183268318856887' );
days.AddDay( 'practice', 'Practice', '4378792637928334329' );
days.AddDay( 'day1', 'Day 1', '1170417648930390669', 0, 50.152266272562684, -5.583801269 );
days.AddDay( 'day2', 'Day 2', '1600844074366305495', 0, 50.52041218671901, -4.9685668945 );
days.AddDay( 'day3', 'Day 3', '2961241146284174847', 0, 50.786838126951494, -3.84521484375 );
days.AddDay( 'day4', 'Day 4', '8818022998629515596', 0, 51.43346414054374, -2.83721923828125 );
days.AddDay( 'day5', 'Day 5', '2096989204242083433', 0, 52.21938689037312, -3.065185546875 );
days.AddDay( 'day6', 'Day 6', '1502738067817296549', 0, 52.910558435943194, -2.164306640625 );
days.AddDay( 'day7', 'Day 7', '7855689560738059005', 0, 53.67393435835391, -1.96929931640625 );
days.AddDay( 'day8', 'Day 8', '4370991277911171772', 0, 54.23634021441342, -2.71087646484375 );
days.AddDay( 'day9', 'Day 9', '728440807209996539', 0, 54.600337111515586, -3.1497931480407715 );
days.AddDay( 'day10', 'Day 10', '1201950222165434234', 110, 54.999675158535794, -3.49090576171875 );
days.AddDay( 'day11', 'Day 11', '454917810430365557', 0, 55.45394132943307, -4.46868896484375 );
days.AddDay( 'day12', 'Day 12', '5177445493886929241', 0, 56.37133494106981, -5.438232421875 );
days.AddDay( 'day13', 'Day 13', '6290985115557019539', 0, 57.407981709652276, -4.5263671875 );
days.AddDay( 'day14', 'Day 14', '5731045775029935442', 0, 58.2040028592663, -3.4991455078125 );
days.AddDay( 'return', 'Return', '946952544279694375' );

// The index of the day currently displayed
var currentIndex = null;

var bodyLoaded = false;

window.onresize = OnResize;

function OnResize() {
  // This may get called before the document has been loaded
  if( !bodyLoaded ) { return; }
  var windowSize = GetWindowSize();
  ResizeMap( windowSize );
}

function OnLoad() {
  // Gets called after the document body has been loaded
  bodyLoaded = true;
  ConfigureMap();
  ConfigurePhotos();
  OnResize();
  ShowDay( 2 ); // Sets current index
}

function ShowDay( index, moveMap ) {
  ShowBlog( index );
  ShowPhotos( index );
  if( moveMap ) { 
    MoveMap( index ); 
  }
  WriteIndex( index );
  // Dirty global
  currentIndex = index;
}

function WriteIndex( index ) {
  var html = '';
  for( var i=0; i<days.NumDays(); ++i ) {
    html += '<span class="index">'
    if( i == index ) {
      html += days.Day(i).title;
    } else {
      html += '<a class="index" href="" onclick="ShowDay(' + i + ',true); return false;">' + days.Day(i).title + '</a>';
    }
    html += '</span>';
  }
  document.getElementById( "index" ).innerHTML = html;
}
