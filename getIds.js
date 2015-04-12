var oracledb = require('oracledb');
var connectionData = { 
  "hostname": "cis550hw1.cfoish237b6z.us-west-2.rds.amazonaws.com", 
  "user": "cis550students", 
  "password": "cis550hw1", 
  "database": "IMDB" };

function getIdMap(result, todolist){
    oracledb.connect(connectionData, function(err, connection){
    if (err) {
      console.error(err.message);
      return;
    }
    else{
      var json = '{';            // the json to return 

      // for each to do item search for businesses
      for(var i = 0; i < todolist.length; i++){
        json = json + '"'+ todolist[i] +  '" : ' + '[';
        var words = todolist[i].split(" ");

        // check for category matches for each word in an item 
        for(var j = 0; j < words.length; j++){
          var businesses = getCategoryBusinesses(words[i])
          json = json + businesses;
          var businesses = getBusinesses(words[j]);
          json = json + businesses; 
        }
        json = json + ']';
      }
      json = json + '}';
      connection.close();
      return json;
    }c
  });
}


function getBusinesses(keyword){
    connection.execute(
    	      "SELECT *"
      	    + "FROM offers O "
      	    + "INNER JOIN business B ON B.BUSINESS_ID = O.BUSINESS_ID"
      	    + "WHERE O.CATEGORY_NAME LIKE %" + keyword + "%",
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


function getCategoryBusinesses(keyword){
    connection.execute(
  	      "SELECT *"
  	    + "FROM product P "
  	    + "INNER JOIN offers O ON O.CATEGORY_NAME = P.CATEGORY_NAME"
  	    + "INNER JOIN business B ON B.BUSINESS_ID = O.BUSINESS_ID"
  	    + "WHERE P.NAME LIKE %" + keyword + "%",
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