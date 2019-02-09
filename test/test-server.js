const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer	} = require("../server");

const expect = chai.expect;
chai.use(chaiHttp);

describe('App', function(){
	before(function(){
		return runServer();
	});
	after(function(){
		return closeServer();
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
		it("Should give a 200 status code and HTML at the /home", function(){
		return chai
			.request(app)
			.get('/home')
			.then(function(res){
				expect(res).to.have.status(200);
				expect(res).to.be.html;
			});
			
	});

});