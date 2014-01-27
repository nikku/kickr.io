'use strict';

var mongoose = require('mongoose'),
    async = require('async'),
    User = require('./user'),
    Team = require('./team'),
    Schema = mongoose.Schema;

var RolesDescriptor = {
  attack: {
    id: { type: ObjectId },
    name: { type: String, required: true }
  },
  mid: {
    id: { type: ObjectId },
    name: { type: String, required: true }
  },
  defense: {
    id: { type: ObjectId },
    name: { type: String, required: true }
  },
  goal: {
    id: { type: ObjectId },
    name: { type: String, required: true }
  }
};

var GameDescriptor = {
  black: RolesDescriptor,
  white: RolesDescriptor,

  result: {
    black: { type: Number, required: true },
    white: { type: Number, required: true }
  }
};