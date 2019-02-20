const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const { app, runServer, closeServer	} = require("../server");
const {User} = require('../users/model');
const {Entry} = require('../entries/model');
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
  return User.hashPassword("testpassword")
  .then(password=>{
    const seedData = [];
    for (let i = 1; i <= 10; i++) {
      seedData.push({
        username: faker.internet.userName().toLowerCase(),
         password: password
      });
    }
    // this will return a promise
    return User.insertMany(seedData);    
  });

}

function seedEntryData(users) {
  console.info('seeding entry data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push({
    	date: faker.date.recent(),
  		workingOn: faker.lorem.sentence(),
  		feelings: faker.lorem.text(),
  		lookingForward: faker.lorem.sentence(),
      user: users[0]
    });
  }
  // this will return a promise
  return Entry.insertMany(seedData);
}

describe('App', function(){
	before(function(){
		return runServer(TEST_DATABASE_URL);
	});
	beforeEach(function(){
		return seedUserData()
		.then(users=>{
			return seedEntryData(users);
		})
	});
	after(function(){
		return closeServer();
	});
	afterEach(function(){
		return tearDownDb();
	});

	it("Should give a 200 status code and HTML at the root URL", function(){
		return chai
			.request(app)
			.get('/')
			.then(function(res){
				expect(res).to.have.status(200);
				expect(res).to.be.html;
			});
	});
});

module.exports = {TEST_DATABASE_URL, User, Entry, app, runServer, closeServer, tearDownDb, seedUserData, seedEntryData}