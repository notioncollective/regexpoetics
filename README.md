regexpoetics
============

A simple interface for turning regular expression patterns into osc messages.

## Instructions

Install npm dependencies:

	npm install

Install bower dependencies:

	bower install

Start the server:

	grunt

Open up your browser to [http://localhost:3000](http://localhost:3000)

## OSC Endpoints

 * `/com/notioncollective/key` - fires on every keydown in text input
 * `/com/notioncollective/notes` - each individual matched note is a separate param, with a number
 * `/com/notioncollective/notes/[n]` same as above, but only for the selected regex
 * `/com/notioncollective/words` - word count for entire contents of text input
 * `/com/notioncollective/chars` - chartacter count for entire contents of text input
 * `/com/notioncollective/count` - count of matches for all regexes
 * `/com/notioncollective/count/[n]` - count of matches for regex #n

## Some handy regular expressions

 * `/[^\s]*?abc[^\s]*?$/` - Capture words that contain "abc" only if they are the last word in the line
 * _How to do **not** "money"? [Almost there but not quite](http://stackoverflow.com/questions/406230/regular-expression-to-match-string-not-containing-a-word)_

## Todo

 - Menu bar for various options
 	- OSC send parameters (ip, port)
 	- Reset button
 		- reset text
 		- send "stop" osc message
 - Maybe we should use captures and not matches? Have to theink about this a bit
 - Abstract messaging a bit so that all osc messages are also sent back to the client
 - Update namespacing to "/com/nc/regexpoetics/" ? Or something project-specific.
 - BUG: Sometimes live updating interferes with your typing.
 	- Possible fix: each client gets a client id, sends that id with messages. 

## Release Notes

### 0.0.3
- Updated messages to include the following
	- Global
		- Word count
		- Char count
		- Bang per key press
	- Per regex
		- Count (global and per expression)
		- Musical notes (global and per expression)
- Update so text area content will not update when focused

### 0.0.2
 - Set interface to automatically sync text fields
 	- text updates
 	- regex updates with info about whether regexes are evaluating correctly

### 0.0.1

 - Basic system working and in place
 	- Capturing input
 	- Checking for regular expressions in rules input
 	- Evaluating text using rules
 	- Sending osc messages based on matches in text