const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const {TEST_DATABASE_URL, User, app, runServer, closeServer, tearDownDb, seedUserData} = require("./test-server");

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
		return User.find()
		.then(users=> {
			return {
				username: users[0].username,
				password: "testpassword"
			};
		})
		.then(user=>{
			return chai
			.request(app)
			.post('/auth/login')
			.set('Content-Type', 'application/json')
			.send(user)
		})
		.then(function(res){
			expect(res).to.have.status(200);
			expect(res).to.be.json;
			expect(res.body).to.be.a('object');
			expect(res.body.authToken).to.be.a('string');
		});
	})
});