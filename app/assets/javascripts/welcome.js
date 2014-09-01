"use strict"

var map;
var positions = {
  "kuancheng": {
    "position": new google.maps.LatLng(40.617, 118.497),
    "marker": new_marker(new google.maps.LatLng(40.617, 118.497))
  },
  "tiantai": {
    "position": new google.maps.LatLng(29.154,120.996),
    "marker": new_marker(new google.maps.LatLng(29.154,120.996))
  },
  "hangzhou": {
    "position": new google.maps.LatLng(30.25, 120.1667),
    "marker": new_marker(new google.maps.LatLng(30.25, 120.1667))
  }
}

var kuancheng = positions['kuancheng'];
var tiantai = positions['tiantai'];
var hangzhou = positions['hangzhou'];
var initial_zoom = 4;
var initial_position = hangzhou['position'];

var iterator = 0;
var markers = [];

var timer = 0;
var timerDelta = 1000;
var zoomSpeed = 1.0;
var infoWindowDuration = 3 * timerDelta * zoomSpeed;
var infoWindowInterval = timerDelta * zoomSpeed;
var infoWindowStoryTime = infoWindowDuration + infoWindowInterval;

var storyImagesPath = "/images/lovestory/"
var storyImages = ["hanyu", "mm"]

var imageMetas = {};
var imageStories = {};

function getImageMetas(storyImages) {
  var i;
  var imageMetaJson;
  for (i = 0; i < storyImages.length; i++) {
    imageMetaJson = storyImagesPath + storyImages[i] + "/image_meta.json";
    var closure = function (i) {
      $.ajaxSetup({"async": false});
      $.getJSON(imageMetaJson, function(data) {
        imageMetas[storyImages[i]] = data;
      });
      $.ajaxSetup({"async": true});
    };
    closure(i);
  }
}

function getImageStories(storyImages) {
  var i;
  var imageStory;
  for (i = 0; i < storyImages.length; i++) {
    imageStory = storyImagesPath + storyImages[i] + "/story.json"
    var closure = function (i) {
      $.ajaxSetup({"async": false});
      $.getJSON(imageStory, function(data) {
        imageStories[storyImages[i]] = data;
      })
      $.ajaxSetup({"async": true});
    }
    closure(i);
  }
}

function initialize() {
  var mapOptions = {
    zoom: initial_zoom,
    maxZoom: 15,
    minZoom: 3,
    draggable: false,
    disableDefaultUI: true,
    disableDoubleClickZoom: true,
    scrollwheel: false,
    center: initial_position,
    mapTypeId: google.maps.MapTypeId.HYBRID
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
                            mapOptions);
}

google.maps.event.addDomListener(window, 'load', initialize);

// function drop() {
//   for (var i = 0; i < hometowns.length; i++) {
//     setTimeout(function() {
//       add_marker();
//     }, i*2000);
//   }
// }

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

function showImageStories(storyImage, localTimer) {
  console.log("[showImageStories] localTimer is: " + localTimer);
  loopImages(imageMetas[storyImage], localTimer);
}

function loopImages(imagesMeta, localTimer) {
  var i;
  var infoWindows, infoWindow;
  var callback;

  infoWindows = imagesToInfoWindows(imagesMeta);
  for (i = 0; i < infoWindows.length; i++) {
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
          console.log("[loopImages] wrong options for argument 'action'");
        }
      }
    }
    console.log("[loopImages] infowindow " + i + " open in timer: " + localTimer);
    setTimeout(callback(infoWindow, "open"), localTimer);
    localTimer += infoWindowDuration;
    setTimeout(callback(infoWindow, "close"), localTimer);
    localTimer += infoWindowInterval;
  }
  timer = localTimer;
  console.log("[loopImages] timer is: " + timer);
}

function showStoryCaption(story, timer) {
  var captionTimer = timer;
  var caption = imageStories[story];
  var callback = function(caption) {
    return function() {
      $("#story-caption").text(caption);
    }
  }

  if (caption instanceof Array) {
    var i;
    for (i = 0; i < caption.length; i++) {
      setTimeout(callback(caption[i]), captionTimer);
      captionTimer += 2 * timerDelta;
    }
  }
  else {
    setTimeout(callback(caption), captionTimer);
  }
}

function loveStory() {
  getImageMetas(storyImages);   // get all image metadatas.
  getImageStories(storyImages); // get all image stories

  timer = 0;

  timer += timerDelta;
  showStoryCaption("从前有两个傻孩子", timer);

  kuancheng["marker"].setIcon("http://ditu.google.cn/mapfiles/ms/icons/blue-dot.png")
  tiantai["marker"].setIcon("http://ditu.google.cn/mapfiles/ms/icons/green-dot.png")

  // Hanyu born
  zoomToPosition(kuancheng["position"], zoomSpeed, initial_zoom, 14);
  showStoryCaption("hanyu", timer);
  showImageStories("hanyu", timer);
  zoomToPosition(kuancheng['position'], zoomSpeed, 14, initial_zoom);

  // Momo born
  zoomToPosition(tiantai['position'], zoomSpeed, initial_zoom, 14);
  showStoryCaption("mm", timer);
  showImageStories("mm", timer);
  zoomToPosition(tiantai['position'], zoomSpeed, 14, initial_zoom);

  //
}

function zoomToPosition(position, zoomSpeed, zoomStart, zoomEnd) {
  // if zoomEnd is null, zoom from current zoom level to zoomStart, treat zoomStart as zoomEnd zoom.
  if (zoomEnd == null) {
    zoomEnd = zoomStart;
    zoomStart = map.getZoom();
  }

  var delta = zoomStart < zoomEnd ? 1 : -1;
  var current = zoomStart + delta;
  while (current != zoomEnd + delta) {
    timer += zoomSpeed * timerDelta;
    console.log("[zoomToPosition] timer is: " + timer);
    var callback = function(position, current) {
      return function() {
        map.setCenter(position)
        map.setZoom(current);
        console.log("[zoomToPosition] zoom to: " + current);
      }
    }
    setTimeout(callback(position, current), timer);
    current += delta;
  }
}

function zoomToInit(speed) {
  if (speed == null)
    zoomToPosition(initial_position, zoomSpeed, initial_zoom);
  else
    zoomToPosition(initial_position, speed, initial_zoom);
}
