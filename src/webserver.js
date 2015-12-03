var log = console.log;

console.log = function(){
  log.apply(console, [(new Date()).toISOString(), ' | '].concat(arguments[0]));
};
// logging

var http = require('http');
var querystring = require('querystring');
var utils = require('util');

var stack = [];

function multiPartBodyToJSON(body) {
    var regex = /name="(.*)"\s(.+\s)*\s+(.*?)\s--.*/g;

    var obj = {};
    var match;
    while ((match = regex.exec(body)) !== null) {
        if (match.index === regex.lastIndex) {
            re.lastIndex++;
        }
        obj[match[1]] = match[3];
    }

    return obj;
}

http.createServer(function(req, res) {

    switch (req.url) {
        case '/api/mail.send.json/':
        case '/api/mail.send.json':

            if (req.method == 'POST') {

                console.log("Received mail!!");

                var fullBody = '';

                req.on('data', function(chunk) {
                    fullBody += chunk.toString().split("\r").join("");
                });

                req.on('end', function() {
                    res.writeHead(200, "OK", {
                        'Content-Type': 'application/json'
                    });

                    console.log(fullBody);

                    // parse the received body data
                    var decodedBody = multiPartBodyToJSON(fullBody);

                    console.log(decodedBody);

                    stack.push(decodedBody);

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
        default:
            var readURL = '/api/mail.read.json/';
            if (req.url.indexOf(readURL) == 0) {
                var email = req.url.substring(readURL.length);

                console.log("Searched for: " + email);

                var mails = [];

                for (var i = 0; i < stack.length; i++) {
                    if (stack[i].to == email)
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
            }
    }
}).listen(3000);