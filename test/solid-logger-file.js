'use strict';

var path = require('path');

require('chai').should();

describe('Testing Solid Logger - FILE', function(){
    var logger = null;

    describe('Test Logger using a file adapter and the config object passed in through the init function.',
        function() {
            it('should return a valid logger object', function() {
                logger = require('../lib/solid-logger').init({
                    adapters: [{
                        type: 'file',
                        path: path.join(__dirname, '../') + 'log/std.out.log',
                        application: 'grasshopper-api',
                        machine: 'dev-server'
                    }]
                });

                logger.should.be.a('object');
            });

            it('should output all of our different colors for the console.', function() {

                logger.debug('FILE_INIT_EXAMPLE', 'DOES THIS SHOW UP?');
                logger.error('FILE_INIT_EXAMPLE', 'DOES THIS SHOW UP?');
                logger.warn('FILE_INIT_EXAMPLE', 'DOES THIS SHOW UP?');
                logger.info('FILE_INIT_EXAMPLE', 'DOES THIS SHOW UP?');
                logger.trace('FILE_INIT_EXAMPLE', 'DOES THIS SHOW UP?');
                logger.trace('DOES THIS SHOW UP WITHOUT BRACKETS?');
            });
        });
});