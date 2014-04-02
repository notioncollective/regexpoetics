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
		, matchCount = []
		, readOnlyView = 'watch'
		, $rulesInput
		, $textInput
		, $nav
		, connection
		, isReadOnly;


	function start () {
		var ruleUpdateCb
			, textUpdateCb,
			channels = [0,1,2,3,4,5];

		console.log('start app!');

		// determine whether we are in read only view
		isReadOnly = (window.location.pathname.indexOf(readOnlyView) !== -1);
		// set callbacks accordingly
		ruleUpdateCb = isReadOnly ? onUpdateRulesReadOnly : onUpdateRules;
		textUpdateCb = isReadOnly ? onUpdateTextReadOnly : onUpdateText;

		connection = io.connect();

		connection.on('connect', onSocketConnect);
		connection.on('connect_failed', onSocketConnectFail);
		connection.on('error', onSocketError);
		connection.on('disconnect', onSocketDisconnect);

		// status updates
		connection.on('/com/notioncollective/rules', ruleUpdateCb);
		connection.on('/com/notioncollective/text', textUpdateCb);

		_(channels).each(function(n) {
			console.log('listen to channel '+n+' for count');
			connection.on('/com/notioncollective/'+n+'/count', onUpdateRuleMatches);
		});

		$(onDomReady);
	}

	function onUpdateRuleMatches(data) {
		var rule = data.rule
			, count = data.count;

		console.log('update rule matches', data);

		if(!matchCount[rule] || matchCount[rule] < count) {
			onNewMatch(rule, count);
		}

		matchCount[rule] = count;
	}

	function onNewMatch(rule, count) {
		var $t = $('#Rules').find('.token:eq('+rule+')');
		
		if($t.length) {
			$t.toggleClass('match', !!count);
		}
	}

	function onDomReady () {
		console.log('domReady');

		$rulesInput = $('#Rules');
		$textInput = $('#Text');

		if(!isReadOnly) {
			$rulesInput.keyup(onTextAreaChange);
			$textInput.keyup(onTextAreaChange);
			$textInput.keypress(onTextKeyPress);

			setupControls();
		}
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

	function onUpdateRules (data) {
		console.log('rules update', data);
		if($rulesInput) {
			$rulesInput.toggleClass('invalid', !data.valid);

			if(!$rulesInput.is(':focus')) {
				$rulesInput.val(data.text)
			}
		}
	}

	function onUpdateRulesReadOnly (data) {
		var	tokens = []
			, html = '';

		console.log('rules update read only', data);

		if($rulesInput) {
			$rulesInput.toggleClass('invalid', !data.valid);

			if(data.valid) {
				tokens = data.text.split(/\s(?=\/)/);
				_(tokens).each(function (token, i) {
					html += '<span class="token'

					// make sure we keep track of matches
					if(matchCount[i]) {
						html += ' match';
					}
					html += '">'+token+'</span>';
				});

			} else {
				html = '<div class="wrap-invalid">'+data.text+'</div>';
			}

			$rulesInput.html(html);
		}
	}


	function onUpdateText (data) {
		console.log('text update', data)
		if($textInput && !$textInput.is(':focus')) {
			$textInput.val(data.text);
		}
	}

	function onUpdateTextReadOnly (data) {
		console.log('text update read only', data);
		if($textInput) {
			$textInput.find('.wrap').html(data.text);
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