const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const {TEST_DATABASE_URL, User, app, runServer, closeServer, tearDownDb, seedUserData} = require("./test-server");

const expect = chai.expect;
chai.use(chaiHttp);

describe('Users', function(){
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
	it("Should create a user on POST /users", function(){
		const newUser = {username: "testuser", password: "testpassword"};
		return chai
			.request(app)
			.post('/users')
			.send(newUser)
			.then(function(res){
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.include.keys('id', 'username');
				expect(res.body).to.deep.equal(Object.assign({id: res.body.id, username: "testuser"}));
			});
	});
	it("Should indicate issue on POST /users if username already taken", function(){
		User.find()
		.then(users=>{
			return {username: users[0].username, password: "testpassword"};
		})
		.then(newUser=>{
			return chai
			.request(app)
			.post('/users')
			.send(newUser)
		})
		.then(function(res){
			expect(res).to.be.json;
			expect(res.body).to.include.keys('code', 'reason', 'message', 'location');
			expect(res.body.code).to.equal(422);
			expect(res.body.message).to.equal("Username already taken");
		});
	});
	it("Should indicate issue on POST /users if password too short", function(){
		const newUser = {username: "testuser", password: "test"};
		return chai
			.request(app)
			.post('/users')
			.send(newUser)
			.then(function(res){
				expect(res).to.be.json;
				expect(res).to.have.status(422);
				expect(res.body).to.include.keys('code', 'reason', 'message', 'location');
				expect(res.body.code).to.equal(422);
				expect(res.body.message).to.equal("Must be at least 10 characters long");
			});
	});
	it("Should indicate issue on POST /users if username starts/ends in whitespace", function(){
		const newUser = {username: "testuser ", password: "testpassword"};
		return chai
			.request(app)
			.post('/users')
			.send(newUser)
			.then(function(res){
				expect(res).to.have.status(422);
				expect(res).to.be.json;
				expect(res.body).to.include.keys('code', 'reason', 'message', 'location');
				expect(res.body.message).to.equal("Cannot start or end with whitespace");
			});
	});
		it("Should indicate issue on POST /users if password starts/ends in whitespace", function(){
		const newUser = {username: "testuser ", password: " testpassword"};
		return chai
			.request(app)
			.post('/users')
			.send(newUser)
			.then(function(res){
				expect(res).to.have.status(422);
				expect(res).to.be.json;
				expect(res.body).to.include.keys('code', 'reason', 'message', 'location');
				expect(res.body.message).to.equal("Cannot start or end with whitespace");
			});
	});
	it("Should return a user's id on GET /users/id/:username", function(){
		let userId;
		return User.find()
		.then(users=> {
			userId = users[0].id;
			return users[0].username;
		})
		.then(username=>{
			return chai
					.request(app)
					.get(`/users/id/${username}`)
		})
		.then(function(res){
			expect(res).to.have.status(200);
			expect(res).to.be.json;
			expect(res.body).to.be.a('string');
			expect(res.body).to.equal(userId);
		});
	})
});