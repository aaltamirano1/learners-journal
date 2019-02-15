'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const {Entry} = require('./model');
const {User} = require('../users/model');
const jwtAuth = passport.authenticate('jwt', { session: false });
const router = express.Router();

const jsonParser = bodyParser.json();


router.post('/', jwtAuth, jsonParser, (req, res)=>{
  const requiredFields = ['date', 'workingOn', 'feelings', 'lookingForward'];
  requiredFields.forEach(field => {
    if(!(field in req.body)){
      const msg = `Missing ${field} in request body.`;
      console.error(msg);
      return res.status(400).send(msg);
    }
  });
  Entry
    .create({
      date: req.body.date,
      workingOn: req.body.workingOn,
      feelings: req.body.feelings,
      lookingForward: req.body.lookingForward,
      user: req.user.id
    })
    .then(post=>res.status(201).json())
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });        

});

router.get('/', (req, res) => {
  return Entry.find()
    .then(entries => res.json(entries))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.get('/:user_id', (req, res) => {
  return Entry.find({user: req.params.user_id})
    .then(entries => res.json(entries))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = {router};