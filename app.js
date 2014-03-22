
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , io = require('socket.io')
  , _ =require('underscore');

var app = express()
    , server = http.createServer(app)
    , connection
    , cachedRegExes = []
    , cachedText = '';

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
  var regExes;

  console.log('rules update', data);

  regExes = processRegExes(data.text)

  if(regExes && regExes.length) {
    cachedRegExes = regExes;
    processText(cachedText, cachedRegExes);
  }
}

function onTextUpdate(data) {
  console.log('text update', data);
  processText(data.text, cachedRegExes);
}

function processRegExes(regExesStr) {
  // @todo: this will currently disallow using the `/` character in any regular expressions
  var regExesParser = /\/.+?\//g,
      regExStrings,
      isValid = true,
      regExes = [];

  console.log('check ' + regExesStr);

  // a basic test to make sure we are parsing correctly
  if(!regExesParser.test(regExesStr)) {
    return;
  } else {

    // get matches from our rules string -- each of these
    // should be a regular expression
    regExStrings = regExesStr.match(regExesParser);

    console.log('regExStrings', regExStrings);

    // cycle through and make sure they're valid,
    // and if they are add the regex to our array
    regExStrings.forEach(function(reStr) {
        var re;
        if(isValid) {
          try {
            // we're slicing off the beginning and end slashes
            re = new RegExp(reStr.slice(1, -1), 'g');
            regExes.push(re);
          } catch(e) {
            isValid = false;
          }
        }
    });

    // if none were invalidated, let's update
    // our cached regexes
    if(!isValid) {
      return;
    }
  }

  console.log('returning regexes', regExes);

  // create regular expressions and return as array
  return regExes;
}

function processText(text, regExes) {
  regExes.forEach(function(re, i) {
    console.log('test re for exp '+i, text.match(re));
  });
}
