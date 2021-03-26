var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var manager = require('./routes/manager');
var topology_flavor1 = require('./routes/topology_flavor1');
var topology_flavor2 = require('./routes/topology_flavor2');

// HTIP L2 frame receiver
var HtipReceiver = require("./lib/htip/htip_receiver");

var TopologyGenFlavor1 = require("./lib/htip/topology_gen_flavor1");
var TopologyGenFlavor2 = require("./lib/htip/topology_gen_flavor2");

var app = express();

// add HTIP node list api
var htipReceiver = new HtipReceiver();
htipReceiver.startArp();
app.get("/api/nodelist", function(req, res) {
  var nodelist = htipReceiver.getNodeList();
  res.json(nodelist);
});

app.get("/api/topology_flavor1", function(req, res) {
  var nodelist = TopologyGenFlavor1(htipReceiver.getNodeList());
  res.json(nodelist);
});

app.get("/api/topology_flavor2", function(req, res) {
  var nodelist = TopologyGenFlavor2(htipReceiver.getNodeList());
  res.json(nodelist);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
// add HTIP Manager web page
app.use('/manager', manager);
app.use('/topology_flavor1', topology_flavor1);
app.use('/topology_flavor2', topology_flavor2);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
