requirejs.config({
	baseUrl : './javascripts/'

	, urlArgs : '_=' + (new Date()).getTime()

	, paths : {
		'jquery' : '../components/jquery/dist/jquery'
		, 'underscore' : '../components/underscore/underscore'
		, 'socket.io' : '../components/socket.io-client/socket.io'
	}

	, shim : {
		'jquery' : {
			exports: ['jQuery']
		}
	}
});

require(['app/app'], function(app) {
	app.start();
});