var express = require('express');
var bodyparser = require('body-parser');

var app = express();

var HOME = '<html><head><title>Start here | ProvaTweets4RC</title></head><body><h2>Welcome on ~ ProvaTweets4RC ~</h2><p>Click <a href=\"http://127.0.0.1:4242/authenticate\">here</a> to authenticate this application on Twitter.</p></body></html>';

//var AUTHENTICATED = '<html><head><title>Authentification succeded! | ProvaTweets4RC</title></head><body><h2>You\'re still on ~ ProvaTweets4RC ~</h2><p>The authentification was successfull!<br />Write on your browser\'s addressbar \"/retrieveLast2Tweets?user=USERNAME\", using a valid Twitter username instead of \"USERNAME\".</p></body></html>';
var AUTHENTICATED = '<html><head><title>Authentification succeded! | ProvaTweets4RC</title></head><body><h2>You\'re still on ~ ProvaTweets4RC ~</h2><p><form action=\"http://localhost:4242/retrieveLastTweets\" method=\"get\" enctype=\"application/x-www-form-urlencoded\">Username:<br /><input type=\"text\" name=\"user\"><br />Number of Tweets:<br /><input type=\"text\" name=\"count\"><br /><br /><input type=\"submit\" name=\"retrieve\" value=\"Retrieve Tweets\"<br /></form></p></body></html>';


var TWEET_RES_PRE = '<html><head><title>TWEETS LIST! | ProvaTweets4RC</title></head><body>';
var TWEET_RES_POST = '</body></html>';


var tweets = function(r) {
	var page_body = '<p align=\"center\"><strong>~ Here are the tweets you wanted! ~</strong></p><p>You can select another user whose tweets you want here:<br /><form action=\"http://localhost:4242/retrieveLastTweets\" method=\"get\" enctype=\"application/x-www-form-urlencoded\">Username:<br /><input type=\"text\" name=\"user\"><br />Number of Tweets:<br /><input type=\"text\" name=\"count\"><br /><br /><input type=\"submit\" name=\"retrieve\" value=\"Retrieve Tweets\"<br /></form></p><br /><strong>Tweets created by:</strong> ' + r[0].user.name + '<br /><br /><hr width=75%>';
	for(i=0; i<r.length; i++) {
		page_body = page_body + '<strong>Date:</strong> ' + r[i].created_at + '<br />' +
								'<strong>Tweet:</strong> ' + r[i].text + '<br /><hr width=75%>'
	}
	return page_body;
};

var tweetsList = function(r) {
	return TWEET_RES_PRE + tweets(r) + TWEET_RES_POST;
};

var KEY = '';
var SECRET = '';

var access_token;

app.get('/', function(req, res) {
	console.log('Someone\'s here!');
	res.send(HOME);
} );

app.get('/authenticate', function(req, res) {
	console.log('richiesta autorizzazione...');
	var auth_string_generate = function() {
		var key_en = encodeURIComponent(KEY);
		var secret_en = encodeURIComponent(SECRET);
		var credential = key_en + ':' + secret_en;
		return credential;
	};
	var auth_string = auth_string_generate();
	var auth_en = new Buffer(auth_string).toString('base64');

	var url = 'https://api.twitter.com/oauth2/token';
	var headers = { 
		'Authorization': 'Basic '.concat(auth_en),
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
	};
	
	var body1 = 'grant_type=client_credentials';
  
	var request = require('request');

	console.log('invio richiesta auth...')
	request.post( {
			headers: headers,
			url:     url,
			body: body1
		}, function(error, response, body) {
			var body_json = JSON.parse(body);
			access_token = body_json.access_token;
			res.send(AUTHENTICATED);
		} );
    
} );

app.get('/retrieveLastTweets', function(req, res) {
	if(access_token !== 'undefined') {
		console.log('richiesta tweets...');

		var url = 'https://api.twitter.com/1.1/statuses/user_timeline.json';

		var headers = { 
			'Authorization': 'Bearer '.concat(access_token)
		};
	
		var user = req.query.user;
		var count = req.query.count;

		var request = require('request');

    	console.log('invio richiesta tweets...');
		request.get( {
			headers: headers,
			url:     url,
			//AGGIUNGERE trasferimento parametri user e count
			qs: {screen_name: user, count: count}
		}, function(error, response, body) {
			var body_json = JSON.parse(body);
			res.send(tweetsList(body_json));
		} );
	}
	else
		console.log('autorizzazione negata!!! Go to /authenticate');
} );


var server = app.listen(4242, function() {
	console.log(server.address());
	var host = server.address().address;
	var port = server.address().port;

 	console.log('Example app listening at http://%s:%s', host, port);
} );
