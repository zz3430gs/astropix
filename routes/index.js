var express = require('express');
var apod = require('../apod/apodService');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', name: 'Joe' });
});

/* GET picture from NASA */
router.get('/fetch_picture', function (req, res, next) {

    /*Error*/
    /*Get a random image from nasa website from any date*/
    console.log('RANDOM? ' + req.query.random);
      apod(function (err, apod_data) {
         if (err) {
             return res.render('apod_error', {error: err.message, title: 'Error'});
         } else {
             return res.render('index', {apod: apod_data, title: "APOD for " + apod_data.date});
         }
      }, req.query.random);

});

module.exports = router;
