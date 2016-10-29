'use strict';

var Logger = require('../../lib/solid-logger'),
    rawBody = require('raw-body'),
    express = require('express'),
    should = require('chai').should(),
    EventEmitter = require('events').EventEmitter,
    channel = new EventEmitter(),
    app,
    server,
    logger = Logger.init({
        adapters: [{
            type: 'remote',
            verb: 'GET',
            url: 'http://localhost:4321/log',
            application: 'test',
            machine: 'test-host'
        }]
    });

describe('Testing Solid Logger - REMOTE', function() {

    before(function(done) {
        app = express();
        app.get('/log', function(req) {
            channel.emit('request', req);
        });
        app.post('/log', function(req) {
            channel.emit('postRequest', req);
        });
        server = app.listen(4321, function() {
            console.log('server running');
            done();
        });
    });

    after(function() {
        server.close();
    });

    it('should return a valid logger object', function() {
        logger.should.be.a('object');
    });

    it('should send a get request to the configured url', function(done) {


        channel.on('request', function() {
            channel.removeAllListeners();
            done();
        });
        logger.debug('critical', 'hi');

    });

    describe('headers', function() {
        it('should set headers if they are set', function(done) {
            var loggerWKey = Logger.init({
                adapters: [{
                    type: 'remote',
                    verb: 'GET',
                    url: 'http://localhost:4321/log',
                    application: 'test',
                    machine: 'test-host',
                    headers : {
                        'x-api-key' : 'bestest',
                        'something' : 'else'
                    }
                }]
            });


            channel.on('request', function (req) {
                channel.removeAllListeners();

                req.headers['x-api-key'].should.equal('bestest');
                req.headers.something.should.equal('else');


                done();
            });

            loggerWKey.debug('critical', 'hi');
        });
    });

    describe('if category provided', function() {

        it('should send timestamp, application, machine, type, category, and message', function(done) {

                    channel.on('request', function(req) {
                        channel.removeAllListeners();

                        should.exist(req.query.timestamp);

                        req.query.application.should.equal('TEST');
                        req.query.machine.should.equal('TEST-HOST');
                        req.query.type.should.equal('DEBUG');
                        req.query.category.should.equal('CRITICAL');
                        req.query.message.should.equal('hi');

                        done();
                    });

                    logger.debug('critical', 'hi');
        });

        it('should send multiple messages', function(done) {
            var cnt = 0;

            channel.on('request', function(req) {
                //console.log(req.query);
                should.exist(req.query.timestamp);

                req.query.application.should.equal('TEST');
                req.query.machine.should.equal('TEST-HOST');
                req.query.type.should.equal('DEBUG');
                req.query.category.should.equal('CRITICAL');

                if(cnt === 0){
                    req.query.message.should.equal('hi');
                }
                else {
                    req.query.message.should.equal('there');
                }


                cnt++;

                if(cnt == 2){
                    channel.removeAllListeners();
                    done();
                }
            });

            logger.debug('critical', 'hi', 'there');
        });
    });

    describe('if category not provided', function() {

        it('should send timestamp, application, machine, type, category, and message', function (done) {

                    channel.on('request', function (req) {
                        channel.removeAllListeners();

                        should.exist(req.query.timestamp);
                        should.not.exist(req.query.category);

                        req.query.application.should.equal('TEST');
                        req.query.machine.should.equal('TEST-HOST');
                        req.query.type.should.equal('DEBUG');
                        req.query.message.should.equal('hi');
                        done();
                    });

                    logger.debug('hi');
        });
    });

    describe('POST request logs', function() {

        it('should send POST request with data if configured', function (done) {

            var loggerWKey = Logger.init({
                adapters: [{
                    type: 'remote',
                    verb: 'POST',
                    url: 'http://localhost:4321/log',
                    application: 'test',
                    machine: 'test-host'
                }]
            });


            channel.on('postRequest', function (req) {
                channel.removeAllListeners();

                rawBody(req)
                    .then(function(data) {
                        data = JSON.parse(data.toString());
                        should.exist(data.timestamp);
                        data.application.should.equal('TEST');
                        data.machine.should.equal('TEST-HOST');
                        data.type.should.equal('DEBUG');
                        data.message.should.equal('test');
                        data.category.should.equal('CRITICAL');
                        done();
                    })
                    .catch(done)

            });

            loggerWKey.debug('critical', 'test');
        });
    });

});
