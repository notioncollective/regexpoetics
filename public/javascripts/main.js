requirejs.config({
	baseUrl : './javascripts/'

	, urlArgs : '_=' + (new Date()).getTime()

	, paths : {
		'jquery' : '../components/jquery/dist/jquery'
		, 'jquery-color' : '../components/jquery-color/jquery.color'
		, 'underscore' : '../components/underscore/underscore'
		, 'socket.io' : '../components/socket.io-client/socket.io'
	}

	, shim : {
		'jquery' : {
			exports: 'jQuery'
		}
		, 'jquery-color' : {
			deps: ['jquery']
			, exports: 'jQuery'
		}
	}
});

require(['app/app'], function(app) {
	app.start();
});