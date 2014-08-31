"use strict"
console.log("This is map.js");

var map;
var kuancheng = new google.maps.LatLng(40.617, 118.497);
var tiantai = new google.maps.LatLng(29.154,120.996);
var hangzhou = new google.maps.LatLng(30.25, 120.1667);

var hometowns = [kuancheng, tiantai];
var iterator = 0;
var markers = [];

var timer = 0;
var timerDelta = 1000;

function initialize() {
  var mapOptions = {
    zoom: 3,
    maxZoom: 15,
    minZoom: 3,
    draggable: false,
    disableDefaultUI: true,
    disableDoubleClickZoom: true,
    scrollwheel: false,
    center: hangzhou,
    mapTypeId: google.maps.MapTypeId.HYBRID
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
                            mapOptions);
}

google.maps.event.addDomListener(window, 'load', initialize);

function drop() {
  for (var i = 0; i < hometowns.length; i++) {
    setTimeout(function() {
      add_marker();
    }, i*2000);
  }
}

function new_marker(position) {
  return new google.maps.Marker({
    position: position,
    draggable: false,
    animation: google.maps.Animation.DROP
  })
}

function imagesToInfoWindows(imagesMeta) {
  var i;
  var html;
  var infoWindows = [];
  for (i = 0; i < imagesMeta.length; i++) {
    html = '<div class="info-image"><img src="' +
        imagesMeta[i]["image"] + '">' +
        '<p>' + imagesMeta[i]["description"] +
        '</p></div>';
    infoWindows.push(
        new google.maps.InfoWindow({
          content: html,
          position: new google.maps.LatLng(imagesMeta[i]["latitude"],
                                           imagesMeta[i]["longitude"])
        })
    )
  }

  return infoWindows;
}

function loopImages(imagesMeta) {
  var i;
  var infoWindows, infoWindow;
  var callback;

  infoWindows = imagesToInfoWindows(imagesMeta);
  for (i = 0; i < infoWindows.length; i++) {
    console.log("infowindow " + i + "open");
    infoWindow = infoWindows[i];
    callback = function(infoWindow, action) {
      return function() {
        if (action == "open") {
          infoWindow.open(map);
        }
        else if (action == "close") {
          infoWindow.close(map);
        }
        else {
          console.log("wrong options for argument 'action'");
        }
      }
    }
    setTimeout(callback(infoWindow, "open"), timer);
    timer += timerDelta;
    // setTimeout(callback(infoWindow, "close"), timer);
    // timer += timerDelta;
  }
}

function init() {
  timer = 0;
  var marker_kuancheng = new_marker(kuancheng);
  marker_kuancheng.setIcon("http://ditu.google.cn/mapfiles/ms/icons/blue-dot.png")
  var marker_tiantai = new_marker(tiantai);
  marker_tiantai.setIcon("http://ditu.google.cn/mapfiles/ms/icons/green-dot.png")

  zoomToPosition(kuancheng, 3, 14);
  timer += 2000;
  setTimeout(function() {
    marker_kuancheng.setMap(map);
    var infowindow = new google.maps.InfoWindow({
      content: 'Xiao Hanyu'
    });
    infowindow.open(map, marker_kuancheng);
  }, timer);
  timer += 2000;
  zoomToPosition(kuancheng, 14, 3);

  zoomToPosition(tiantai, 3, 14);
  timer += 2000;
  setTimeout(function() {
    marker_tiantai.setMap(map);
    var infowindow = new google.maps.InfoWindow({
      content: 'Wang Min'
    });
    infowindow.open(map, marker_tiantai);
  }, timer);
  timer += 2000;
  zoomToPosition(tiantai, 14, 3);
}

function zoomToPosition(position, start, end) {
  // if end is null, zoom from current zoom level to start, treat start as end zoom.
  if (end == null) {
    end = start;
    start = map.getZoom();
  }

  var delta = start < end ? 1 : -1;
  var current = start + delta;
  while (current != end + delta) {
    timer += timerDelta;
    console.log("timer is: " + timer);
    var callback = function(position, current) {
      return function() {
        map.setCenter(position)
        map.setZoom(current);
        console.log("zoom to: " + current);
      }
    }
    setTimeout(callback(position, current), timer);
    current += delta;
  }
}
