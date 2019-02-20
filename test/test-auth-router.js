const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const { app, runServer, closeServer	} = require("../server");
const {User} = require('../users/model');
const {TEST_DATABASE_URL} = require('../config');
const {tearDownDb, seedUserData} = require("./test-server");

const expect = chai.expect;
chai.use(chaiHttp);


describe('Auth', function(){
	before(function(){
		return runServer(TEST_DATABASE_URL);
	});
	beforeEach(function(){
		return seedUserData()
	});
	after(function(){
		return closeServer();
	});
	afterEach(function(){
		return tearDownDb();
	});
	it("Should return a user's authToken on POST /auth/login", function(){ 
		// const token = jwt.sign( { user: { username, firstName, lastName } }, JWT_SECRET, { algorithm: 'HS256', subject: username, expiresIn: '7d' } );

    

		return User.find()
		.then(users=> {
			return {
				username: users[0].username,
				password: "testpassword"
			};
		})
		.then(user=>{
			console.log("USER: ", user);
			return chai
			.request(app)
			.post('/auth/login')
			.set('Content-Type', 'application/json')
			.send(user)
		})
		.then(function(res){
			expect(res).to.be.json;
		});
	})
});