//Require packeges we neeed
var express		= require("express");
var app			= express();
var bodyParser	= require("body-parser");
var morgan		= require("morgan");
var mongoose	= require("mongoose");
var passport	= require("passport");
var flash		= require("connect-flash");
var session		= require("express-session");
var cookieParser	= require("cookie-parser");
var methodOverride	= require("method-override");

var jwt		= require("jsonwebtoken");	//to create, sign, and verify tokens
var config	= require("./config");		//to config file
var db		= require("./config/database");	//to config file
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
require('./config/passport')(passport); // pass passport for configuration
app.use(session({ secret: config.secret })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public')); 

// routes
require('./app/routes')(app, passport); // configure our routes


//Start the server
app.listen(port);
console.log("magic happens at http://localhost:" + port);

//expose app
exports = module.exports = app;//

//token
//eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjQ5MjVjOGFmMmVlNzUwMjYwMTc1ZWQiLCJsb2NhbCI6eyJwYXNzd29yZCI6InBybyIsInVzZXJuYW1lIjoiaXNhaWFoIn0sIl9fdiI6MH0.9ahKyNkem2PGHbKFaCEgYiE9RsB2oDzky7OXBSpNSrM
