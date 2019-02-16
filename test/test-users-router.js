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
	// NOTE: would be best to eliminate this endpoint at the end.
	it("Should return users on GET users", function(){
		return chai
			.request(app)
			.get('/users')
			.then(function(res){
				expect(res).to.have.status(200);
				expect(res).to.be.json;
			});
	});
});