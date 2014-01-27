var Series = require('../models/series');


exports.create = function(req, res) {
  var newSeries = new Series(req.body);
  
  newSeries.save(function(err) {
    if (err) {
      return res.json(400, err);
    }

    return res.json(201, newSeries);
  });
};

exports.show = function(req, res) {

  Series.findById(req.id, function(err, series) {
    if (err) {
      return res.json(400, err);
    }

    return res.json(200, series);
  });
};