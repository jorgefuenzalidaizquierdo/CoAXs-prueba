// this handles interactions with the analyst.js library, read the library's readme for further examples and details
coaxsApp.service('analystService', function ($q, supportService) {

  this.isochrones = null;

  var Analyst = window.Analyst;
  var analyst = new Analyst(window.L, {
    apiUrl         : 'http://mit-analyst.dev.conveyal.com/api',
    tileUrl        : 'http://mit-analyst.dev.conveyal.com/tile',
    shapefileId    : '0579b6bd8e14ec69e4f21e96527a684b_376500e5f8ac23d1664902fbe2ffc364',
    graphId        : '8a35783dd95ff1a52fc928e183e23340',
    showIso        : true,
  });

  var optionCurrent = {
    'scenario'      : {
      'id'            : 0,
      'description'   : 'Run from CoAXs SPA.',
      'modifications' : [{
        'type'      : 'remove-trip',
        'agencyId'  : 'd802657',
        'routeId'   : [],
        'tripId'    : null
      }]
    }
  }

  // holdes current states for different map layers, etc. (allows you to grab and remove, replace)
  var isoLayer   = null;

  var vectorIsos = null;
  var vecComIsos = null;
  
  var currentIso = null;
  var compareIso = null;

  // clear out everything that already exists, reset opacities to defaults
  this.resetAll = function (map) {
    if (isoLayer)   { isoLayer.setOpacity(1); };
    if (currentIso) { map.removeLayer(currentIso); };
  }

  // filter through and remove routes that we don't want banned on each scenario SPA call
  this.modifyRoutes = function (keepRoutes) {
    var allRoutes = ['029f53a', '007dd6d', 'a534420', '7cb27d8', '86d2825', 'a3e69c4', 'ea50129', '6f451b2', 'b56b5fd', 'cda69a2', 'a1c4c2e', '87aeff8', 'd6bd98c'];
    allRoutes = allRoutes.filter(function(route) { return keepRoutes.indexOf(route) < 0 })
    optionCurrent.scenario.modifications[0].routeId = allRoutes;
  }

  // actually run the SPA and handle results from library
  this.singlePointRequest = function (marker, map, compareKey, cb) {
    analyst.singlePointRequest({
      lat : marker.lat,
      lng : marker.lng,
    }, compareKey, optionCurrent)
    .then(function (response) { 
      if (isoLayer) {
        isoLayer.redraw(); 
      } else {
        isoLayer = response.tileLayer;
        isoLayer.addTo(map);
      }

      var subjects = {
        workers_low  : 'smart_location_database.e_lowwagew',
        workers_med  : 'smart_location_database.e_medwagew',
        workers_high : 'smart_location_database.e_hiwagewk',
        jobs_tot     : 'smart_location_database.emptot',
        hh_zerocar   : 'smart_location_database.autoown0',
        totpop       : 'smart_location_database.totpop10',
      };

      if (!compareKey && subjects) { 
        for (key in subjects) {
          var id = subjects[key];
          var tempArray = response.results.data[id].pointEstimate.counts;
          for (var i = 1; i < tempArray.length; i++) { tempArray[i] = tempArray[i] + tempArray[i-1] }
          subjects[key] = tempArray.map(function(count, i) { return { x : i, y : count } })
        }
        cb(response.results.key, subjects);
      } else {
        cb(response.results.key, null);
      }
    })
    .catch(function (err) {
      console.log(err);
    });
  }

  // explicitly run request for vector isochrones
  this.vectorRequest = function (marker, compareTrue, cb) {
    analyst.vectorRequest({
      lat : marker.lat,
      lng : marker.lng,
    }, optionCurrent)
    .then(function (response) {
      if (compareTrue) { vecComIsos = response.isochrones; }
      else { vectorIsos = response.isochrones; }
      cb(true);
    });
  }

  // swap between tile layer and vector isos layer
  this.showVectorIsos = function(timeVal, map) {
    if (isoLayer) { isoLayer.setOpacity(0) };
    if (currentIso) { map.removeLayer(currentIso); };
    if (compareIso) { map.removeLayer(compareIso); };

    var isosArray = vectorIsos.worstCase.features
    for (var i=0; i<isosArray.length; i++) { 
      if (isosArray[i].properties.time == timeVal) { 
        currentIso = L.geoJson(isosArray[i], {
          style: {
            stroke      : true,
            fillColor   : '#FDB813',
            color       : '#F68B1F',
            weight      : 1,
            fillOpacity : 0.25,
            opacity     : 1
          }
        });
        currentIso.addTo(map);
      }
    }

    var isosArray = vecComIsos.worstCase.features
    for (var i=0; i<isosArray.length; i++) { 
      if (isosArray[i].properties.time == timeVal) { 
        compareIso = L.geoJson(isosArray[i], {
          style: {
            stroke      : true,
            fillColor   : '#89cff0',
            color       : '#45b3e7',
            weight      : 1,
            fillOpacity : 0.25,
            opacity     : 1
          }
        });
        compareIso.addTo(map);
      }
    }
  }

});






