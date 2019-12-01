// Color map
var magDomain = [0, 6];
var colorCodes = ["#5E4FA2", "#3288BD", "#66C2A5", "#ABDDA4", "#E6F598", "#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"];
var colors = d3.scaleQuantize()
    .domain(magDomain)
    .range(colorCodes);



function createMap(earthquakes) {

  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap
  };

  // Create an overlayMaps object to hold the bikeStations layer
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create the map object with options
  var map = L.map("map-id", {
    center: [40.73, -74.0059],
    zoom: 12,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

 // Set up the legend
 var legend = L.control({ position: "bottomright" });
 legend.onAdd = function () {
     var div = L.DomUtil.create("div", "info legend");
     var limits = magDomain;
     var colors = colorCodes;
     var labels = [];
     // Add min & max
     var legendInfo = "<h1>Earthquake Magnitude</h1>" +
         "<div class=\"labels\">" +
         "<div class=\"min\">" + limits[0] + "</div>" +
         "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
         "</div>";
     div.innerHTML = legendInfo;
     for (i = 0; i < colorCodes.length; i++) {
         labels.push("<li style=\"background-color: " + colors[i] + "\"></li>");
     };
     div.innerHTML += "<ul>" + labels.join("") + "</ul>";
     return div;
  }
    // Adding legend to the map
  legend.addTo(map);
};
function createMarkers(response) {

 
  var location = response.features;

  // Initialize an array to hold earthquake markers
  var earthquakeMarkers = [];

  // Loop through the earthquake array
  for (var index = 0; index < location.length; index++) {
    var mag = location[index].properties.mag;

    var geojsonMarkerOptions = {
      radius: 4 * mag ** 1.5,
      fillColor: colors(mag),
      color: "#000",
      weight: 0.5,
      opacity: .5,
      fillOpacity: 0.5
  };
   // create marker
  var myMarker = L.circleMarker([location[index].geometry.coordinates[1], location[index].geometry.coordinates[0]], geojsonMarkerOptions)
    .bindPopup("<h3>" + location[index].properties.place + "</h3><hr>" +
      "<p>Time: " + new Date(location[index].properties.time) + "</p>" +
      "<p>Depth (km): " + location[index].geometry.coordinates[2] + "</p>" +
      "<p>Magnitude: " + mag + "</p>");
     // Add the marker to the bikeMarkers array
  earthquakeMarkers.push(myMarker);

     // Create a layer group made from the markers array, pass it into the createMap function
     var quakeLayer = L.layerGroup(earthquakeMarkers);
 };
 createMap(quakeLayer);
};

// GeoJSON url
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
// get data
d3.json(url, function (response) {
    // create markers with function
    createMarkers(response)
});