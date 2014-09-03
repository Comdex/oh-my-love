"use strict"

var debug;                      // show log or not

var map;
var initial_zoom = 4;
var initial_position = new google.maps.LatLng(39.908, 116.397); // Beijing

var timer = 0;
var timerDelta = 1000;
var zoomSpeed = 1.0;
var infoWindowDuration = 3 * timerDelta * zoomSpeed;
var infoWindowInterval = timerDelta * zoomSpeed;
var infoWindowStoryTime = infoWindowDuration + infoWindowInterval;

var storyImagesPath = "/images/lovestory/";
var stories = ["kuancheng", "tiantai", "hangzhou", "zhedong",
               "qinghaihu", "dongji", "xizang", "shennongjia",
               "shaoxing", "tianmushan", "xiamen", "nanxijiang",
               "changbaishan", "xibei"];

var imageMetas = {};

function log(str) {
  debug && console.log(str);
}

function getImageMetas(stories) {
  var i;
  var imageMetaJson;
  for (i = 0; i < stories.length; i++) {
    imageMetaJson = storyImagesPath + stories[i] + "/meta.json";
    var closure = function (i) {
      $.ajaxSetup({"async": false});
      $.getJSON(imageMetaJson, function(data) {
        imageMetas[stories[i]] = data;
      });
      $.ajaxSetup({"async": true});
    };
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

function new_marker(position) {
  var marker = new google.maps.Marker({
    position: position,
    draggable: false,
    animation: google.maps.Animation.DROP
  });
  marker.setMap(map);
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

function showImageStories(story, localTimer) {
  log("[showImageStories] localTimer is: " + localTimer);
  loopImages(imageMetas[story]['images'], localTimer);
}

function loopImages(imagesMeta, localTimer) {
  var i;
  var infoWindows, infoWindow, imageMeta;
  var callback;

  infoWindows = imagesToInfoWindows(imagesMeta);
  for (i = 0; i < infoWindows.length; i++) {
    infoWindow = infoWindows[i];
    imageMeta = imagesMeta[i];
    callback = function(infoWindow, imageMeta, action) {
      return function() {
        if (action == "open") {
          var position = new google.maps.LatLng(imageMeta['latitude'],
                                                imageMeta['longitude'])
          map.panTo(position);
          new_marker(position);
          log("panTo " + position);
          infoWindow.open(map);
        }
        else if (action == "close") {
          infoWindow.close(map);
        }
        else {
          log("[loopImages] wrong options for argument 'action'");
        }
      }
    }
    log("[loopImages] infowindow " + i + " open in timer: " + localTimer);
    setTimeout(callback(infoWindow, imageMeta, "open"), localTimer);
    localTimer += infoWindowDuration;
    setTimeout(callback(infoWindow, imageMeta, "close"), localTimer);
    localTimer += infoWindowInterval;
  }
  timer = localTimer;
  log("[loopImages] timer is: " + timer);
}

function showStoryCaption(story, timer) {
  var captionTimer = timer - 3 * timerDelta * zoomSpeed;
  var caption = imageMetas[story]['story']
  var callback = function(caption) {
    return function() {
      $("#story-caption").text(caption);
    }
  }

  var i;
  for (i = 0; i < caption.length; i++) {
    setTimeout(callback(caption[i]), captionTimer);
    captionTimer += 4 * timerDelta * zoomSpeed;
  }

  setTimeout(function() {
    $("#story-caption").text("");
  }, captionTimer);             // clear caption text
}

function showStory(story) {
  var latitude = imageMetas[story]['position']['latitude'];
  var longitude = imageMetas[story]['position']['longitude'];
  var position = new google.maps.LatLng(latitude, longitude)

  zoomToPosition(position, zoomSpeed, initial_zoom, imageMetas[story]['zoom']);
  showStoryCaption(story, timer);
  showImageStories(story, timer);
  zoomToPosition(position, zoomSpeed, imageMetas[story]['zoom'], initial_zoom);
}

function loveStory() {
  getImageMetas(stories);       // get all image metadatas.

  timer = 0;                    // reset timer before story

  var i;
  for (i = 0; i < stories.length; i++) {
    showStory(stories[i]);
  }

  // kuancheng["marker"].setIcon("http://ditu.google.cn/mapfiles/ms/icons/blue-dot.png")
  // tiantai["marker"].setIcon("http://ditu.google.cn/mapfiles/ms/icons/green-dot.png")

  timer = 0;                    // reset timer after story
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
    log("[zoomToPosition] timer is: " + timer);
    var callback = function(position, current) {
      return function() {
        map.setCenter(position)
        map.setZoom(current);
        log("[zoomToPosition] zoom to: " + current);
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
