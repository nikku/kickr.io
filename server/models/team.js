'use strict';

var mongoose = require('mongoose'),
    async = require('async'),
    Schema = mongoose.Schema,
    User = require('./user');

/**
 * Schema
 */
var TeamSchema = new Schema({
  players: [ ObjectId ]
});

/**
 * Update users
 */
TeamSchema.pre('save', function(next, done) {
  var team = this;

  async.each(team.players, function(p) {
    if (!p.id) {
      return;
    }

    User.findById(p.id, function(err, user) {
      if (err) {
        throw err;
      }

      user.teams.push(team);
      p.name = user.name;

      user.save(function(err) {
        if (err) {
          throw err;
        }
      });
    });
  }, next);
});

/**
 * Register model
 */
module.exports = mongoose.model('Team', TeamSchema);