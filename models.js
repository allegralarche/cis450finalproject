var dbConnection;
var SEARCH_RADIUS;

exports.init = function(callback) {
	SEARCH_RADIUS = 15; // 15 km for now
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
	} else if (item.indexOf('Look for ') == 0 || item.indexOf('look for ') == 0) {
		item = item.slice(9);
	} else if (item.indexOf('Shop for ') == 0 || item.indexOf('shop for') == 0) {
		item = item.slice(9);
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
	getBusinessesFromDB(keyword, lat, long, false, function(businessList1) {
		if (businessList1.length > 0) {
			allBusinesses = allBusinesses + businessList1 + '],';
     		callback(item, allBusinesses, index);
		} else {
			getBusinessesFromDB(keyword, lat, long, true, function(businessList2) {
	     		allBusinesses = allBusinesses + businessList2 + '],';
	     		callback(item, allBusinesses, index);
	     	});
		}
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

getBusinessesFromDB = function(keyword, lat, long, useProductTable, callback) {
	console.log(keyword);
	var stmt;
	if (useProductTable) {
		stmt = "SELECT DISTINCT * FROM Business B "
	  	    + "INNER JOIN Offers O ON B.BUSINESS_ID = O.BUSINESS_ID "
	  	    + "INNER JOIN Product P ON P.category_name = O.category_name "
	  	    + "WHERE P.NAME LIKE '%" + keyword + "%'";
	} else {
		stmt = "SELECT DISTINCT * FROM Business B "
	  	    + "INNER JOIN Offers O ON B.BUSINESS_ID = O.BUSINESS_ID "
	  	    + "WHERE O.CATEGORY_NAME LIKE '%" + keyword + "%'";
	}
    dbConnection.execute(stmt, {}, {"maxRows":5000}, function(err, result) {
  	    if (err) { 
  	    	console.error('SQL ERR: ' + err); 
	        return; 
	    }
	    var rows = result.rows;
	    console.log('NUM ROWS RETURNED: ' + rows.length);
	    rows = filterByDistance(rows, lat, long);
	    console.log('ROWS AFTER FILTER: ' + rows.length);
	    //console.log('RESULT OF QUERY: ' + rows);
	    var businesses = "";
        for (var i = 0; i < rows.length; i++) {
        	row = rows[i];
        	address = String(row[2]).trim();
        	address = address.replace(/\t/g, " ").replace(/\n/g, " ");
        	businesses += "{";
            businesses += "\"name\":\"" 	+ String(row[1]).trim() + "\", ";
            businesses += "\"bid\":\"" 		+ String(row[0]).trim() + "\", ";
            businesses += "\"address\":\"" 	+ address               + "\", ";
            businesses += "\"rating\":\"" 	+ String(row[5]).trim() + "\", ";
            businesses += "\"lat\":\"" 		+ String(row[3]).trim() + "\", ";
            businesses += "\"long\":\"" 	+ String(row[4]).trim() + "\" ";
            businesses += "},";
        }
        businesses = businesses.slice(0, businesses.length-1);
        callback(businesses);
    });
};

var filterByDistance = function(businesses, startLat, startLong) {
	var filtered = [];
	for (var i = 0; i < businesses.length; i++) {
		var business = businesses[i];
		var lat = business[3];
		var long = business[4];
		var dist = latLongDistance(lat, long, startLat, startLong);
		//console.log('distance found: ' + dist);
		if (dist <= SEARCH_RADIUS) {
			filtered.push(business);
		}
	}
	return filtered;
}

toRad = function(num) {
	return num * Math.PI / 180;
}

var latLongDistance = function(lat1, lon1, lat2, lon2) {
	//console.log(lat1 + ", " + lon1 + ", " + lat2 + ", " + lon2);
	var R = 6371; // km 
	var x1 = lat2-lat1;
	var dLat = toRad(x1); 
	var x2 = lon2-lon1;
	var dLon = toRad(x2); 
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
	                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
	                Math.sin(dLon/2) * Math.sin(dLon/2);  
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	return R * c; 
}