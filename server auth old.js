//Require packeges we neeed
var express		= require("express");
var app			= express();
var bodyParser	= require("body-parser");
var morgan		= require("morgan");
var mongoose	= require("mongoose");
var passport	= require("passport");
var flash		= require("connect-flash");
var cookieParser = require("cookie-parser");
var session		= require("express-session");

var jwt		= require("jsonwebtoken");	//to create, sign, and verify tokens
var config	= require("./config");		//to config file
var User	= require("./app/models/user");	//get mongooes model

//Configuration
var port = process.env.PORT || 8080;
mongoose.connect(config.database);		//connect to database
app.set("superSecret", config.secret);	//secret variable

//set up our express apllication
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cookieParser());
// required for passport
app.use(session({ secret: config.secret })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


//Routes
app.get("/", function(req, res) {
	var apiLink = "http://localhost:" + port + "/api";
	res.send("hello the api is at <a href ='" + apiLink + " '>" + apiLink + "</a>");
});
app.get("/setup", function(req, res) {
	//create sample user
	var arianna = new User({
		name: "Arianna",
		password: "password",
		admin: true
	});

	arianna.save(function(err) {
		if (err) throw err;

		console.log("User saved successfully");
		res.json({success: true});
	});
});

//API Routes
//get an instance of the router for api Routes
var apiRoutes = express.Router();
//route to authenticate a user (POST /api/authenticate)
apiRoutes.post("/authenticate", function(req, res) {
	//find the user
	var search = {name: req.body.name};
	User.findOne(search, function (err, user) {
		if (err) throw err;
		if (!user) {
			res.json({success: false, message: "Authentication failed. User not found"});
		} else if (user) {
			//check is password matches
			if (user.password != req.body.password) {
				res.json({success: false, message: "Authentication failed. Wrong password"});
			} else {
				//user is found and password is right
				//create token
				var token = jwt.sign(user, app.get("superSecret"), {
					expiresInMinutes: 1440 //expires in 24 hours
				});

				//return the information including token as json
				res.json({
					success: true,
					message: "enjoy your token!",
					token: token
				});
			}
		}
	});
});
//TODO: route middleware to verify a token
apiRoutes.use(function(req, res, next) {

	//cheacl header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers["x-access-token"];

	//decode token
	if (token) {
		//verify secret and check exp
		jwt.verify(token, app.get("superSecret"), function(err, decoded) {
			if (err) {
				return res.json({success: false, message: "Failed to authenticate token."});
			} else {
				//if everything is good, save to request for use in another route
				req.decoded = decoded;
				next();
			}
		});
	} else {
		//if there is no token
		//return an error
		return res.status(403).send({
			success: false,
			message: "No Token Provided."
		});
	}
})

//route to show message /api/
apiRoutes.get("/", function(req, res) {
	res.json({message: "Welcome to le API"});
});
//route to return all users(GET /api/users)
apiRoutes.get("/users", function(req, res) {
	User.find({}, function(err, users) {
		if (err) throw err;
		res.json(users);
	});
});
//apply routes the our app with prefix /api
app.use("/api", apiRoutes);




//Start the server
app.listen(port);
console.log("magic happens at http://localhost:" + port);

//token
//eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjQ5MjVjOGFmMmVlNzUwMjYwMTc1ZWQiLCJsb2NhbCI6eyJwYXNzd29yZCI6InBybyIsInVzZXJuYW1lIjoiaXNhaWFoIn0sIl9fdiI6MH0.9ahKyNkem2PGHbKFaCEgYiE9RsB2oDzky7OXBSpNSrM
