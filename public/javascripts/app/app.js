define([
	'jquery'
	, 'underscore'
	, 'socket.io'
], function (
	$
	, _
	, io
) {
	var self = {},
		connection;


	function start () {
		console.log('start app!');

		connection = io.connect();

		connection.on('connect', onSocketConnect);
		connection.on('connect_failed', onSocketConnectFail);
		connection.on('error', onSocketError);
		connection.on('disconnect', onSocketDisconnect);

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

		if(socketConnected()) {
			connection.emit(id, {text: text});
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