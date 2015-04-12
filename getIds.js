var oracledb = require('oracledb');
var connectionData = { 
  "hostname": "cis550hw1.cfoish237b6z.us-west-2.rds.amazonaws.com", 
  "user": "cis550students", 
  "password": "cis550hw1", 
  "database": "IMDB" };

function getIdMap(result, todolist, lat, long, radius){
      var json = '{';            // the json to return 

      // for each to do item search for businesses
      for(var i = 0; i < todolist.length; i++){
        json = json + '"'+ todolist[i] +  '" : ' + '[';
        var words = todolist[i].split(" ");

        // check for category matches for each word in an item 
        for(var j = 0; j < words.length; j++){
          var businesses = getCategoryBusinesses(words[i], lat, long, radius);
          json = json + businesses;
          var businesses = getBusinesses(words[j], lat, long, radius);
          json = json + businesses; 
        }
        json = json + ']';
      }
      json = json + '}';
      return json;
}


function getBusinesses(keyword, lat, long, radius){
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


function getCategoryBusinesses(keyword, lat, long, radius){
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