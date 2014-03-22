
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , io = require('socket.io')
  , osc = require('node-osc')
  , _ =require('underscore');

var app = express()
    , host = '0.0.0.0'
    , server = http.createServer(app)
    , connection
    , oscClient
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

// setup the osc server
oscClient = new osc.Client('192.168.0.16', 9001);

// setup the socket.io connection
connection = io.listen(server);

// listen for connection event
connection.sockets.on('connection', onSocketConnect);

// start the web server
server.listen(app.get('port'), host, onServerStart);

function onServerStart() {
  console.log("Express server listening on port " + app.get('port'));
}

function onSocketConnect(socket) {
  console.log("Socket.io running on port " + app.get('port'));
  // register events
  socket.on('/com/notioncollective/rules', onRulesUpdate);
  socket.on('/com/notioncollective/text', onTextUpdate)
}

function onRulesUpdate(data) {
  var regExes;

  console.log('rules update', data);

  regExes = processRegExes(data.text)

  if(regExes && regExes.length) {
    processText(cachedText, setRules(regExes, data.text));
  }
}

function onTextUpdate(data) {
  console.log('text update', data);
  processText(setText(data.text), cachedRegExes);
}

function processRegExes(regExesStr) {
  // @todo: this will currently disallow using the `/` character in any regular expressions
  var regExesParser = /^(\/.+?\/\s?)+?$/,
      regExStrings,
      isValid = true,
      regExes = [];

  console.log('check ' + regExesStr);

  // a basic test to make sure we are parsing correctly
  if(!regExesParser.test(regExesStr)) {
    rulesInvalid(regExesStr);
    return;
  } else {

    // get matches from our rules string -- each of these
    // should be a regular expression
    regExStrings = regExesStr.match(regExesParser).slice(1);

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
      rulesInvalid(regExesStr);
      return;
    }
  }

  console.log('returning regexes', regExes);

  // create regular expressions and return as array
  return regExes;
}

function processText(text, regExes) {
  regExes.forEach(function(re, i) {
    var matches = text.match(re);
    if(matches) {
      console.log('test re for exp '+i, matches, matches.length);
      oscClient.send('/com/notioncollective/'+i, matches.length);
    }
  });
}

function rulesInvalid(str) {
  var msg = {
      valid: false
      , text: str
    };

  console.log('send rules invalid update', str)
  connection.emit('/com/notioncollective/rules', msg);

  return str;
}

function setRules(re, str) {
  var msg = {
      valid: true
      , text: str
    };

  cachedRegExes = re;

  console.log('send rules update', msg);
  connection.emit('/com/notioncollective/rules', msg);

  return re;
}

function setText(str) {
  var msg = { text : str };

  cachedText = str;
  console.log('send text update', msg);
  connection.emit('/com/notioncollective/text', msg);

  return str;
}

