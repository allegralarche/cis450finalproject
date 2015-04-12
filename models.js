var dbConnection;
var searchRadius;

exports.init = function(callback) {
	searchRadius = 10; // 10 miles for now?
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

var itemToBusinesses = function(list, index, callback) {
	var item = list[index];
	var words = item.split(" ");
	//**Just using first word for now, should change if time
	var word = words[i];
	var allBusinesses = '[';
	getBusinessesViaCategories(word, startLatitude, startLongitude, function(businessList1) {
     	//getBusinessesViaProducts(word, startLatitude, startLongitude, function(businessList2) {
     	allBusinesses = allBusinesses + businessList1 + ']';
     	callback(item, allBusinesses, index);
     	//});
    });
};

exports.getAllBusinesses = function(i, items, json, callback) {
	itemToBusinesses(list, i, function(item, businessList, index) {
		json = json + '"'+ item +  '" : ';
		json = json + businessList;
		if (index == items.length-1) {
			callback(json);
		} else {
			i++;
			getAllBusinesses(i, items, json, callback);
		}
	});
}

Number.prototype.toRad = function() {
	return this * Math.PI / 180;
}

var latLongDistance = function(lat1, long1, lat2, long2, callback) {
	var R = 6371; // km 
	var x1 = lat2-lat1;
	var dLat = x1.toRad();  
	var x2 = lon2-lon1;
	var dLon = x2.toRad();  
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
	                Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
	                Math.sin(dLon/2) * Math.sin(dLon/2);  
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c; 
	callback(d);
}

getBusinessesViaCategories = function(keyword, lat, long, callback) {
    dbConnection.execute(
    	      "SELECT * FROM Business B "
      	    + "INNER JOIN Offers O ON B.BUSINESS_ID = O.BUSINESS_ID"
      	    + "WHERE O.CATEGORY_NAME LIKE %" + keyword + "%",
           // +        "AND SQRT((B.LATITUDE - " + lat + ") ^2 + "
          //  + "(B.LONGITUDE - " + long + ")^2) < " +  radius,
        function(err, result) {
      	    if (err) { 
      	    	console.error(err); 
    	        return; 
    	    }
    	    var rows = result.rows;
    	    var businesses = "";
	        for (var i = 0; i < rows.length; i++){
	        	data = JSON.parse(rows[i]);
	        	businesses += "{";
	        	businesses += "\"name\":\"" 	+ data.NAME 	   + "\", ";
	        	businesses += "\"bid\":\"" 		+ data.BUSINESS_ID + "\", ";
	        	businesses += "\"address\":\"" 	+ data.ADDRESS 	   + "\", ";
	        	businesses += "\"rating\":\"" 	+ data.RATING	   + "\", ";
	        	businesses += "\"lat\":\"" 		+ data.LATITUDE    + "\", ";
	        	businesses += "\"long\":\"" 	+ data.LONGITUDE   + "\", ";
	        	businesses += "},";
	        }
	        businesses = businesses.slice(0, str.length-1);
	        callback(businesses);
      	});
};


exports.getBusinessesViaProducts = function(keyword, lat, long){
    dbConnection.execute(
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