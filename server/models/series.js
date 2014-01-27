'use strict';

var mongoose = require('mongoose'),
    stepdown = require('stepdown'),
    User = require('./user'),
    Team = require('./team'),
    Game = require('./game'),
    Schema = mongoose.Schema;

/**
 * Schema
 */
var TeamDescriptor = {
  id: { type: ObjectId, required: true },
  players: [{ 
    name: { type: String, required: true },
    id: ObjectId
  }]
};

var SeriesSchema = new Schema({
  date: { type: Date, required: true },
  location: { type: String },

  teams: {
    white: TeamDescriptor,
    black: TeamDescriptor
  },

  games: [ ObjectId ],

  winner: { type: String, required: true }
});

/*
{
  date: new Date(),
  location: 'Office',
  teams: {
    white: [ { name: 'micha' }, { id: '___nikku' } ],
    black: [ { id: '__roman' }, { id: '__vale' } ]
  },

  games: {
    [ {
      black: {
        \/* ... *\/
      },
      white: {
        attack: { name: 'micha' },
        mid: { name: 'micha' },
        defense: { id: '___nikku' },
        goal: { id: '___nikku' }
      },

      result: {
        black: 0, 
        white: 10
      }
    }, { \/* ... *\/ } ]
  }
}
*/

var byId = function(a, b) {
  return a.id < b.id;
};

var VALID_POSITIONS = [ 'attack', 'mid', 'defense', 'goal' ];

function createTeam(players, done) {

  stepdown([ function getPlayers() {
    var group = this.createGroup();

    players.forEach(function(player) {
      var done = group();

      if (player.id) {
        User.findById(player.id, done);
      } else {
        if (!player.name) {
          return done(new Error('Must specify player name or id'));
        }

        done(null, { name: player.name });
      }
    });
  }, function createTeam(err, players) {
    if (err) {
      return this.next(err);
    }

    new Team({
      
    });    
  }, done ]);
}


/**
 * Insert / update logic for teams
 */
SeriesSchema.pre('save', function(next, done) {
  var series = this;

  if (!series.teams || !series.teams.black || !series.teams.white) {
    return next(new Error('No teams specified'));
  }

  if (!series.games || !series.games.length) {
    return next(new Error('No games specified'));
  }

  stepdown([ function loadPlayers() {
    var group = this.createGroup();

    loadTeam(players.white, group());
    loadTeam(players.black, group());

  }, function createGames(err, players) {
    if (err) {
      return this.next(err);
    }

    function getPlayer(p) {
      return players.filter(function(player) {
        return (p.id && player.id === p.id) || (!p.id && p.name === player.name);
      })[0];
    }

    var group = this.createGroup();

    series.games.forEach(function(game) {

      var errs = [],
          done = group(),
          g, player;

      g = new Game({
        result: game.result
      });

      VALID_POSITIONS.forEach(function(pos) {
        if (!game[pos]) {
          return errs.push(new Error('Position <' + pos + '> not assigned in game'));
        }

        player = getPlayer(game[pos]);

        if (!player) {
          return errs.push(new Error('Player not part of team: <' + (player.name || player.id) + '>'));
        }

        g[pos] = player;
      });

      if (errs.length) {
        return done(errs);
      }

      g.save(done);
    });
  }]);

  try {
    var players = collectPlayers(series.teams);
    var games = createGames(series.games, players);
  } catch (e) {
    return next(e);
  }

  async.each([ series.teams.white, series.teams.black ], function(team) {
    if (!team) {
      throw new Error('Did not assign a team');
    }

    if (team.id) {
      Team.findById(team.id, function(err, t) {

      });
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


  User.where('_id').in([ this.to, this.from ]).run(function (err, people) {
    if (people.length != 2) { next(new Error("To or from doesn't exist")); return; }
    Step(
      function save_to() {
        people[0].transactions.push(transaction);
        people[0].save(this);
      },
      function save_from(err) {
        if (err) { next(err); return; }
        people[1].transactions.push(transaction);
        people[1].save(this);
      },
      function callback(err) {
        next(err); 
      }
    );
  });
});

/**
 * Validation
 */
var VALID_POSITIONS = [ 'keeper', 'defense', 'mid', 'attacker' ];

function checkPositions(next, done) {
  var team = this,
      assignedPositions = {},
      err;

  function logPositions(positions) {
    positions.forEach(function(p) {
      if (VALID_POSITIONS.indexOf(p) === -1) {
        throw new Error('Invalid position <' + p + '>: assign any of [' + VALID_POSITIONS.join(',') + ']');
      }

      if (assignedPositions[p]) {
        throw new Error('Position <' + p + '> already assigned');
      } else {
        assignedPositions[p] = true;
      }
    });
  }

  function logPlayerPositions(player) {
    logPositions(player.positions || []);
  }

  function validatePositions() {
    VALID_POSITIONS.forEach(function(p) {
      if (!assignedPositions[p]) {
        throw new Error('Position <' + p + '> not assigned');
      }
    });
  }

  try {
    if (team.players.length === 0) {
      throw new Error('Team must have at least one player');
    }

    if (team.players.length !== 1) {
      // validate positions of all players
      team.players.forEach(logPlayerPositions);
      validatePositions();
    } else {
      // assume all positions if only one player
      team.players[0].positions = Array.prototype.slice.call(VALID_POSITIONS);
    }
  } catch (e) {
    err = e;
  }

  next(err);
}

TeamSchema.pre('save', checkPositions);



module.exports = mongoose.model('series', seriesSchema);
