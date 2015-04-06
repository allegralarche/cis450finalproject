// Connect string to Oracle
var connectData = { 
  "hostname": "jdbc:oracle:thin:@//cis450projectdb.cc2zrrk5p1po.us-east-1.rds.amazonaws.com", 
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
	getBusinessesForList(todolist, function(businessesStruct) {
		getBestBusinessesAlgorithm(businessesStruct, function(bestBusinesses, unsatisfiedItems) {
			res.send({businesses:bestBusinesses, unsatisfiedItems:unsatisfiedItems});
		});
	});
};


//NINA'S CODE
var getBusinessesForList = function(todoList, callback) {
	//A dictionary that maps todo_item --> a set of json structures representing the businesses at which
	//you could complete that todo_item
	var itemsToBusinesses = {};
	
	callback(itemsToBusinesses);
};


//ALIZA AND JARED'S CODE
var getBestBusinessesAlgorithm = function(itemsToBusinesses, callback) {
	bestBusinesses = [];
	unsatisfiedToDos = [];
	
	callback(bestBusinesses, unsatisfiedToDos);
};