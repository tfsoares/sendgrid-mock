//const expect = require('chai').expect;
const expect = console.assert;
const request = require('supertest');

const URL = '127.0.0.1:3000';
const getMail = (address, callback) => {
    request(`${URL}`)
        .get(`/api/mail.read.json/${address}`)
        .expect(200)
        .end((err, response) => {
            if (err) throw err;

            callback(err, response.body);
        });
};

const getMockEmail = () => {
    return {
        "to": 'example@example.com',
        "from": 'other@example.com',
        "subject": 'Hello World',
        "text": 'My first email through SendGrid.'
    }
};

const random = (high = 9999999) => {
    return Math.random() * high;
}

describe('Sendgrid Mock', () => {
    let client;

    before((done) => {
        let { server } = require('../_webserver.js');
        server.start();

        client = new require('sendgrid')("sendgrid_username", "sendgrid_password", {
            "protocol": "http",
            "host": "127.0.0.1",
            "port": 3000
        });

        expect(client != null);
        done();
    });

    it('should receive an email', (done) => {

        let mockEmail = getMockEmail();

        client.send(mockEmail, () => {

            let inbox = getMail(mockEmail.to, (err, inbox) => {
                if (err) throw err;

                expect(inbox.total === 1);

                done();
            });
        });
    });

    it('should return empty when searching for an unexisting inbox', (done) => {

        let fakeAddress = "noinbox@inbox.com";

        let inbox = getMail(fakeAddress, (err, inbox) => {
            if (err) throw err;

            console.log(inbox);

            expect(inbox.total === 0, "should be [0]");
            expect(inbox.address === fakeAddress, "should be [fakeAddress]");

            done();
        });
    });

    it(`should support multiple to's`, (done) => {

        let mockEmail = getMockEmail();
        mockEmail.to = [`1${mockEmail.to}`, `2${mockEmail.to}`];

        client.send(mockEmail, () => {

            let inbox = getMail(mockEmail.to, (err, inbox) => {
                if (err) throw err;

                expect(inbox.total === 1);

                done();
            });
        });
    });

});