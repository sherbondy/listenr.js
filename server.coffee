express = require 'express'
url = require 'url'
# tumblr OAuth secrets
secrets = require './secrets'
app = express.createServer()

app.configure ->
    app.use express.methodOverride()
    app.use express.bodyParser()
    app.use express.cookieParser()
    app.use express.session {secret: secrets.session_secret}
    app.use app.router
    app.set 'view options', {layout:false}
    app.register '.html', {
      compile: (str, options)->
        (locals)-> str
    }

app.configure 'development', ->
    app.use express.static __dirname + '/static'
    app.use express.errorHandler { dumpExceptions: true, showStack: true }

oauth_base_url = 'http://www.tumblr.com/oauth/'
api_base_url = 'http://api.tumblr.com/v2'

OAuth = require('oauth').OAuth
oa = new OAuth oauth_base_url+'request_token',
               oauth_base_url+'access_token',
               secrets.oauth_consumer_key,
               secrets.oauth_secret_key,
               '1.0A',
               'http://eps.local:3000/oauth/callback',
               'HMAC-SHA1'

oa.getTumblrResource = (req, res)->
  oa.getProtectedResource(
    api_base_url+req.url, req.method,
    req.session.oauth_access_token,
    req.session.oauth_access_token_secret,
    (error, data)->
      res.json JSON.parse data
  )


app.get '/', (req, res)->
  res.render 'index.html'

app.get '/login', (req, res)->
  console.log require('sys').inspect(req.session)
  parsed_url = url.parse req.url, true

  oa.getOAuthRequestToken (error, oauth_token, oauth_token_secret, results)->
      req.session.oauth_token_secret = oauth_token_secret
      req.session.oauth_token = oauth_token

      redirect_url = oauth_base_url+'authorize?oauth_token='+oauth_token
      res.redirect redirect_url, 303

app.get '/oauth/callback', (req, res)->
  parsed_url = url.parse req.url, true
  console.log require('sys').inspect(req.session)

  oa.getOAuthAccessToken(
    req.session.oauth_token,
    req.session.oauth_token_secret,
    parsed_url.query.oauth_verifier,
    (error, oauth_access_token, oauth_access_token_secret, results)->
      # the good stuff
      req.session.oauth_access_token = oauth_access_token
      req.session.oauth_access_token_secret = oauth_access_token_secret

      if not error
        res.redirect '/', 303
      else
        console.log error
  )

app.get '/user/:location', (req, res)->
  oa.getTumblrResource req, res

app.post '/user/info', (req, res)->
  oa.getTumblrResource req, res

app.listen 3000
