'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const {Entry} = require('./model');
const {User} = require('../users/model');
const jwtAuth = passport.authenticate('jwt', { session: false });
const router = express.Router();

const jsonParser = bodyParser.json();

// reqs jwt sign to test
router.post('/', jwtAuth, jsonParser, (req, res)=>{
  const requiredFields = ['date', 'workingOn', 'feelings', 'lookingForward'];
  requiredFields.forEach(field => {
    if(!(field in req.body)){
      const msg = `Missing ${field} in request body.`;
      console.error(msg);
      return res.status(400).send(msg);
    }
  });
  console.log("req.body.date is: ",req.body.date);
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
      res.status(500).json({ message: "Internal server error when posting new entry." });
    });        

});

router.put('/:id', jsonParser, (req, res)=>{
  const requiredFields = ['date', 'workingOn', 'feelings', 'lookingForward'];
  requiredFields.forEach(field => {
    if(!(field in req.body)){
      const msg = `Missing ${field} in request body.`;
      console.error(msg);
      return res.status(400).send(msg);
    }
  });

  const toUpdate = {};
  const updatableFields = ['date', 'workingOn', 'feelings', 'lookingForward'];
  updatableFields.forEach(field=>{
    if(field in req.body){
      toUpdate[field] = req.body[field];
    }
  });

  Entry
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(updatedEntry=>{
      console.log(`Updated item with id ${req.params.id}.`);
      res.status(200).json({
        date: updatedEntry.date,
        workingOn: updatedEntry.workingOn,
        feelings: updatedEntry.feelings,
        lookingForward: updatedEntry.lookingForward
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error with updating entry." });
    });
});

router.get('/by-user/:user_id', (req, res) => {
  return Entry.find({user: req.params.user_id}).sort({ date: -1 })
    .then(entries => {
      res.json(entries);
    })
    .catch(err => res.status(500).json({message: 'Internal server error when getting entries by user id.'}));
});

router.get('/:id', (req, res) => {
  return Entry.findById(req.params.id)
    .then(entries => {
      res.json(entries);
    })
    .catch(err => res.status(500).json({message: 'Internal server error when getting entry by id.'}));
});

router.delete('/:id', (req, res)=>{
  Entry.findByIdAndRemove(req.params.id)
    .then(()=>{
      console.log(`Deleted entry with id ${req.params.id}.`);
      res.status(204).end();
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error when deleting entry." });
    });
});

module.exports = {router};