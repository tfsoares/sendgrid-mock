#!/bin/bash

docker build --rm -t=sendgrid-mock:latest .

docker kill sendgrid-mock
docker rm -v sendgrid-mock

docker run -d -p 3000:3000 --name="sendgrid-mock" sendgrid-mock:latest