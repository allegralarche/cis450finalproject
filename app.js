var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var engine = require('ejs-locals');
var bodyParser = require('body-parser');
var session = require('express-session');
var mapRoute, extrasRoute;

app.set('port', process.env.PORT || 8080);
app.engine('ejs', engine);
app.set('views', path.join( __dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json());
app.use( express.static( path.join( __dirname, 'public' )));

initRoutes('routes', function() {
	app.get('/', mapRoute.mapExplanation);
	app.get('/map', mapRoute.mapExplanation);
	app.get('/rate/:targetNum/:mapId/:statusMapId', mapRoute.rate);
	app.get('/status/:targetNum/:mapId/:rateMapId', mapRoute.status);
	app.get('/info', extrasRoute.info);
	http.createServer(app).listen(app.get('port'), function() {
			 console.log( 'Open browser to http://localhost:' + app.get( 'port' ));
	});
});							
											
// Initialize all route handlers in different .js files
var fs = require('fs');
function initRoutes(rootDir, callback) {
	var mapFile = path.join(rootDir, "map.js");
	var extrasFile = path.join(rootDir, "extras.js");
	mapRoute = require('./' + mapFile);
	extrasRoute = require('./' + extrasFile);
	
	mapRoute.init(function() {
		extrasRoute.init(function () {
			callback();
		});
	});
}
