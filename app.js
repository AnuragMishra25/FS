/* 
    Funding Society TT Booking - APP JS
    Version: 1.0
    Author: Anurag Mishra
    Dated: Sat, 15 Jul 2017 12:50 GMT
*/

const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const request = require('request');
const sqlite3 = require('sqlite3').verbose();
const body_parser = require('body-parser');
const cookie_parser = require('cookie-parser');
const nunjucks = require('nunjucks');
const dbPath = "./TableBooking.db";
const db = new sqlite3.Database(dbPath);
const port = 3000;
const router = express.Router();

//configuring nunjucks
nunjucks.configure('./public/views/', {
    autoescape: true,
    express: app
});

app.use(express.static('public'));

//using bodyparser for various response parsing
app.use(body_parser.json());
app.use(body_parser.urlencoded({
  extended: true
}));

app.use(cookie_parser()); 

app.set('view engine', 'html');
app.use('/', router); 
 /**
 * Default route for the application, checks DB connections get hold of total rows in DB
 * @param {object} req - Node req object used for making server calls from Node server
 * @param {object} res - Node res object used for receiving result from Node server calls
 */
router.get('/', function (req, res) {
	if(req.cookies.userId != undefined){
		res.status(200).render('booking');
	}else{
		res.status(200).render("login");
	}
})

 /**
 * API to render booking page, if logged in, else redirection to Login page
 * @param {object} req - Node req object used for making server calls from Node server
 * @param {object} res - Node res object used for receiving result from Node server calls
 */
router.get('/booking', function(req, res){
	if(req.cookies.userId != undefined){
		res.render('booking');
	}else{
		res.render("login");
	}
})

 /**
 * API for creating new user with given username and password
 * @param {object} req - Node req object used for making server calls from Node server
 * @param {object} res - Node res object used for receiving result from Node server calls
 */
router.post('/User', function(req, res){
	console.log(req.body);
  	let email = req.body.data.email;
  	let password = req.body.data.password;
    db.all("SELECT * FROM User WHERE email='" + email + "' AND password ='" + password + "';",function(err,rows){
		if(err){
			console.log(err);
			res.status(500).json({"error" : true, "message" : "Error while Fetching data from User Table"});
			// res.status(500).send({message: '',  error: err});
		}else{
			//checking if username and password combo already taken
			if(rows.length > 0){
				res.status(500).json({"error" : true, "message" : "User Already exists"});
				// res.status(500).send("");
			}else{
				db.all("INSERT INTO User (email, password) VALUES ('" + email + "','" + password + "');",function(err,rows){
					if(err){
						console.log(err);
						res.status(500).json({"error" : true, "message" : "Error while Fetching columns from table"});
						// res.status(500).send({message: '',  error: err});
					}else{
						console.log(rows);
						res.status(200).json({"error" : false, "message" : rows});
						// res.send(rows);
					}
				});
			}
		}
	});
})

 /**
 * API for creating new user with given username and password
 * @param {object} req - Node req object used for making server calls from Node server
 * @param {object} res - Node res object used for receiving result from Node server calls
 */
router.delete('/User', function(req, res){
	console.log(req.body);
  	let email = req.body.data.email;
  	let password = req.body.data.password;
	  console.log("came here"+ req.body);
    db.all("DELETE FROM User WHERE email='" + email + "' AND password ='" + password + "';",function(err,rows){
		if(err){
			console.log(err);
			res.status(500).json({"error" : true, "message" : "Error while deleting data from User Table"});
		}else{
			res.status(200).json({"error" : false, "message" : rows});
		}
	});
})

/**
 * API for fetching user information on the basis of username and password
 * @param {object} req - Node req object used for making server calls from Node server
 * @param {object} res - Node res object used for receiving result from Node server calls
 */
router.get('/User', function(req, res){
  	let email = req.query.email;
  	let password = req.query.password;
  	db.all("SELECT * FROM User WHERE email='" + email + "' AND password ='" + password + "';",function(err,rows){
		if(err){
			console.log(err);
			res.status(500).json({"error" : true, "message" : "Error while Fetching user from User table"});
			// res.status(500).send({message: 'Error while Fetching user from User table',  error: err});
		}else{
			if(rows.length >0){
				res.status(200).json({"error" : false, "message" : rows});
				// res.status(200).send(rows);
			}else{
				res.status(500).json({"error" : true, "message" : "no record found"});
				// res.status(500).send("");
			}
		}
	});
})

/**
 *API for fetching all bookings for User from given UserId
 * @param {object} req - Node req object used for making server calls from Node server
 * @param {object} res - Node res object used for receiving result from Node server calls
 */
router.get('/Booking/User', function(req, res){
  	let userId = req.cookies.userId;
  	db.all("SELECT * FROM Booking WHERE user_id=" + userId +" ORDER BY date, start_time;",function(err,rows){
		if(err){
			console.log(err);
			res.status(500).json({"error" : true, "message" : "Error while Fetching bookings for a user"});
			// res.status(500).send({message: 'Error while Fetching bookings for a user',  error: err});
		}else{
			console.log('now rows' + rows.length);
			res.status(200).json({"error" : false, "message" : rows});
			// res.send(rows);
		}
	});
})

/**
 *API for creating new Booking
 * @param {object} req - Node req object used for making server calls from Node server
 * @param {object} res - Node res object used for receiving result from Node server calls
 */
router.post('/Booking', function(req, res){
	let userId = req.body.data.userId;
	let startTime = req.body.data.startTime;
	let date = req.body.data.bookingDate;
	let duration = req.body.data.duration;
	let d = new Date();
	db.all("INSERT INTO Booking (start_time, date, user_id, created_at, duration) VALUES ('" 
	+ startTime + "','" + date + "','" + userId + "','" + d +  "','" + duration +"');",function(err,rows){
		if(err){
			console.log(err);
			res.status(500).json({"error" : true, "message" : "Error while creating booking"});
			// res.status(400).send({message: 'Error while Fetching columns from table',  error: err});
		}else{
			res.status(200).json({"error" : false, "message" : rows});
			// res.send(rows);
		}
	});
})


/**
 *API for editing existing Booking
 * @param {object} req - Node req object used for making server calls from Node server
 * @param {object} res - Node res object used for receiving result from Node server calls
 */
router.put('/Booking', function(req, res){
	let userId = req.body.data.userId;
	let startTime = req.body.data.startTime;
	let date = req.body.data.bookingDate;
	let duration = req.body.data.duration;
	let d = new Date();
	db.all("INSERT INTO Booking (start_time, date, user_id, created_at, duration) VALUES ('" 
	+ startTime + "','" + date + "','" + userId + "','" + d +  "','" + duration +"');",function(err,rows){
		if(err){
			console.log(err);
			res.status(400).send({message: 'Error while Fetching columns from table',  error: err});
		}else{
			res.send(rows);
		}
	});
})

/**
 *API for fetching booking by date
 * @param {object} req - Node req object used for making server calls from Node server
 * @param {object} res - Node res object used for receiving result from Node server calls
 */
router.get('/Booking/Date', function(req, res){
	let bookinDate = req.query.bookingDate;
	db.all("SELECT * FROM Booking where date = '"+bookinDate+"';",function(err,rows){
		if(err){
			console.log(err);
			res.status(500).json({"error" : true, "message" : "Error while fetching bookings!"});
			// res.status(400).send({message: 'Error while Fetching columns from table',  error: err});
		}else{
			res.status(200).json({"error" : false, "message" : rows});
			// res.send(rows);
		}
	});
})

/**
 *API for fetching booking by User
 * @param {object} req - Node req object used for making server calls from Node server
 * @param {object} res - Node res object used for receiving result from Node server calls
 */
router.get('/Booking/User', function(req, res){
	let userId = req.query.userId;
	db.all("SELECT * FROM Booking where user_id = '"+userId+"';",function(err,rows){
		if(err){
			console.log(err);
			res.status(500).json({"error" : true, "message" : "Error while fetching bookings!"});
		}else{
			res.status(200).json({"error" : false, "message" : rows});
			// res.send(rows);
		}
	});
})

/**
 *API for deleting a particular booking
 * @param {object} req - Node req object used for making server calls from Node server
 * @param {object} res - Node res object used for receiving result from Node server calls
 */
router.delete('/Booking', function(req, res){
	let bookingId = req.query.bookingId;
	db.all("DELETE FROM Booking where id = '"+bookingId+"';",function(err,rows){
		if(err){
			console.log(err);
			res.status(500).json({"error" : true, "message" : "deleted successfully!"});
			// res.status(400).send({message: 'Error while Fetching columns from table',  error: err});
		}else{
			res.status(200).json({"error" : false, "message" : rows});
			// res.send(rows);
		}
	});
})

/**
 * Boot function to startup the node server
 * @param {integer} port - Node requires port on which it will run
 * @param {function} callback funtion which runs as soon as the server starts
 */
app.listen(port, function () {
  console.log('Example app listening on port 3000!')
})