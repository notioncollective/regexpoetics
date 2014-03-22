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


## Todo

 - Menu bar for various options
 	- OSC send parameters (ip, port)
 	- Reset button
 		- reset text
 		- send "stop" osc message
 - Add additional messages based on stats, etc
 	- Word count
 	- Char count
 - Set interface to automatically sync text fields
 	- text updates
 	- regex updates with info about whether regexes are evaluating correctly

## Release Notes

### 0.0.1

 - Basic system working and in place
 	- Capturing input
 	- Checking for regular expressions in rules input
 	- Evaluating text using rules
 	- Sending osc messages based on matches in text