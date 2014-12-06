'use strict';

var Logger = require('../../lib/solid-logger'),
    path = require('path'),
    util = require('./util');

require('chai').should();

describe('Testing Solid Logger - FILE', function(){
    var logger = null;

    describe('Test Logger using a file adapter and the config object passed in through the init function.',
        function() {
            it('should return a valid logger object', function() {
                logger = Logger.init({
                    adapters: [{
                        type: 'file',
                        path: path.join(__dirname, '..', '..', 'log', 'std.out.log'),
                        application: 'grasshopper-api',
                        machine: 'dev-server'
                    }]
                });

                logger.should.be.a('object');
            });

            it('should output all of our different colors for the console.', function(done) {

                util.log(logger);
                logger
                    .getWhenCurrentWritesDone()
                    .then(function() {
                        done();
                    });
            });
        });
});