(function() {
  var OAuth, api_base_url, app, express, oa, oauth_base_url, secrets, url;
  express = require('express');
  url = require('url');
  secrets = require('./secrets');
  app = express.createServer();
  app.configure(function() {
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({
      secret: secrets.session_secret
    }));
    app.use(app.router);
    app.set('view options', {
      layout: false
    });
    return app.register('.html', {
      compile: function(str, options) {
        return function(locals) {
          return str;
        };
      }
    });
  });
  app.configure('development', function() {
    app.use(express.static(__dirname + '/static'));
    return app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });
  oauth_base_url = 'http://www.tumblr.com/oauth/';
  api_base_url = 'http://api.tumblr.com/v2';
  OAuth = require('oauth').OAuth;
  oa = new OAuth(oauth_base_url + 'request_token', oauth_base_url + 'access_token', secrets.oauth_consumer_key, secrets.oauth_secret_key, '1.0A', 'http://eps.local:3000/oauth/callback', 'HMAC-SHA1');
  oa.getTumblrResource = function(req, res) {
    return oa.getProtectedResource(api_base_url + req.url, req.method, req.session.oauth_access_token, req.session.oauth_access_token_secret, function(error, data) {
      return res.json(JSON.parse(data));
    });
  };
  app.get('/', function(req, res) {
    return res.render('index.html');
  });
  app.get('/login', function(req, res) {
    var parsed_url;
    console.log(require('sys').inspect(req.session));
    parsed_url = url.parse(req.url, true);
    return oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
      var redirect_url;
      req.session.oauth_token_secret = oauth_token_secret;
      req.session.oauth_token = oauth_token;
      redirect_url = oauth_base_url + 'authorize?oauth_token=' + oauth_token;
      return res.redirect(redirect_url, 303);
    });
  });
  app.get('/oauth/callback', function(req, res) {
    var parsed_url;
    parsed_url = url.parse(req.url, true);
    console.log(require('sys').inspect(req.session));
    return oa.getOAuthAccessToken(req.session.oauth_token, req.session.oauth_token_secret, parsed_url.query.oauth_verifier, function(error, oauth_access_token, oauth_access_token_secret, results) {
      req.session.oauth_access_token = oauth_access_token;
      req.session.oauth_access_token_secret = oauth_access_token_secret;
      if (!error) {
        return res.redirect('/', 303);
      } else {
        return console.log(error);
      }
    });
  });
  app.get('/user/:location', function(req, res) {
    return oa.getTumblrResource(req, res);
  });
  app.post('/user/info', function(req, res) {
    return oa.getTumblrResource(req, res);
  });
  app.listen(3000);
}).call(this);
