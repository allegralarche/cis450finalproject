var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var engine = require('ejs-locals');
var bodyParser = require('body-parser');
var routeFile = require('./routes.js');

app.set('port', process.env.PORT || 8080);
app.engine('ejs', engine);
app.set('views', path.join( __dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json());
app.use( express.static( path.join( __dirname, 'public' )));

routeFile.init(function() {
	app.get('/', routeFile.enterList);
	app.get('/home', routeFile.enterList);
	app.post('/processList', routeFile.processList);
    //app.post('/results', routeFile.returnResults);
	
	http.createServer(app).listen(app.get('port'), function() {
			 console.log( 'Open browser to http://localhost:' + app.get( 'port' ));
	});
});							
