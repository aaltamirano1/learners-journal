'use strict';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');


// Here we use destructuring assignment with renaming so the two variables
// called router (from ./users and ./auth) have different names
// For example:
// const actorSurnames = { james: "Stewart", robert: "De Niro" };
// const { james: jimmy, robert: bobby } = actorSurnames;
// console.log(jimmy); // Stewart - the variable name is jimmy, not james
// console.log(bobby); // De Niro - the variable name is bobby, not robert
const { router: usersRouter } = require('./users');
const { router: entriesRouter } = require('./entries');
const { Entry } = require('./entries/model');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');

const app = express();

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/users', usersRouter);
app.use('/entries', entriesRouter);
app.use('/auth', authRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

app.get('/', function(req, res) {
    res.sendFile('index.html', {root: __dirname });
});

app.get('/signup', function(req, res) {
    res.sendFile('signup.html', {root: __dirname });
});


// A protected endpoint which needs a valid JWT to access it
app.get('/entries/:user_id', (req, res) => {
  return Entry.find({user: req.params.user_id})
    .then(entries => res.json(entries))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});


// app.get('/entries', jwtAuth, (req, res) => {  
//    res.json({data: [
//      {
//        date: 'Feb 9, 2019',
//        workingOn: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
//        feelings: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut consectetur turpis porttitor, volutpat tortor et, dignissim nisi. Donec arcu erat, dignissim vel molestie non, viverra eget leo. Ut vitae est diam.',
//        lookingForward: 'Donec arcu erat, dignissim vel molestie non, viverra eget leo. Ut vitae est diam.'
//      },
//      {
//        date: 'Feb 8, 2019',
//        workingOn: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
//        feelings: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut consectetur turpis porttitor, volutpat tortor et, dignissim nisi. Donec arcu erat, dignissim vel molestie non, viverra eget leo. Ut vitae est diam.',
//        lookingForward: 'Donec arcu erat, dignissim vel molestie non, viverra eget leo. Ut vitae est diam.'
//      }
//    ]});
// });

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };