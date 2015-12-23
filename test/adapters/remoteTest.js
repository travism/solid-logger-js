'use strict';

var Logger = require('../../lib/solid-logger'),
    util = require('./util'),
    express = require('express'),
    logger = null;

require('chai').should();

describe('Testing Solid Logger - REMOTE', function() {
    it('should return a valid logger object', function() {
        logger = Logger.init({
            adapters: [{
                type: 'remote',
                verb: 'GET',
                application: 'test',
                machine: 'test-host'
            }]
        });

        logger.should.be.a('object');
    });

    it('should send a get request to the configured url', function(done) {
        var app = express();

        app.get('/log', function(req, res) {
            console.log('Request: ', req.query);
            done();
        });

       logger.debug('hi');

    });

});