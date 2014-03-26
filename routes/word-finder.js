var _ = require('underscore'),
	rabblescay = require('rabblescay'),

	allNotes = 'abcdefg',
	allNotesArr = allNotes.split('');

module.exports = exports = function(req, res) {
	var letters = req.param('letters'),
		lettersArr = _.intersection(letters.split(''), allNotesArr),
		excludedArr = _.difference(allNotesArr, lettersArr),
		excludedPattern = '[^'+excludedArr.join('')+']*',
		regExp = excludedPattern,
		matches;

	console.log('try out rabblescay');


	lettersArr.forEach(function(letter){
		regExp = regExp + letter + excludedPattern;
	});

	matches = rabblescay(regExp, []);

	console.log('original letters param: '+letters);
	console.log('all notes array: ', allNotesArr)
	console.log('selected letters: ', lettersArr);
	console.log('excluded letters: ', excludedArr);
	console.log('excluded pattern: '+excludedPattern);
	console.log("regex: "+regExp);
	console.log('matches: ', matches);

	res.render('word-finder', { title: letters, matches: matches});
};