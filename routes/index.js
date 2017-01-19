'use strict';
var express = require('express');
var router = express.Router();
//var tweetBank = require('../tweetBank');
var client = require('../db/index');

module.exports = function makeRouterWithSockets (io) {

  //db test
//   var usersName = client.query('SELECT name FROM users', function (err, result) {
//   if (err) {return next(err);}
//   else {
//     var names = result.rows;
//     console.log(names)
//      names.forEach(person =>{
//     //return(names.name);
//     console.log(person.name);
//   })
//   }// pass errors to Express


//   // console.log(tweets)
// });

  // a reusable function
  function respondWithAllTweets (req, res, next){
    client.query('SELECT name FROM users', function (err, result) {
     if (err) {return next(err);}
    else {
        var names = result.rows;
        res.render('index', {
        title: 'Twitter.js',
        tweets: names,
        showForm: true
      });
    }
  })
}


  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    var tweetsForName = client.query("SELECT users.name, tweets.content FROM users JOIN tweets ON tweets.user_id=users.id" , function(err, result){
      if(err){
        return next(err);
      }else{
        res.render('index', {
        title: 'Twitter.js',
        tweets: result.row(tweetsForName),
        showForm: true,
        username: req.params.username
    });
      }
      console.log(results.rows)
    });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    var tweetsWithThatId = data.find({ id: Number(req.params.id) });
    res.render('index', {
      title: 'Twitter.js',
      tweets: tweetsWithThatId // an array of only one element ;-)
    });
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    var newTweet = data.add(req.body.name, req.body.content);
    io.sockets.emit('new_tweet', newTweet);
    res.redirect('/');
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
