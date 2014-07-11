regexpoetics
============

## Spreadsheet edition!




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
 * `/com/notioncollective/[n]` - all messages for expression #n
 * `/com/notioncollective/notes` - each individual matched note is a separate param, with a number
 * `/com/notioncollective/[n]/notes` - same as above, but only for the selected regex
 * `/com/notioncollective/words` - word count for entire contents of text input
 * `/com/notioncollective/[n]/words` - word count for matches of expression n
 * `/com/notioncollective/chars` - chartacter count for entire contents of text input
 * `/com/notioncollective/[n]/chars` - character count for matches for expression n
 * `/com/notioncollective/count` - count of matches for all regexes
 * `/com/notioncollective/[n]/count` - count of matches for regex #n

## Some handy regular expressions

 * `/[^\s]*?abc[^\s]*?$/` - Capture words that contain "abc" only if they are the last word in the line
 * `/\w+\.$/` - Capture the last word in a sentence followed by a period.
 * `/(^|\n)+?\n$/` - Capture the last line
 * `/(\n|^).*?\n/` - Capture every line
 * _How to do **not** "money"? [Almost there but not quite](http://stackoverflow.com/questions/406230/regular-expression-to-match-string-not-containing-a-word)_


## Aesthetic Decisions
 - Button to show/hide regular expressions


## Annoying Things / Ways To Make This Easier On Ourselves
 - Write instructions for setup
 - Clean up samples/scores
 - Figure out a way to have pd samples auto-load? (might not be possible)
 - Figure out how to have mixer automatically set itself up? (might be a pain)


## Todo
 - send ascii characters instead of notes
 - Add ability to do sharps/flats
 	- captial letter is sharp?
 - Add ability to add flags to regex
 - Control panel buttons
 	- There should be an "Update" button for updating the fields
 		- This will just send both the host and port (on client)
 	- "Reset" button
 		- Send an OSC reset message (on server)
 		- Clear all input fields (on client)
 	- "Sync" button?
 - Maybe we should use captures and not matches? Have to think about this a bit
 - Abstract messaging a bit so that all osc messages are also sent back to the client
 - Update namespacing to "/com/nc/regexpoetics/" ? Or something project-specific.
 - BUG: Sometimes live updating interferes with your typing.
 	- Possible fix: each client gets a client id, sends that id with messages. 

## Release Notes

### 0.1.1
 * Some style tweaks
 * This is the version used for the 4/4/2014 performance

### 0.1.0
 * Added `/watch` view for live display of text/rules
 	* includes highlighting rules when there is a match
 	* read-only

### 0.0.7
 * Tagging master before merging in "watch" branch

### 0.0.6
 - Menu bar for various options
 	- OSC send parameters (ip, port)
 	- Reset button

### 0.0.5
 * Updated osc channels so that expression number comes first (`/com/notioncollective/0/chars`)

### 0.0.4
 * Added osc paths or individual expression word count, or individual expression char count.
 * A few bug fixes

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