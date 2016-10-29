'use strict';

var Logger = require('../../lib/solid-logger'),
    util = require('./util');

require('chai').should();

describe('Testing Solid Logger - CONSOLE', function(){
    var logger = null;

    describe('Test Logger using a console adapter and the config object passed in through the init function.', function() {
        it('should return a valid logger object', function() {
            logger = Logger.init({
                adapters: [{
                    type: 'console',
                    application: 'grasshopper-api',
                    machine: 'dev-server'
                }]
            });

            logger.should.be.a('object');
        });

        it('should output all of our different colors for the console.', function() {
            util.log(logger);
        });
    });
});
