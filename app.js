
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
oscClient = new osc.Client('192.168.0.16', 9002);

// setup the socket.io connection
connection = io.listen(server);

// listen for connection event
connection.sockets.on('connection', onSocketConnect);

// start the web server
server.listen(app.get('port'), host, onServerStart);

/**
 * Event handler for when the express server is started
 */
function onServerStart() {
  console.log("Express server listening on port " + app.get('port'));
}

/**
 * Event handler for socket.io connection
 * @param  {Object} socket Socket object for this connection
 */
function onSocketConnect(socket) {
  console.log("Socket.io running on port " + app.get('port'));
  // register events
  socket.on('/com/notioncollective/rules', onRulesUpdate);
  socket.on('/com/notioncollective/text', onTextUpdate);
  socket.on('/com/notioncollective/key', onTextKeyPress);
}

/**
 * Event handler for rules update from client
 * @param  {Object} data Data received from client
 */
function onRulesUpdate(data) {
  var regExes;

  console.log('rules update', data);

  regExes = processRegExes(data.text)

  if(regExes && regExes.length) {
	processText(cachedText, setRules(regExes, data.text));
  }
}


/**
 * Handler for keypress event from client
 */
function onTextKeyPress() {
  console.log('text keypress');
  oscClient.send('/com/notioncollective/key', 1);
}

/**
 * Event handler for text update from client
 * @param  {Object} data Data recieved from client
 */
function onTextUpdate(data) {
  console.log('text update', data);
  processText(setText(data.text), cachedRegExes);
}

/**
 * Process a regular expressions string returned from the client. This method
 * also validates the given string.
 * @param  {String} regExesStr A string of space-separated regular expressions
 * @return {Array}  Will return the array of regular expressions if valid, or `undefined` if invalid.
 */
function processRegExes(regExesStr) {
  // @todo: this will currently disallow using the `/` character in any regular expressions
  var regExesParser = /(\/.+?\/)+?/g,
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
	  rulesInvalid(regExesStr);
	  return;
	}
  }

  console.log('returning regexes', regExes);

  // create regular expressions and return as array
  return regExes;
}

/**
 * Process the text after updated in the client
 * @param  {String} text    The new text
 * @param  {Array} regExes An array of regular expressions for processing
 */
function processText(text, regExes) {
	var globalCount = 0,
		charsCount = text.length,
		wordsCount = text.split(/\s+/).length;

	// send global counts
	sendCharsCount(charsCount);
	sendWordsCount(wordsCount);

	// parse for note messages
	parseNotes(text, regExes);

	// evaluate individual regexes
	regExes.forEach(function(re, i) {
		var matches = text.match(re),
			count;

		if(matches) {
			count = matches.length;
			globalCount += count;

		 	console.log('test re for exp '+i, matches, count);

		 	// send matches count for this regex
		 	oscClient.send('/com/notioncollective/count/'+i, count);
		}
	});


	console.log('send global matches count: ', globalCount);
	// send global matches count
	oscClient.send('/com/notioncollective/count', globalCount);

}

/**
 * Sends characters count to osc and to client
 * @param  {Number} count Number of characters
 */
function sendCharsCount(count) {
	console.log('send chars count: '+count);
	oscClient.send('/com/notioncollective/chars', count);
	connection.emit('/com/notioncollective/chars', {count: count});
}

/**
 * Sends words count to osc and to client
 * @param  {Number} count Number of words
 */
function sendWordsCount(count) {
	console.log('send words count: '+count);
	oscClient.send('/com/notioncollective/words', count);
	connection.emit('/com/notioncollective/words', {count: count});
}

/**
 * Parse note values given text and regular expressions. Will send osc messages
 * for global notes and notes within specific regular expression matches
 * @param  {String} text    Current text value
 * @param  {Array} regExes Array of regular expressions
 */
function parseNotes(text, regExes) {
  var notesRegEx = /[abcdefg]/g,
	  globalNotes = _.uniq(text.match(notesRegEx));

	if(globalNotes && globalNotes.length) {
		oscClient.send(createNotesMessage('/com/notioncollective/notes', globalNotes));
	}

	console.log('**current regexes', regExes);
	regExes.forEach(function(re, i) {
		var matches = text.match(re)
			, notes;

		if(matches) {
			notes = _.uniq(matches.join().match(notesRegEx));

			if(notes && notes.length) {
				oscClient.send(createNotesMessage('/com/notioncollective/notes/'+i, notes));
			}
		}	

	});
}

/**
 * Create an osc message with note values based on an array of 
 * note characters.
 * @param  {String} endpoint Endpoint for osc message
 * @param  {Array} notes    An array of note characters (`['a', 'b', 'f']);
 * @return {Object}         An osc message with note values.
 */
function createNotesMessage(endpoint, notes) {
	var msg = new osc.Message(endpoint),
		noteMapping = {
			'c' : 60
			, 'd' : 62
			, 'e' : 64
			, 'f' : 65
			, 'g' : 67
			, 'a' : 69
			, 'b' : 71
		};

	notes.forEach(function(note) {
		if(noteMapping[note]) {
			msg.append(noteMapping[note]);
		}
	});

	console.log('created notes message for '+endpoint+':', notes);

	return msg;
}


/**
 * Sends a message to the client for invalid rules. This is so 
 * that the regular expression can remain synced in clients
 * even if it isn't valid.
 * @param  {String} str The regular expressions string
 * @return {String}     The regular expressions string 
 */
function rulesInvalid(str) {
  var msg = {
	  valid: false
	  , text: str
	};

  console.log('send rules invalid update', str)
  connection.emit('/com/notioncollective/rules', msg);

  return str;
}

/**
 * Setter for the stored rules (an array of regular expressions).
 * Also sends rules update event to the client.
 * @param {Array} re  An array of regular expressions
 * @param {String} str The original string of regular expressions
 * @return {re} The new array of regular expressions
 */
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

/**
 * Setter for the stored text value (also sends update event to client)
 * @param {String} str String to set text to
 * @return {String} The new text
 */
function setText(str) {
  var msg = { text : str };

  cachedText = str;
  console.log('send text update', msg);
  connection.emit('/com/notioncollective/text', msg);

  return str;
}

