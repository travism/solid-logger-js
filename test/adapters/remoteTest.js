'use strict';

var Logger = require('../../lib/solid-logger'),
    BB = require('bluebird'),
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

});