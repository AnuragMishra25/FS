/* 
    DATAIKU - US CENSUS REPORT app.js
    Version: 1.0
    Author: Anurag Mishra
    Dated: Sun, 2 July 2017 12:20 AM
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

 /**
 * Default route for the application, checks DB connections get hold of total rows in DB
 * @param {object} req - Node req object used for making server calls from Node server
 * @param {object} res - Node res object used for receiving result from Node server calls
 */
app.get('/', function (req, res) {
	if(req.cookies.userId != undefined){
		res.render('booking');
	}else{
		res.render("login");
	}
})

app.get('/booking', function(req, res){
	res.render("booking");
})

//API for creating user on the basis of username and password
app.post('/User', function(req, res){
  	var email = req.body.data.email;
  	var password = req.body.data.password;
    db.all("SELECT * FROM User WHERE email='" + email + "' AND password ='" + password + "';",function(err,rows){
		if(err){
			console.log(err);
			res.status(500).send({message: 'Error while Fetching columns from table',  error: err});
		}else{
			if(rows.length > 0){
				res.status(500).send("User Already exists");
			}else{
				db.all("INSERT INTO User (email, password) VALUES ('" + email + "','" + password + "');",function(err,rows){
					if(err){
						console.log(err);
						res.status(500).send({message: 'Error while Fetching columns from table',  error: err});
					}else{
						res.send(rows);
					}
				});
			}
			console.log('now rows' + rows.length);
		}
	});
})


//API for fetching user information on the basis of username and password
app.get('/User', function(req, res){
  var email = req.query.email;
  var password = req.query.password;
  	db.all("SELECT * FROM User WHERE email='" + email + "' AND password ='" + password + "';",function(err,rows){
		if(err){
			console.log(err);
			res.status(500).send({message: 'Error while Fetching columns from table',  error: err});
		}else{
			if(rows.length >0){
				res.status(200).send(rows);
			}else{
				res.status(500).send("no record found");
			}
		}
	});
})

//API for fetching all bookings for user of userId
app.get('/Booking/User', function(req, res){
  var userId = req.cookies.userId;
  	db.all("SELECT * FROM Booking WHERE user_id=" + userId +";",function(err,rows){
		if(err){
			console.log(err);
			res.status(500).send({message: 'Error while Fetching bookings for a user',  error: err});
		}else{
			console.log('now rows' + rows.length);
			res.send(rows);
		}
	});
})

//API for creating booking for a User
app.post('/Booking', function(req, res){
	var userId = req.body.data.userId;
	var startTime = req.body.data.startTime;
	var date = req.body.data.bookingDate;
	var duration = req.body.data.duration;
	var d = new Date();
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

//API for creating booking for a User
app.get('/Booking/Date', function(req, res){
	var bookinDate = req.query.bookingDate;
	db.all("SELECT * FROM Booking where date = '"+bookinDate+"';",function(err,rows){
		if(err){
			console.log(err);
			res.status(400).send({message: 'Error while Fetching columns from table',  error: err});
		}else{
			res.send(rows);
		}
	});
})

//API for creating booking for a User
app.get('/Booking/User', function(req, res){
	var userId = req.query.userId;
	db.all("SELECT * FROM Booking where user_id = '"+userId+"';",function(err,rows){
		if(err){
			console.log(err);
			res.status(400).send({message: 'Error while Fetching columns from table',  error: err});
		}else{
			res.send(rows);
		}
	});
})

/**
 * API to handle get request for data corresponding to columns
 * @param {integer} port - Node requires port on which it will run
 * @param {function} callback funtion which runs as soon as the server starts
 */
app.listen(port, function () {
  console.log('Example app listening on port 3000!')
})