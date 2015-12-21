'use strict';

var Logger = require('../../lib/solid-logger'),
    util = require('./util'),
    logger = null;

require('chai').should();

describe('Testing Solid Logger - REMOTE', function() {
    it('should return a valid logger object', function() {
        console.log(Logger.init);
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
});