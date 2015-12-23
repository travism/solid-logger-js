'use strict';

var Logger = require('../../lib/solid-logger'),
    BB = require('bluebird'),
    util = require('./util'),
    express = require('express'),
    logger = Logger.init({
        adapters: [{
            type: 'remote',
            verb: 'GET',
            url: 'http://localhost:4321/log',
            application: 'test',
            machine: 'test-host'
        }]
    }),
    should = require('chai').should(),
    app,
    server,
    callback = {
        hit : function() { console.log('hit'); }
    },
    listening;




describe('Testing Solid Logger - REMOTE', function() {
    before(function() {
        app = express();
        listening = new BB(function(resolve) {
            app.get('/log', function(req) {
                callback.hit(req);
            });
            server = app.listen(4321, function() {
                console.log('server running');
                resolve();
            });
        });
    });
    it('should return a valid logger object', function() {
        logger.should.be.a('object');
    });

    it('should send a get request to the configured url', function(done) {

        listening
            .then(function() {
                callback.hit = function() {
                    done();
                };
                logger.debug('critical', 'hi');
            });

    });

    describe('if category provided', function() {

        it('should send timestamp, application, machine, type, category, and message', function(done) {

            listening
                .then(function() {
                    callback.hit = function(req) {

                        should.exist(req.query.timestamp);

                        req.query.application.should.equal('TEST');
                        req.query.machine.should.equal('TEST-HOST');
                        req.query.type.should.equal('DEBUG');
                        req.query.category.should.equal('CRITICAL');
                        req.query.message.should.equal('hi');
                        done();
                    };

                    logger.debug('critical', 'hi');
                });
        });
    });

    describe('if category not provided', function() {

        it('should send timestamp, application, machine, type, category, and message', function (done) {

            listening
                .then(function () {

                    callback.hit = function (req) {
                        should.exist(req.query.timestamp);
                        should.not.exist(req.query.category);

                        req.query.application.should.equal('TEST');
                        req.query.machine.should.equal('TEST-HOST');
                        req.query.type.should.equal('DEBUG');
                        req.query.message.should.equal('hi');
                        done();
                    };

                    logger.debug('hi');
                });
        });
    });

});