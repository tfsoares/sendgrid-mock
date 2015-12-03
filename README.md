# Sendgrid-Mock

This docker allows mocking the real Sendgrid Rest Server. 

Being specially useful when testing it speeds up mail automation, eliminating the need to poll for services like real email servers (gmail, etc.) or Mailinator.

## What to change on Sendgrid
This will store the sent email on memory, allowing the recipient to be searched.

The endpoint used is: `POST http://<docker_gateway>/api/mail.send.json` in place of the real service endpoint `POST https://api.sendgrid.com/api/mail.send.json`.

The configurations would be:
##### Node.js
``` Javascript
require('sendgrid')(sendgrid_username, sendgrid_password, {
    "protocol":"http",
    "host": "<docker_gateway>",
    "port":3000 
});
```
##### Java
``` Java
new SendGrid("SENDGRID USERNAME", "SENDGRID_PASSWORD")
    .setUrl("http://<docker_gateway>:3000");
```

## Read Messages
This endpoint will allow knowing if an email sending has been requested.

##### Endpoint
`GET http://<docker_gateway>:3000/api/mail.read.json/<email_to_search>`
##### Response
`{ "total": <how_may_mails>, "results": [<mails>] }`

## Clear messages
This will clear all cached emails. This can not be reversed.

##### Endpoint
`GET http://<docker_gateway>:3000/api/mail.clear.json`
##### Response
`{ "message": "success", "errors": [] }`

## Run
To run this docker you will need to have Docker and installed. You can also just run the bash script `build_and_run.sh`.

## Thanks
* [mhart/alpine-node](https://github.com/mhart/alpine-node) for the awesomely small Alpine-based Node.js images