var express = require('express');
var url = require('url');
// tumblr OAuth secrets
var secrets = require('./secrets');
var app = express.createServer();

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret: secrets.session_secret}));
    app.use(app.router);
    app.set('view engine', 'jade');
});

app.configure('development', function(){
    app.use(express.static(__dirname + '/static'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.set('view options', {development: true});
});

var oauth_base_url = 'http://www.tumblr.com/oauth/';
var api_base_url = 'http://api.tumblr.com/v2/';

var OAuth = require('oauth').OAuth;
var oa = new OAuth(oauth_base_url+'request_token',
                    oauth_base_url+'access_token',
                    secrets.oauth_consumer_key,
                    secrets.oauth_secret_key,
                    '1.0A',
                    'http://eps.local:3000/oauth/callback',
                    'HMAC-SHA1');


app.get('/', function(req, res) {
  res.render('index');
});

app.get('/login', function(req, res) {
  console.log(require('sys').inspect(req.session));

  oa.getOAuthRequestToken(
    function(error, oauth_token, oauth_token_secret, results) {
      console.log(oauth_token);
      req.session.oauth_token_secret = oauth_token_secret;
      req.session.oauth_token = oauth_token;
      res.redirect(oauth_base_url+'authorize?oauth_token='+oauth_token, 303);
  });
});

app.get('/oauth/callback', function(req, res) {
  var parsed_url = url.parse(req.url, true);
  console.log(require('sys').inspect(req.session));

  oa.getOAuthAccessToken(req.session.oauth_token,
                         req.session.oauth_token_secret,
                         parsed_url.query.oauth_verifier,
    function(error, oauth_access_token, oauth_access_token_secret, results) {
      // the good stuff
      req.session.oauth_access_token = oauth_access_token;
      req.session.oauth_access_token_secret = oauth_access_token_secret;
      res.send({status:'ok', message:'Logged in to Tumblr.'});
    });
});

app.get('/dashboard', function(req, res) {
    oa.getProtectedResource(api_base_url+'user/dashboard', 'GET',
                            req.session.oauth_access_token,
                            req.session.oauth_access_token_secret,
      function(error, data) {
        res.send(data);
      });
});

app.listen(3000);
