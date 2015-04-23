var models;
var sha1;

exports.init = function(callback) {
	models = require('./models.js');
	sha1 = require('node-sha1');
	callback();
};

exports.login = function(req, res) {
	res.render('login');
};

exports.validate = function(req, res) {
	var username = req.body.username;
	var hashed_pw = sha1(req.body.password);
	models.validateUser(username, hashed_pw, function(result) {
		if (result == 'valid') {
			req.session.loggedin = true;
			res.send("validated");
		} else {
			res.send("failed");
		}
	})
};

exports.signup = function(req, res) {
	res.render('signup');
};

exports.logout = function(req, res) {
	console.log("in logout route");
	req.session.destroy;
	res.send('done');
}

exports.createAccount = function(req, res) {
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var username = req.body.username;
	var password = req.body.password;
	if (!firstname || !lastname || !username || !password) {
		res.send("Error: Missing field");
	} else {
		var hashed_pw = sha1(password);
		models.createUser(firstname, lastname, username, hashed_pw, function(result) {
			if (result == "username exists") {
				res.send("Error: Email exists");
			} else {
				req.session.loggedin = true;
				res.send("success");
			}
		});
	}
}

exports.enterList = function(req, res) {
	if (req.session.loggedin) {
		res.render('todo_list')
	} else {
		res.redirect("/login");
	}
};

//This route should be called (as a GET request) when the todo list is submitted
exports.processList = function(req, res) {
	var todolist = req.body.list;
	var lat = req.body.latitude;
	var lng = req.body.longitude;
	var useMinimalMetric = req.body.useMinimalMetric;
	
	getBusinessesForList(todolist, lat, lng, function(businessesStruct) {
		bestBusinessesAlgorithm(businessesStruct, lat, lng, useMinimalMetric, 
				function(idsToItems, idsToBusinesses, unsatisfiedItems) {
			res.send({idsToItems:idsToItems, idsToBusinesses:idsToBusinesses, unsatisfiedItems:unsatisfiedItems});
		});
	});
};

//Called as a GET request to show the user his/her results
exports.displayResults = function(req, res) {



	var recommendations = JSON.parse(req.params.idsToItems);
	var idsToBusinesses = JSON.parse(req.params.idsToBusinesses);
	var unsatisfiedToDos = JSON.parse(req.params.unsatisfied);
	var lat = req.params.lat;
	var lng = req.params.lng;
	console.log(recommendations);
	console.log(idsToBusinesses);
	console.log(unsatisfiedToDos);
	console.log("Starting loc: " + lat +", " + lng);

	// populate tasklist object
	// really just want one object which is a map from business names to array of items completed there
	var taskList = [];
	for(var id in recommendations) {

		taskList.push({
			name: idsToBusinesses[id].name,
			address: idsToBusinesses[id].address,
			tasks: recommendations[id]
		});
	}
		
	var taskListString = JSON.stringify(taskList);
	var unsatisfiedToDosString = JSON.stringify(unsatisfiedToDos);
	
	console.log('taskList: ' + taskListString);
	console.log('unsatisfiedToDos: ' + unsatisfiedToDosString);
	
	//Put info into format that can be easily displayed in show_results
	res.render('show_results', {
		taskList: taskListString, 
		unsatisfiedToDos: unsatisfiedToDosString,
		lat: lat,
		lng: lng
	});
}

var getBusinessesForList = function(todoList, startLatitude, startLongitude, callback) {	
    var json = '{';
	models.getAllBusinesses(0, todoList, json, startLatitude, startLongitude, function(json) {
		 json = json + '}';
		 //console.log('JSON: ' + json);
		 callback(json);
	});
};

//ALIZA AND JARED'S CODE
var bestBusinessesAlgorithm = function(itemsToBusinesses, latitude, longitude, useMinimalMetric, callback) {

	var obj = JSON.parse(itemsToBusinesses);
	if (useMinimalMetric == "true") {
		leastBusinessesMetric(obj, function(suggestions, unsatisfiedToDos) {
			//finalMapping is of type bid --> [item], idsToBusinesses is of type bid --> business_object
			breakTies(suggestions, obj, unsatisfiedToDos, function(finalMapping, idsToBusinesses) {
				callback(finalMapping, idsToBusinesses, unsatisfiedToDos);
			});
		});
	} else if (useMinimalMetric == "false") {
		shortestDistanceMetric(obj, latitude, longitude, function(finalMapping, idsToBusinesses, unsatisfiedToDos) {
			callback(finalMapping, idsToBusinesses, unsatisfiedToDos);
		});
	}	
};

var breakTies = function(suggestions, originalObj, unsatisfiedItems, callback) {
	itemToBusiness = {};
	for (var toDoItem in originalObj) { 
		if (unsatisfiedItems.indexOf(toDoItem) > -1 ) {
			continue;
		}
		var allBusinesses = originalObj[toDoItem];
		var potentialBusinesses = [];
		/* Loop through all of the businesses that satisfy this item from the original JSON,
		and if it is in the list of businesses that we are recommending, include it */
		for (var i = 0 ; i < allBusinesses.length; i++) {
			var business = allBusinesses[i];
			var bid = business.bid;
			if (suggestions.indexOf(bid) > -1) {
				potentialBusinesses.push(business);
			}
		}
		var highestRated = potentialBusinesses[0];
		var highestRating = highestRated.rating;
		//console.log(highestRated);
		//console.log(highestRating);
		for (var i = 1; i < potentialBusinesses.length; i++) {
			business = potentialBusinesses[i];
			rating = business.rating;
			//console.log(business.name);
			//console.log(rating);
			if (rating > highestRating) {
				console.log('CHANGING');
				highestRated = business;
				highestRating = rating;
			}
		}
		itemToBusiness[toDoItem] = highestRated;
	}
	var finalMapping = {}; // FINAL mapping of businesses to items, to display in results
	idToBusiness = {}; //Additional dict to return so that we can easily get entire business from the id

	for (item in itemToBusiness) {
		var business = itemToBusiness[item];
		var bid = business.bid;
		idToBusiness[bid] = business;
		//console.log('item: ' + item);
		//console.log('  sugg business: ' + business.bid);
		//console.log(business);
		var itemList = finalMapping[bid];
		if (itemList == null) {
			itemList = [];
		}
		//console.log('ITEM LIST: ' + itemList);
		itemList.push(item);
		finalMapping[bid] = itemList;
	}
	
	/*for (bid in finalMapping) {
		console.log(bid);
		console.log('    ' + finalMapping[bid]);
	}

	for (bid in idToBusiness) {
		console.log(bid);
		console.log('    ' + idToBusiness[bid].name);
	}*/

	callback(finalMapping, idToBusiness);
}

var leastBusinessesMetric = function(obj, callback) {
	console.log('IN LEAST BUSINESSES');
	//Reverse dict from businesses to to-do item
	var businessesToItems = {};
	//Dict from business to number of to-do items covered
	var businessesToCount = {};
	//List of all todo items
	var allItems = [];
	//Any todo items that are satisfied by no businesses
	var unsatisfiedToDos = [];

	for (var toDoItem in obj) {
		allItems.push(toDoItem)
		var business_list = obj[toDoItem];
		if (business_list.length == 0) {
			unsatisfiedToDos.push(toDoItem);
		}
		for (var  i = 0; i < business_list.length; i++) {
			var businessId = business_list[i].bid;
			itemList = businessesToItems[businessId];
			itemCount = businessesToCount[businessId];
			if (itemList == null) {
				itemList = [];
				itemCount = 0;
			}
			if (itemList.indexOf(toDoItem) == -1 ) {
				itemList.push(toDoItem);
				itemCount += 1;
			}
			businessesToItems[businessId] = itemList;
			businessesToCount[businessId] = itemCount;
		}
	}

	// Create items array
	var sortedByCount = Object.keys(businessesToCount).map(function(key) {
	    return [key, businessesToCount[key]];
	});

	// Sort the array based on the second element
	sortedByCount.sort(function(first, second) {
	    return second[1] - first[1];
	});

	//list of the ids of suggested businesses
	var suggestedBusinesses = [];

	for (var i = 0; i < sortedByCount.length; i++) {
		var obj = sortedByCount[i];
		businessId = obj[0];
		//console.log('looking at business: ' + businessId);
		satisfiedItems = businessesToItems[businessId];
		//console.log('   items it satisfies: ' + satisfiedItems);
		//Remove all of the items that this business covers from the remaining list of todo items
		var beingUsed = false;
		for (var j = 0; j < satisfiedItems.length; j++) {
			var item = satisfiedItems[j];
			var index = allItems.indexOf(item);
			if (index > -1) {
				beingUsed = true;
				allItems.splice(index, 1);
			}
		}
		/* Once we are including a business in the suggested list for reasons of even 1 of the items it satisfies, the list of satisfiedItems 
		will include ALL items that this business can possibly satisfy, even if another business has already been selected to satisfy the
		item -- The decision for which single business to suggest for an item if multiple in the solution satisfy it will be made based 
		on superior ranking */
		if (beingUsed) {
			suggestedBusinesses.push(businessId);
		}

		//console.log('   current state of allItems: ' + allItems);
		//If all of the todo items have been taken care of, break
		if (allItems.length == 0) {
			break;
		}
	}

	for (var i = 0; i < suggestedBusinesses.length; i++) {
		console.log(suggestedBusinesses[i]);
	}
	
	callback(suggestedBusinesses, unsatisfiedToDos);
}

//JARED'S CODE
var shortestDistanceMetric = function(obj, startLatitude, startLongitude, callback) {
	console.log("IN SHORTEST DISTANCE");
	//map of type bid --> [todo items]
	var suggestions = {};
	//map of type bid --> business_obj
	var idsToBusinesses = {};
	//list of any to-do items not satisfied
	var unsatisfiedToDos = [];
	//list of the ids of suggested businesses
	var suggestedBusinesses = [];
	
	
	for (var item in obj) {
		var business_list = obj[item];
		var min_dist = 0.0;
		var closest_bid = "";
		var closest_index = -1;
		var d_min = 25.0 //harcoded?? 
		if (business_list.length == 0) { 
			unsatisfiedToDos.push(item);
			break; 
		}
		for (var  i = 0; i < business_list.length; i++) {
			var lat = business_list[i].lat;
			var lon = business_list[i].long;
			d = getDistanceFromLatLonInKm(startLatitude,startLongitude,lat,lon);
			if (d < d_min) {
				d_min = d;
				closest_bid = business_list[i].bid
				closest_index = i;
			}
		}
		
		
		if (!(closest_bid in suggestions)) {
			suggestions[closest_bid] = [];
		}
		suggestions[closest_bid].push(item);
		idsToBusinesses[closest_bid] = business_list[closest_index];
		
		if (!(closest_bid in suggestedBusinesses)) {
			suggestedBusinesses.push(closest_bid);
		}
		
		
								
	}
	
	for (var i = 0; i < suggestedBusinesses.length; i++) {
		console.log(suggestedBusinesses[i]);
	}
	
	callback(suggestions, idsToBusinesses, unsatisfiedToDos);
	
}

//distance helper functions
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  //console.log(d);
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

