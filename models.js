var dbConnection;

exports.init = function(callback) {
	var oracledb =  require('oracledb');
	var dbConfig = require('./dbconfig.js');
	
	oracledb.getConnection(
		{ user : dbConfig.user, password : dbConfig.password, connectString : dbConfig.connectString },
		function(err, connection) {
			if (err) {
				console.error('CONNECT ERR: ' + err.message);
			    return;
			}
			console.log('Connection was successful!');
			dbConnection = connection;
	});	
	callback();
}

exports.getBusinesses = function(keyword, lat, long, radius) {
    connection.execute(
    	      "SELECT *"
      	    + "FROM offers O "
      	    + "INNER JOIN business B ON B.BUSINESS_ID = O.BUSINESS_ID"
      	    + "WHERE O.CATEGORY_NAME LIKE %" + keyword + "% AND"
            +        "SQRT((B.LATITUDE - " + lat + ") ^2 + "
            + "(B.LONGITUDE - " + long + ")^2) < " +  radius,
    	      function(err, result)
    	      {
    	        if (err) { 
    	        	console.error(err); 
    	        	return; 
    	        	}
    	        var rows = result.rows;
    	        var result = "";
    	        for (var i = 0; i < rows.length; i++){
    	        	data = JSON.parse(rows[i]);
    	        	result += "{";
    	        	result += "\"name\":\"" 	+ data.NAME 	   + "\", ";
    	        	result += "\"bid\":\"" 		+ data.BUSINESS_ID + "\", ";
    	        	result += "\"address\":\"" 	+ data.ADDRESS 	   + "\", ";
    	        	result += "\"rating\":\"" 	+ data.RATING	   + "\", ";
    	        	result += "\"lat\":\"" 		+ data.LATITUDE    + "\", ";
    	        	result += "\"long\":\"" 	+ data.LONGITUDE   + "\", ";
    	        	result += "}";
    	        }
    	      });
  return result;
}


exports.getCategoryBusinesses = function(keyword, lat, long, radius){
    connection.execute(
  	      "SELECT *"
  	    + "FROM product P "
  	    + "INNER JOIN offers O ON O.CATEGORY_NAME = P.CATEGORY_NAME"
  	    + "INNER JOIN business B ON B.BUSINESS_ID = O.BUSINESS_ID"
  	    + "WHERE P.NAME LIKE %" + keyword + "% AND"
            +        "SQRT((B.LATITUDE - " + lat + ") ^2 + "
            + "(B.LONGITUDE - " + long + ")^2) < " +  radius,
  	      function(err, result)
  	      {
  	        if (err) { 
  	        	console.error(err); 
  	        	return; 
  	        	}
  	        var rows = result.rows;
  	        var result = "";
  	        for (var i = 0; i < rows.length; i++){
  	        	data = JSON.parse(rows[i]);
	        	result += "{";
	        	result += "\"name\":\"" 	+ data.NAME 	   + "\", ";
	        	result += "\"bid\":\"" 		+ data.BUSINESS_ID + "\", ";
	        	result += "\"address\":\"" 	+ data.ADDRESS 	   + "\", ";
	        	result += "\"rating\":\"" 	+ data.RATING	   + "\", ";
	        	result += "\"lat\":\"" 		+ data.LATITUDE    + "\", ";
	        	result += "\"long\":\"" 	+ data.LONGITUDE   + "\", ";
	        	result += "}";
  	        }
  	      });
return result;
}