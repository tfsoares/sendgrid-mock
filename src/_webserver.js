// small logging utilities
//const log = log;
const log = (...objs) => console.log(`${(new Date()).toISOString()} | ${objs}`);
const EMPTY_ARRAY = [];

//const fs = require('fs');
//import fs from 'fs';
//import Hapi from 'hapi';
//import Boom from 'boom';
//const Litespeed = require('litespeed');
const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000 });

var stack = [];
const database = new Map();
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

server.register(require('inert'), (err) => {

	if (err) throw err;

	server.route({
		"method": 'GET',
		"path": '/{filename}',
		"handler": {
			file: function (request) {
				return request.params.filename;
			}
		}
	});
});


server.route([
	{
		"method": 'GET',
		"path": '/api/mail.read.json/{address}',
		"handler": (request, reply) => {

			let address = request.params.address;

			log("Searching for: " + address);
			let inbox = database.get(address) || [];
			reply({
				"total": inbox.length,
				"address": address,
				"results": inbox
			});
		}
	}, {
		"method": 'DELETE',
		"path": '/api/mail.clear.json',
		"handler": (request, reply) => {

			database.clear();

			reply({ "message": 'success', "errors": [] });
		}
	}, {
		"method": 'POST',
		"path": '/api/mail.send.json',
		"handler": (request, reply) => {

			log("Intercepted mail!!");
			//console.dir(request.payload);

			// parse the received body data
			//let mail = multiPartBodyToJSON(request.payload);
			let mail = request.payload;

			mail.receivedAt = Date.now();

			// aggregate all addresses on TO, CC and BCC
			[
				mail["to"] || EMPTY_ARRAY, ...mail["to[]"] || EMPTY_ARRAY,
				mail["cc"] || EMPTY_ARRAY, ...mail["cc[]"] || EMPTY_ARRAY,
				mail["bcc"] || EMPTY_ARRAY, ...mail["bcc[]"] || EMPTY_ARRAY
			].filter(address => address && typeof (address) === "string" && address !== '')
				.forEach((address) => {

					if (!database.has(address)) {
						database.set(address, []);
						log(database.get(address));
					}

					let inbox = database.get(address);
					inbox.push(Object.assign({}, mail));

					log(`Mail to: [${address}]`);
				});

			reply({ "message": "success", "errors": [] });
		}
	}
]);

Object.assign(module.exports, { "server": server });