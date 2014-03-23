define([
	'jquery'
	, 'underscore'
	, 'socket.io'
], function (
	$
	, _
	, io
) {
	var self = {}
		, $rulesInput
		, $textInput
		, $nav
		, connection;


	function start () {
		console.log('start app!');

		connection = io.connect();

		connection.on('connect', onSocketConnect);
		connection.on('connect_failed', onSocketConnectFail);
		connection.on('error', onSocketError);
		connection.on('disconnect', onSocketDisconnect);

		// status updates
		connection.on('/com/notioncollective/rules', onUpdateRules);
		connection.on('/com/notioncollective/text', onUpdateText);	

		$(onDomReady);
	}

	function onDomReady () {
		console.log('domReady');

		$rulesInput = $('textarea#Rules');
		$textInput = $('textarea#Text');

		$rulesInput.keyup(onTextAreaChange);
		$textInput.keyup(onTextAreaChange);
		$textInput.keypress(onTextKeyPress);

		setupControls();
	}

	function setupControls() {
		var $nav = $('#Nav')
			, $hostInput = $nav.find('#OscHost')
			, $portInput = $nav.find('#OscPort')
			, $resetBtn = $nav.find('#Reset');

		$hostInput.on('change', function(e) {
			connection.emit('/com/notioncollective/conf/oschost', {value:$(this).val()});
		});

		$portInput.on('change', function(e) {
			connection.emit('/com/notioncollective/conf/oscport', {value:$(this).val()});
		});

		$resetBtn.on('click', function(e) {
			connection.emit('/com/notioncollective/reset');
		});

		$(window).mousemove(function(e){
			var threshold = 50;
			if(e.pageY > $(window).height()-50) {
				$nav.slideDown();
			} else {
				$nav.slideUp();
			}
		});

	}

	function onTextAreaChange(e) {
		var evt = $(this).data('event'),
			text = $(this).val();

		console.log('text area change', evt, text);

		if(socketConnected()) {
			connection.emit('/com/notioncollective/'+evt, {text: text});
		}

	}

	function onTextKeyPress(e) {
		connection.emit('/com/notioncollective/key');
	}

	function onUpdateRules(data) {
		console.log('rules update', data);
		if($rulesInput) {
			$rulesInput.toggleClass('invalid', !data.valid);

			if(!$rulesInput.is(':focus')) {
				$rulesInput.val(data.text)
			}
		}
	}

	function onUpdateText(data) {
		console.log('text update', data)
		if($textInput && !$textInput.is(':focus')) {
			$textInput.val(data.text);
		}
	}

	function onSocketConnect() {
		console.log('socket connected!');
	}

	function onSocketConnectFail(data) {
		console.error('socket.io failed to connect', data);
	}

	function onSocketError(data) {
		console.error('socket.io error', data);
	}

	function onSocketDisconnect() {
		console.log('socket.io error');
	}

	function socketConnected() {
		return connection && connection.connected;
	}

	self.start = start;

	return self;
});