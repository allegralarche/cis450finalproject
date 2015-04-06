
exports.init = function(callback) {
	callback();
};

exports.enterList = function(req, res) {
	res.render('todo_list');
};

//This route should be called (as a POST request) when the todo list is submitted
exports.processList = function(req, res) {
	var todolist = req.body.list;
	
	

    
};

exports.returnResults = function(req, res) {

    // after whole list is processed, and algorithm is computed, return results page
    res.render('results');
}

