// Connect string to Oracle
var connectData = { 
  "hostname": "cis450projectdb.cc2zrrk5p1po.us-east-1.rds.amazonaws.com", 
  "user": "admin", 
  "password": "cis450project", 
  "database": "CIS450DB",
  "port": "1521" };
//var oracle =  require("oracle");


exports.init = function(callback) {
	callback();
};

exports.enterList = function(req, res) {
	res.render('todo_list');
};

//This route should be called (as a POST request) when the todo list is submitted
exports.processList = function(req, res) {
	var todolist = req.body.list;
	var startAddress = req.body.startingAddress;
	getBusinessesForList(todolist, startAddress, function(businessesStruct) {
		getBestBusinessesAlgorithm(businessesStruct, startAddress, function(bestBusinesses, unsatisfiedItems) {
			res.send({businesses:bestBusinesses, unsatisfiedItems:unsatisfiedItems});
		});
	});
};


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
var getBestBusinessesAlgorithm = function(itemsToBusinesses, startAddress, callback) {
	bestBusinesses = [];
	unsatisfiedToDos = [];
	
	
	
	var obj = JSON.parse(itemsToBusinesses);
	
	for (var item in obj) {
		console.log(item);
		var business_list = obj[item];
		for (var  i = 0; i < business_list.length; i++) {
			console.log(business_list[i].name);
		}
	}
	
	callback(bestBusinesses, unsatisfiedToDos);
};

