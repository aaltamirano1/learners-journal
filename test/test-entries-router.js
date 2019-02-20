const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const {TEST_DATABASE_URL, JWT_SECRET} = require('../config');
const {User, Entry, app, runServer, closeServer, tearDownDb, seedUserData} = require("./test-server");

const expect = chai.expect;
chai.use(chaiHttp);

//const token = jwt.sign( { user: { username, firstName, lastName } }, JWT_SECRET, { algorithm: 'HS256', subject: username, expiresIn: '7d' } )

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

describe('Entries', function(){
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

	it('Should create an entry on POST', function(){
	

	return User.find()
	.then(users=>{
		const token = jwt.sign( { user: users[0] }, JWT_SECRET, { algorithm: 'HS256', subject: users[0].username, expiresIn: '7d' } );
		return chai
    .request(app)
    .post('/entries')
    .set('authorization', `Bearer ${token}`)
    .send({
    	date: new Date(),
    	workingOn: "Integration",
    	feelings: "Great",
    	lookingForward: "Capstone",
    })
  	})
    .then(res=>{
    	expect(res).to.have.status(201);
    })
	});





});