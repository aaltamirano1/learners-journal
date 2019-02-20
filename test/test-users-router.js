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
	it("Should return a user's id on GET /users/id/:username", function(){
		return User.find()
		.then(users=> users[0].username)
		.then(username=>{
			return chai
					.request(app)
					.get(`/users/id/${username}`)
		})
		.then(function(res){
			console.log(res.body);
			expect(res).to.have.status(200);
			expect(res).to.be.json;
		});
	})
});