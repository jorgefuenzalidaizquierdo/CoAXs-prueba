coaxsApp.service('loadService', function ($http, supportService) {

  this.getExisting = function (cb) {
    $http.get('/geojson/existing')
    .success(function (data, status) {
      var subwayRoutes = L.geoJson(data, {
        style: function (feature) {
          return {
            color     : feature.properties.LINE,
            weight    : 2,
            opacity   : 0.5,
            dashArray : 0,
          };
        },
        onEachFeature: function (feature, layer) {
          // layer.bindPopup('<b>' + feature.properties.LINE + ' Line</b> ' + feature.properties.ROUTE);
        }
      });
      cb(subwayRoutes);
    });    
  }

  this.getProposedRoutes = function (cb) {
    $http.get('/geojson/proposed')
    .success(function (data, status) {

      var geojsonList   = [];
      var routes = {};

      for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i].properties;
        feature['length'] = supportService.getLength(data.features[i].geometry);

        if (!routes[feature.routeId]) { routes[feature.routeId] = {} };
        var color = '#' + feature.routeColor;
        routes[feature.routeId][feature.direction] = L.geoJson(data.features[i], {
          style: function (feature) {
            return {
              color     : color,
              weight    : 3,
              opacity   : 0.1,
              dashArray : 0,
            };
          },
          base: feature
        });

        geojsonList.push(routes[feature.routeId][feature.direction]);
      }

      cb({layerGroup:L.layerGroup(geojsonList), geoJsons:routes});
    });    
  }

  this.getProposedStops = function (cb) {
    $http.get('/geojson/proposed_stops')
    .success(function (data, status) {

      var stopList = [];
      var stopicon = L.Icon.extend({
        options : {
          iconUrl      : 'public/imgs/stop.png',
          iconSize     : [16, 18],
          iconAnchor   : [8, 18],
          popupAnchor  : [0, -15],
          className    : 'icon-off',
        }
      });

      for (var i=0; i<data.features.length; i++) {
        var stop = data.features[i];
        stopList.push(L.marker([stop.geometry.coordinates[1], stop.geometry.coordinates[0]], {
          'icon'        : new stopicon(),
          'riseOnHover' : true,
          'base'        : stop.properties,
        }))
      }

      var stopsLayer = L.layerGroup(stopList);
      cb(stopsLayer);
    });
  }

  this.getUsersPoints = function (cb) {
    $http.get('/geojson/pois')
    .success(function (data, status) {
      if (status == 200) {
        var circles = [];
        var poiUsers = [];

        var smallMarkerOptions = {
          radius      : 5,
          fillColor   : 'rgba(139,139,210,0.3)',
          color       : 'rgba(36,36,76,0.8)',
          weight      : 1,
          opacity     : 1,
          fillOpacity : 0.8
        };
        var bigMarkerOptions = {
          radius      : 15,
          fillColor   : 'rgba(139,139,210,0)',
          weight      : 0,
        };

        for (var i=0; i<data.length; i++) {
          var pois = JSON.parse(data[i].POIs);
          var userId = data[i].Name[0] + data[i].Name[1]

          smallMarkerOptions['userId'] = userId;
          bigMarkerOptions['userId']   = userId;
          
          poiUsers.push({ name : userId, color : ('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6)});
          for (var n=0; n<pois.length; n++) {
            circles.push(L.circleMarker([pois[n].lat, pois[n].lng], smallMarkerOptions, {name: data[i].Name}));

            circles.push(L.circleMarker([pois[n].lat, pois[n].lng], bigMarkerOptions)
              .bindPopup('<b>' + data[i].Name + '</b>: ' + pois[n].poiTag));
          }
        }
        cb(L.layerGroup(circles), poiUsers);
      }
    })
  }



});











