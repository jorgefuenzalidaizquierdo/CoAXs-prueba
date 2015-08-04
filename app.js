var express = require('express');
var app = express();

var fs = require('fs');

var morgan = require('morgan');
var bodyParser = require('body-parser');



app.use(morgan('dev'));  
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


app.use('/public', express.static(__dirname + '/public')); // set up ejs static file management
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.set('view engine', 'ejs');





/// ROUTING /// 
var http    = require('http');
var request = require('request');
var csv     = require('csv-streamify');

app.get('/', function (req, res) {
  res.render('index.ejs', {
    data : 'foo',
  });
});

var fileNames = {
  existing: 'lines.geojson',
  proposed: 'proposed.geojson',
  proposed_priority: 'priority.geojson',
  t_stops: 'stations.geojson',
  proposed_stops: 'stops.geojson',

}

app.get('/geojson/:fileId', function (req, res) {
  var options = {
    'root'     : __dirname + '/public/routes/shapefiles/mapApp/',
    'dotfiles' : 'deny',
    'headers'  : {
        'x-timestamp' : Date.now(),
        'x-sent'      : true
    }
  };
  var file = fileNames[req.params.fileId];
  res.sendFile(file, options, function (err) {
    if (err) {
      console.log('sendFile error:', err);
      res.status(err.status).end();
    }
  });
});

app.get('/loadSnapCache/:fileId', bodyParser.json({limit: '5mb'}), function (req, res) {
  var options = {
    'root'     : __dirname + '/public/routes/shapefiles/mapApp/cached',
    'dotfiles' : 'deny',
    'headers'  : {
        'x-timestamp' : Date.now(),
        'x-sent'      : true
    }
  };
  var file = req.params.fileId;
  res.sendFile(file, options, function (err) {
    if (err) {
      console.log('sendFile error:', err);
      res.status(err.status).end();
    }
  });
});

app.get('/cachedLocs', bodyParser.json({limit: '5mb'}), function (req, res) {
  var path = __dirname + '/public/routes/shapefiles/mapApp/cached/'
  fs.readdir(path, function (err, files) {
    if (err) {
      console.log('Read folder error:', err);
      res.status(err.status).end();
    } else {
      res.status(200).send(files);
    }
  });
});

app.post('/cachedLocs/:fileId', bodyParser.json({limit: '5mb'}), function (req, res) {
  var fileLoc = __dirname + '/public/routes/shapefiles/mapApp/cached/' + req.params.fileId;
  fs.writeFile(fileLoc, req.body.newPOIs, function (err) {
    if (err) {
      console.log('Write file error:', err);
      res.status(err.status).end();
    } else {
      res.status(200).end();
    }
  });
});


// gather google responses from phil's survey, uses csv-streamify to convert csv (not the best library to use)
app.get('/pois', function (req, res) {
  var url = 'http://docs.google.com/spreadsheets/d/19tQgf9MQ_0aD6cDsnT66pKt35GwJxzY3BCm0Uznrdac/export?format=csv&id';
  request(url)
  .pipe(csv({
    objectMode : true, 
    columns    : true
  }, function (err, doc) {
    if (err) { res.status(500).send() }
    else { res.status(200).send(doc) }
  }));;
})





// this is how the app is actually started up, the port can be specified either in command line or will default to 3000
var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Coaxs app listening at http://%s:%s', host, port);
});