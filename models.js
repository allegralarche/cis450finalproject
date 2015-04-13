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

//Turn a user's todo item into a keyword to use to query the database
var itemToKeyword = function(item, callback) {
	if (item.indexOf('buy ') == 0 || item.indexOf('Buy ') == 0) {
		item = item.slice(4);
	} else if (item.indexOf('go to ') == 0 || item.indexOf('Go to ') == 0) {
		item = item.slice(6);
	} else if (item.indexOf('get ') == 0 || item.indexOf('Get ') == 0) {
		item = item.slice(4);
	} else if (item.indexOf('do ') == 0 || item.indexOf('Do ') == 0) {
		item = item.slice(3);
	} else if (item.indexOf('pick up ') == 0 || item.indexOf('Pick up ') == 0) {
		item = item.slice(8);
	} else if (item.indexOf('Join ') == 0 || item.indexOf('join ') == 0) {
		item = item.slice(5);
	}
	var words = item.split(" ");
	//**Just using first word for now, should change if time
	var word = words[0];
	word = word.slice(0,1).toUpperCase() + word.slice(1);
	return word;
} 

var itemToBusinesses = function(list, index, lat, long, callback) {
	var item = list[index]; // the full, original todo item as entered
	var keyword = itemToKeyword(item); // the keyword resulting from parsing the item, used for querying the db
	var allBusinesses = '[';
	getBusinessesViaCategories(keyword, lat, long, function(businessList1) {
     	//getBusinessesViaProducts(word, startLatitude, startLongitude, function(businessList2) {
     	allBusinesses = allBusinesses + businessList1 + '],';
     	callback(item, allBusinesses, index);
     	//});
    });
};

getAllBusinesses = function(i, items, json, lat, long, callback) {
	itemToBusinesses(items, i, lat, long, function(item, businessList, index) {
		json = json + '"'+ item +  '" : ';
		json = json + businessList;
		//console.log('json after iteration of itemToBusinesses: ' + json);
		if (index == items.length-1) {
			json = json.slice(0, json.length-1);
			callback(json);
		} else {
			i++;
			getAllBusinesses(i, items, json, lat, long, callback);
		}
	});
}
module.exports.getAllBusinesses = getAllBusinesses;

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
	console.log(keyword);
	var stmt =   "SELECT * FROM Business B "
  	    + "INNER JOIN Offers O ON B.BUSINESS_ID = O.BUSINESS_ID "
  	    + "WHERE O.CATEGORY_NAME LIKE '%" + keyword + "%'";
       // +        "AND SQRT((B.LATITUDE - " + lat + ") ^2 + "
      //  + "(B.LONGITUDE - " + long + ")^2) < " +  radius,
    dbConnection.execute(stmt, function(err, result) {
  	    if (err) { 
  	    	console.error('SQL ERR: ' + err); 
	        return; 
	    }
	    var rows = result.rows;
	    //console.log('RESULT OF QUERY: ' + rows);
	    var businesses = "";
        for (var i = 0; i < rows.length; i++) {
        	row = rows[i];
        	//console.log(row);
        	businesses += "{";
            businesses += "\"name\":\"" 	+ row[1] 	   + "\", ";
            businesses += "\"bid\":\"" 		+ row[0] + "\", ";
            businesses += "\"address\":\"" 	+ row[2] 	   + "\", ";
            businesses += "\"rating\":\"" 	+ row[5]	   + "\", ";
            businesses += "\"lat\":\"" 		+ row[3]    + "\", ";
            businesses += "\"long\":\"" 	+ row[4]   + "\" ";
            businesses += "},";
        }
        businesses = businesses.slice(0, businesses.length-1);
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