define([
	'jquery'
	, 'underscore'
	, 'socket.io'
], function (
	$
	, _
	, socket
) {
	var self = {};


	function start () {
		console.log('start app!');
		$(onDomReady);
	}

	function onDomReady () {
		console.log('domReady');

		$('textarea').keyup(onTextAreaChange);
	}

	function onTextAreaChange(e) {
		var id = $(this).attr('id'),
			text = $(this).val();

		console.log('text area change', id, text);

		switch(id) {
			case 'Rules' :
				break;
			case 'Text' : 
				break;
		}
	}


	self.start = start;

	return self;
});