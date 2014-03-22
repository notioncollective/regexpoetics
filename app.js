
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , io = require('socket.io');

var app = express(),
    server = http.createServer(app),
    connection;

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

// setup the socket.io connection
connection = io.listen(server);
// listen for connection event
connection.sockets.on('connection', onSocketConnect);
// start the server
server.listen(app.get('port'), onServerStart);

function onServerStart() {
  console.log("Express server listening on port " + app.get('port'));
}

function onSocketConnect(socket) {
  console.log("Socket.io running on port " + app.get('port'));
  // register events
  socket.on('Rules', onRulesUpdate);
  socket.on('Text', onTextUpdate)
}

function onRulesUpdate(data) {
  console.log('rules update', data);
}

function onTextUpdate(data) {
  console.log('text update', data);
}