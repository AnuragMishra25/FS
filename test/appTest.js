/* 
    Funding Society TT Booking - TEST JS
    Version: 1.0
    Author: Anurag Mishra
    Dated: Sat, 16 Jul 2017 2:50 GMT
*/

const supertest = require("supertest");
const should = require("should");

// This agent refers to PORT where program is runninng.

const server = supertest.agent("http://localhost:" + (process.env.PORT || 3000));

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

    // #2 should return booking page
    it("should return booking page",function(done){
        server
        .get("/booking")
        .expect(200) // THis is HTTP response
        .end(function(err,res){
          // HTTP status should be 200
          res.status.should.equal(200);
          done();
        });
    });

    // #3 should create new User
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
          res.body.message.should.be.instanceof(Array);
          done();
        });
    });

    // #4 should send alert for user already exists new User
    it("should check existing User while creaion and throw error",function(done){
        server
        .post("/User")
        .send({'data' : {email : 'alpha', password : 'beta'}})
        .expect("Content-type",/json/)
        .expect(200) // THis is HTTP response
        .end(function(err,res){
          // HTTP status should be 500
          res.status.should.equal(500);
          res.body.error.should.equal(true);
          res.body.message.should.equal("User Already exists");
          done();
        });
    });

    // #5 should fetch User on the basis of username and password
    it("should fetch existing User on the basis of username and password",function(done){
        server
        .get("/User?email=alpha&password=beta")
        // .send({'data' : {email : 'alpha', password : 'beta'}})
        .expect("Content-type",/json/)
        .expect(200) // THis is HTTP response
        .end(function(err,res){
          // HTTP status should be 200
          res.status.should.equal(200);
          res.body.error.should.equal(false);
          res.body.message.should.be.instanceof(Array);
          user = res.body.message.user_id;
          done();
        });
    });

    // #11 should fetch User on the basis of username and password
    it("should fetch existing User - Gives error if user not there",function(done){
        server
        .get("/User?email=alpha&password=betagvjv")
        // .send({'data' : {email : 'alpha', password : 'beta'}})
        .expect("Content-type",/json/)
        .expect(200) // THis is HTTP response
        .end(function(err,res){
          // HTTP status should be 500
          res.status.should.equal(500);
          res.body.error.should.equal(true);
          res.body.message.should.equal("no record found");
        //   user = res.body.message.user_id;
          done();
        });
    });

    // #6 should create new Booking
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
          res.body.message.should.be.instanceof(Array);
          done();
        });
    });

    
    // #7 should fetch User booking on the basis of userId
    it("should fetch existing User Booking on the basis of UserId",function(done){
        server
        .get("/Booking/User?userId=" + user)
        .expect("Content-type",/json/)
        .expect(200) // THis is HTTP response
        .end(function(err,res){
          // HTTP status should be 200
          res.status.should.equal(500);
          res.body.error.should.equal(true);
          done();
        });
    });

    // #8 should fetch User on the basis of username and password
    it("should fetch Booking by given date",function(done){
        server
        .get("/Booking/Date?bookingDate=2017-12-13")
        .expect("Content-type",/json/)
        .expect(200) // THis is HTTP response
        .end(function(err,res){
          // HTTP status should be 200
          res.status.should.equal(200);
          res.body.error.should.equal(false);
          res.body.message.should.be.instanceof(Array);
          done();
        });
    });

    // #9 should delete Booking
    it("should delete Booking by booking Id",function(done){
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

    // #9 should delete Booking
    it("should delete Booking - If booking does not exist",function(done){
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

    // #10 should delete User
    it("should delete User by User Id",function(done){
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

    // #10 should delete User
    it("should delete User - If user does not exists",function(done){
        server
        .delete("/User")
        .send({'data' : {email : 'alpha', password : 'betahgcghg'}})
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