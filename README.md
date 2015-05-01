

# CIS450Project



## Usage
To open the app, please visit http://52.4.203.165:8080. Upon opening the app, either log in if you are already a user or sign up to have your information entered in the database. Once you are logged in and on the todo_list page, enter the tasks that you need to get done and select whether you want to go to the fewest number of businesses or the closest distance from where you are. 
This app uses an oracle database linked with the node-oracle module.   


## Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.

## Modules / Architecture
-Model: models.js contains all code for connecting to, querying, and updating the database. db_populator/ contains all ofthe files and original Yelp data used to populate our database.
-View: views/ contains all of the ejs files that represent the views for the different pages of the site.
-Controller: routes.js contains all of the routes for processing and passing data between the model and views.

