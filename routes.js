
exports.init = function(callback) {
	/*console.log('routes.init called');
	var oracledb =  require("oracledb");
	console.log('after require');

	var connectData = { 
		  user: "admin", 
		  password: "cis450project", 
		  connectString: "cis450projectdb.cc2zrrk5p1po.us-east-1.rds.amazonaws.com"
	};

	oracledb.getConnection(connectData, function(err, connection) {
	    if (err) {
	    	console.log(err.message);
	    } else {
	    	console.log("CONNECTED");
	    }
	});
	*/
	callback();
};

exports.enterList = function(req, res) {
	res.render('todo_list');
};

//This route should be called (as a GET request) when the todo list is submitted
exports.processList = function(req, res) {
	var todolist = req.body.list;
	console.log('SUBMITTED LIST: ' + todolist);
	var startAddress = req.body.startingAddress;
	var useMinimalMetric = req.body.useMinimalMetric;
	
	getBusinessesForList(todolist, startAddress, function(businessesStruct) {
		bestBusinessesAlgorithm(businessesStruct, startAddress, true, 
				function(idsToItems, idsToBusinesses, unsatisfiedItems) {
			res.send({idsToItems:idsToItems, idsToBusinesses:idsToBusinesses, unsatisfiedItems:unsatisfiedItems});
		});
	});
};

//Called as a POST request to show the user his/her results
exports.displayResults = function(req, res) {
	var recommendations = JSON.parse(req.body.idsToItems);
	var idsToBusinesses = JSON.parse(req.body.idsToBusinesses);
	var unsatisfiedToDos = JSON.parse(req.body.unsatisfiedItems);
	console.log(recommendations);
	console.log(idsToBusinesses);
	console.log(unsatisfiedToDos);
	
	//Put info into format that can be easily displayed in show_results
	//res.render('show_results', {});
}


//NINA'S CODE -- arguments passed in are the user's todo list items, and the user's starting address
var getBusinessesForList = function(todoList, startAddress, callback) {
	//A dictionary that maps todo_item --> a set of json structures representing the businesses at which
	//you could complete that todo_item
	var itemsToBusinesses = {}; 
	
	callback(itemsToBusinesses);
};

/*
 * Expected format of itemsToBusinesses:
 * var item_dict = '{"buy_shirt":' +  
	'[ {"name":"Target", "bid":"hfsd7383fj9", "address":"4000 Pine Street", "rating":"3.5", "lat":"0.0", "long":"0.0"},' +
     '{"name":"Walmart", "bid": "hfg3653fj9", "address": "200 South Columbus", "rating":"4.0", "lat":"0.0", "long":"0.0"} ],' + 
	'"get haircut":' +
	'[ {"name":"Kidz Cutz", "bid":"hfsd7383fj9", "address":"4000 Pine Street", "rating":"3.5", "lat":"0.0", "long":"0.0"},' +
     '{"name":"Bob Barber", "bid": "hfg3653fj9", "address": "200 South Columbus", "rating":"4.0", "lat":"0.0", "long":"0.0"} ] }';
 */

//ALIZA AND JARED'S CODE
var bestBusinessesAlgorithm = function(itemsToBusinesses, startAddress, useMinimalMetric, callback) {

	//IN FOR TESTING ONLY
	var item_dict = '{' +
	'"buy_shirt":' +  
		'[ {"name":"Target", "bid":"1", "address":"4000 Pine Street", "rating":"3.5", "lat":"0.0", "long":"0.0"},' +
     	  '{"name":"Walmart", "bid": "2", "address": "200 South Columbus", "rating":"2.0", "lat":"0.0", "long":"0.0"} ],' + 
	'"get haircut":' +
		'[ {"name":"Walmart", "bid":"2", "address":"4000 Pine Street", "rating":"2.0", "lat":"0.0", "long":"0.0"},' +
     	  '{"name":"Bob Barber", "bid": "4", "address": "200 South Columbus", "rating":"4.0", "lat":"0.0", "long":"0.0"} ],' +
    '"deck furniture":' +
		'[ {"name":"Target", "bid":"1", "address":"4000 Pine Street", "rating":"3.5", "lat":"0.0", "long":"0.0"},' +
		  '{"name":"Walmart", "bid":"2", "address":"4000 Pine Street", "rating":"2.0", "lat":"0.0", "long":"0.0"},' +
     	  '{"name":"Furniture Depot", "bid": "6", "address": "200 South Columbus", "rating":"4.0", "lat":"0.0", "long":"0.0"} ],' + 
    '"get milk":' +
    	'[ {"name":"Pathmark", "bid":"5", "address":"4000 Pine Street", "rating":"3.5", "lat":"0.0", "long":"0.0"},' +
    	  '{"name":"Shoprite", "bid":"7", "address":"4000 Pine Street", "rating":"3.5", "lat":"0.0", "long":"0.0"},' +
     	  '{"name":"Walmart", "bid": "2", "address": "200 South Columbus", "rating":"2.0", "lat":"0.0", "long":"0.0"} ],' + 
    '"get birthday cake":' +
    	'[ {"name":"Perfect Pastries", "bid":"8", "address":"4000 Pine Street", "rating":"3.5", "lat":"0.0", "long":"0.0"} ], ' +
    '"get bread":' +
    	'[ {"name":"Perfect Pastries", "bid":"8", "address":"4000 Pine Street", "rating":"3.5", "lat":"0.0", "long":"0.0"},' +
    	  '{"name":"Walmart", "bid": "2", "address": "200 South Columbus", "rating":"2.0", "lat":"0.0", "long":"0.0"} ]' + 
    	  '}';

	//SWITCH BACK TO itemsToBusinesses
	var obj = JSON.parse(item_dict);
	
	if (useMinimalMetric) {
		leastBusinessesMetric(obj, function(suggestions, unsatisfiedToDos) {
			console
			//finalMapping is of type bid --> [item], idsToBusinesses is of type bid --> business_object
			breakTies(suggestions, obj, function(finalMapping, idsToBusinesses) {
				callback(finalMapping, idsToBusinesses, unsatisfiedToDos);
			});
		});
	} else {
		shortestDistanceMetric(obj, startAddress, function(finalMapping, idsToBusinesses, unsatisfiedToDos) {
			callback(finalMapping, idsToBusinesses, unsatisfiedToDos);
		});
	}	
};

var breakTies = function(suggestions, originalObj, callback) {
	itemToBusiness = {};
	for (var toDoItem in originalObj) { 
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


//JARED'S CODE
var shortestDistanceMetric = function(obj, startAddress, callback) {
	
	//map of type bid --> [todo items]
	var suggestions = {};
	//map of type bid --> business_obj
	var idsToBusinesses = {};
	//list of any to-do items not satisfied
	var unsatisfiedToDos = [];
	callback(suggestions, idsToBusinesses, unsatisfiedToDos);
	
}

var leastBusinessesMetric = function(obj, callback) {
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
				itemCount = 1;
			}
			itemList.push(toDoItem);
			itemCount += 1;
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

	/*for (var i = 0; i < suggestedBusinesses.length; i++) {
		console.log(suggestedBusinesses[i]);
	}*/
	
	callback(suggestedBusinesses, unsatisfiedToDos);
}

