const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const {TEST_DATABASE_URL, JWT_SECRET} = require('../config');
const {User, Entry, app, runServer, closeServer, tearDownDb, seedUserData} = require("./test-server");

const expect = chai.expect;
chai.use(chaiHttp);

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

	it('Should create an entry on POST /entries', function(){
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
	it('Should update an entry on PUT /entries', function(){
		let updatedEntry = {
    	date: faker.date.recent().toString(),
    	workingOn: "Integration",
    	feelings: "Great",
    	lookingForward: "Capstone"
    };
		let _user;
		return User.find()				
		.then(users=>{
			_user = users[0];
			return Entry.find({user: _user._id})
		})
		.then(entries=>{
			const token = jwt.sign( { user: _user }, JWT_SECRET, { algorithm: 'HS256', subject: _user.username, expiresIn: '7d' } );
			return chai
	    .request(app)
	    .put(`/entries/${entries[0].id}`)
	    .set('Authorization', `Bearer ${token}`)
	    .send(updatedEntry)
  	})
    .then(res=>{
    	expect(res).to.have.status(200);
    	expect(res).to.be.json;
			expect(res.body).to.be.a('object');
    	expect(res.body).to.deep.equal(updatedEntry);
    });
	});
	it('Should get an entries by associated user id on GET /entries/by-user/:user_id', function(){
		return User.find()
		.then(users=>{
			return chai
	    .request(app)
	    .get(`/entries/by-user/${users[0].id}`)
		})
		.then(res=>{
    	expect(res).to.have.status(200);
    	expect(res).to.be.json;
			expect(res.body).to.be.a('array');
			expect(res.body[0]).to.include.keys('date', 'workingOn', 'feelings', 'lookingForward', 'user');
    });
	});
	it('Should get an entry by id on GET /entries/:id', function(){
		return Entry.find()
		.then(entries=>{
			return chai
	    .request(app)
	    .get(`/entries/${entries[0].id}`)
		})
		.then(res=>{
    	expect(res).to.have.status(200);
    	expect(res).to.be.json;
			expect(res.body).to.be.a('object');
			expect(res.body).to.include.keys('date', 'workingOn', 'feelings', 'lookingForward', 'user');
    });
	});
	it('Should delete an entry on DELETE /entries/:id', function(){
		let _user;
		return User.find()				
		.then(users=>{
			_user = users[0];
			return Entry.find({user: _user._id})
		})
		.then(entries=>{
			const token = jwt.sign( { user: _user }, JWT_SECRET, { algorithm: 'HS256', subject: _user.username, expiresIn: '7d' } );
			return chai
	    .request(app)
	    .delete(`/entries/${entries[0].id}`)
	    .set('Authorization', `Bearer ${token}`)
  	})
    .then(res=>{
    	expect(res).to.have.status(204);
    });
  });
});