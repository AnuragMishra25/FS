var supertest = require("supertest");
var should = require("should");

// This agent refers to PORT where program is runninng.

var server = supertest.agent("http://localhost:3000");

describe("Unit Test Case for APP",function(){
    var user;
    var booking;

    // #1 should return home page
    it("should return home page",function(done){
        server
        .get("/")
        .expect(200) // THis is HTTP response
        .end(function(err,res){
          res.status.should.equal(200);
          done();
        });
    });

    // #1 should return booking page
    it("should return booking page",function(done){
        server
        .get("/booking")
        .expect(200) // THis is HTTP response
        .end(function(err,res){
          // HTTP status should be 200
          res.status.should.equal(200);
          // Error key should be false.
          // res.body.error.should.equal(false);
          done();
        });
    });

    // #1 should create new User
    it("should create new User",function(done){
        server
        .post("/User")
        .send({'data' : {email : 'alpha', password : 'beta'}})
        .expect("Content-type",/json/)
        .expect(200) // THis is HTTP response
        .end(function(err,res){
          // HTTP status should be 200
          res.status.should.equal(200);
          res.body.error.should.equal(false);
          done();
        });
    });

    // #1 should fetch User on the basis of username and password
    it("should fetch existing User",function(done){
        server
        .get("/User?email=alpha&password=beta")
        // .send({'data' : {email : 'alpha', password : 'beta'}})
        .expect("Content-type",/json/)
        .expect(200) // THis is HTTP response
        .end(function(err,res){
          // HTTP status should be 200
          res.status.should.equal(200);
          res.body.error.should.equal(false);
        //   console.log(res.body.message);
          user = res.body.message.user_id;
          done();
        });
    });

    // #1 should create new Booking
    it("should create new Booking",function(done){
        server
        .post("/Booking")
        .send({'data' : {userId : user, startTime : 134, bookingDate : '2017-12-13', duration:40}})
        .expect("Content-type",/json/)
        .expect(200) // THis is HTTP response
        .end(function(err,res){
          // HTTP status should be 200
          res.status.should.equal(200);
          res.body.error.should.equal(false);
          done();
        });
    });

    

    // #1 should fetch User on the basis of username and password
    it("should fetch existing User Booking",function(done){
        server
        .get("/Booking/User?userId=" + user)
        // .send({'data' : {email : 'alpha', password : 'beta'}})
        .expect("Content-type",/json/)
        .expect(200) // THis is HTTP response
        .end(function(err,res){
          // HTTP status should be 200
          res.status.should.equal(500);
          res.body.error.should.equal(true);
        //   console.log(res.body.message);
          done();
        });
    });

    // #1 should fetch User on the basis of username and password
    it("should fetch Booking by given date",function(done){
        server
        .get("/Booking/Date?bookingDate=2017-12-13")
        // .send({'data' : {email : 'alpha', password : 'beta'}})
        .expect("Content-type",/json/)
        .expect(200) // THis is HTTP response
        .end(function(err,res){
          // HTTP status should be 200
          res.status.should.equal(200);
          res.body.error.should.equal(false);
        //   console.log(res.body.message);
          done();
        });
    });

    // #1 should delete Booking
    it("should delete Booking",function(done){
        server
        .delete("/Booking?bookingId="+ booking)
        .expect("Content-type",/json/)
        .expect(200) // THis is HTTP response
        .end(function(err,res){
          // HTTP status should be 200
          res.status.should.equal(200);
          res.body.error.should.equal(false);
          done();
        });
    });

    // #1 should delete User
    it("should delete User",function(done){
        server
        .delete("/User")
        .send({'data' : {email : 'alpha', password : 'beta'}})
        .expect("Content-type",/json/)
        .expect(200) // THis is HTTP response
        .end(function(err,res){
          // HTTP status should be 200
          res.status.should.equal(200);
          res.body.error.should.equal(false);
          done();
        });
    });

});