'use strict';
const mongoose = require('mongoose');
const {User} = require('../users/model');

mongoose.Promise = global.Promise;

const entrySchema = mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  workingOn: {
    type: String,
    required: true
  },
  feelings: {
    type: String,
    required: true
  },
  lookingForward: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

entrySchema.pre('findOne', function(next) {
  this.populate('user');
  next();
});

entrySchema.virtual('username').get(function(){
  return this.user.username;
});

const Entry = mongoose.model('Entry', entrySchema);

module.exports = {Entry};