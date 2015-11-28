var Nerds = require("./models/nerd");
var express = require("express");

module.exports = function(app, passport) {
	//server routes
	//handle thinfs like api calls
	//authentication routes
	var apiRoutes = express.Router();
	apiRoutes.get("/", function(req, res) {
		res.send({success: true, message: "welcome to le api"});
	});
	
	apiRoutes.post("/signup", passport.authenticate('local-signup'), function(req, res){
        //console.log(req.user);
		console.log("sending response"); 
		res.json(req.user);
    });
	
	apiRoutes.get('/confirm-login', function (req, res) {
        res.send(req.user);
    });
	
	apiRoutes.post('/login', passport.authenticate('local-login'), function(req, res) {
		res.send(req.user);
	});
	
	app.use("/api", apiRoutes);
    
	// route to handle all angular requests
	app.use(express.static(__dirname + "/public"));
	/*
	app.get('*', function(req, res) {
		res.sendFile('./public/index.html'); // load our public/index.html file 
	});
	*/
}