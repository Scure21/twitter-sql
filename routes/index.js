'use strict';
var express = require('express');
var router = express.Router();
//var tweetBank = require('../tweetBank');
var client = require('../db/index');

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    //Querying the tweets
    client.query('SELECT * FROM tweets JOIN users ON users.id=tweets.user_id', function(err, result){
      if(err){return next(err)}
      else{
        var tweet = result.rows;
        res.render('index', {
          title: 'Twitter.js',
          tweets : tweet,
          showForm: true
        })
      }
    })
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    var username = req.params.username;
    client.query('SELECT tweets.content, users.name FROM tweets JOIN users ON users.id = tweets.user_id WHERE users.name = $1', [username], function(err, result){
      if(err){return next(err)}
      else{
        var userTweet = result.rows;
        res.render('index', {
          title: 'Twitter.js',
          tweets: userTweet,
          showForm: true,
          username: username
        })
      }
    })
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    var tweetId = Number(req.params.id);
    //console.log(req.params);
    client.query('SELECT * FROM tweets JOIN users ON users.id = tweets.user_id WHERE tweets.id = $1', [tweetId], function(err, result){
      if(err){return next(err)}
      else {
        var singleTweet = result.rows;
        res.render('index', {
          title: 'Twitter.js',
          tweets: singleTweet
        })
      }
    })
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    var name = req.body.name;
    var content = req.body.content;
    client.query("INSERT INTO tweets(user_id, content) VALUES((SELECT id FROM users WHERE name=$1),$2) RETURNING user_id, content",[name, content], function(err, result){
      var newTweet = result.rows;

      console.log(newTweet)
      io.sockets.emit('new_tweet', newTweet);
      res.redirect('/');
    });

    //var newTweet = data.add(req.body.name, req.body.content);

  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
