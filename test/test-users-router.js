const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const { app, runServer, closeServer	} = require("../server");
const {User} = require('../users/model');
const {TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;
chai.use(chaiHttp);

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

function seedUserData() {
  console.info('seeding entry data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push({
    	username: faker.internet.userName(),
 			password: faker.internet.password()
    });
  }
  // this will return a promise
  return User.insertMany(seedData);
}

describe('App', function(){
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
			expect(res.body).to.be.a('string');
		});
	})
});