var log = console.log;

console.log = function() {
	log.apply(console, [(new Date()).toISOString(), ' | '].concat(arguments[0]));
};

var http = require('http');
var querystring = require('querystring');
var utils = require('util');
var fs = require('fs');

var stack = [];
var readURL = '/api/mail.read.json/';

function multiPartBodyToJSON(body) {
	var lineBreaker = body.split("\n")[0];
	var regex = /name="(.*)"\s(.+\s)*\s+([\s|\S]*)/;

	var multipartTokens = body.split(lineBreaker);

	var obj = {};
	var match;

	for (var i = 0; i < multipartTokens.length; i++) {
		var tokens = regex.exec(multipartTokens[i]);
		if (tokens) {
			obj[tokens[1]] = tokens[3].slice(0, -1);
		}
	}

	return obj;
}

http.createServer(function(req, res) {

	switch (req.url) {
		case '/api/mail.send.json/':
		case '/api/mail.send.json':

		if (req.method == 'POST') {

			console.log("Intercepted mail!!");

			var fullBody = '';

			req.on('data', function(chunk) {
				fullBody += chunk.toString().split("\r").join("");
			});

			req.on('end', function() {
					// parse the received body data
					var decodedBody = multiPartBodyToJSON(fullBody);
					decodedBody.to = decodedBody["to[]"] ? decodedBody["to[]"] : decodedBody["to"];
					decodedBody.receivedAt = Date.now();

					stack.push(decodedBody);

					console.log("Mail to: " + decodedBody.to);

					res.writeHead(200, "OK", {
						'Content-Type': 'application/json'
					});
					res.end('{ "message": "success", "errors": [] }');
				});

		} else {
			res.writeHead(405, "Method not supported", {
				'Content-Type': 'text/html'
			});
			res.end('<html><head><title>405 - Method not supported</title></head><body><h1>Method not supported.</h1></body></html>');
		}

		break;
		case '/api/mail.clear.json':
		case '/api/mail.clear.json/':

		stack.length = 0;
		res.writeHead(200, "OK", {
			'Content-Type': 'application/json'
		});
		res.end('{ "message": "success", "errors": [] }');

		console.log("Cleared all emails");

		break;
		case '/api/mail.read.json':
		case '/api/mail.read.json/':
		default:

		if (req.url.indexOf(readURL) == 0) {
			var email = decodeURIComponent(req.url.substring(readURL.length));

			console.log("Searched for: " + email);

			var mails = [];

			for (var i = 0; i < stack.length; i++) {
				if (JSON.stringify(stack[i].to).indexOf(email) !== -1)
					mails.push(stack[i]);
			}

			console.log("Found " + mails.length + " mails");

			res.writeHead(200, "OK", {
				'Content-Type': 'application/json'
			});
			res.end(JSON.stringify({
				"total": mails.length,
				"results": mails
			}));
		}else{
			res.writeHead(200, "OK", {
				'Content-Type': 'text/html'
			});
			fs.readFile("index.html", function (e, f) {
				res.end(f);
			});	
		}		

	}
}).listen(3000);