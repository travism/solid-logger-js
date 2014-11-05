'use strict';
require('chai').should();

describe('Testing Solid Logger', function(){
    var path = require('path');

    describe('Test Logger using a file adapter and the config object passed in through the init function.', function() {
        it('should return a valid logger object', function() {
            var logger = require('../lib/solid-logger').init({
                adapters: [{
                    type: 'file',
                    path: path.resolve('./log/test.log'),
                    application: 'grasshopper-api',
                    machine: 'dev-server'
                },{
                    type: 'file',
                    path: path.resolve('./log/backup-test.log'),
                    application: 'grasshopper-api',
                    machine: 'dev-server'
                }]
            });

            logger.should.be.a('object');

        });

        it('should return a valid logger object when configuring with a file.', function() {
            var logger = require('../lib/solid-logger').initWithFile('./config/config.example.json');

            logger.should.be.a('object');

        });

        xit('timer test', function(done) {
            var logger = require('../lib/solid-logger').init({
                adapters: [{
                    type: 'file',
                    path: path.join(__dirname, '../', 'log/test1.out.log'),
                    application: 'grasshopper-api1',
                    machine: 'dev-server1'
                }, {
                    type: 'file',
                    path: path.join(__dirname, '../', 'log/test2.out.log'),
                    application: 'grasshopper-api2',
                    machine: 'dev-server2'
                }, {
                    type: 'console',
                    application: 'grasshopper-api',
                    machine: 'dev-server'
                }]
            }),
                counter = 100 + 1,
                index = 0;

            while (--counter) {
                logSet(logger, ++index);
            }

            logger.getWhenCurrentWritesDone().then(done.bind(null, undefined));
        });

    });
});

function logSet(logger, index) {
    logger.debug('FILE_INIT_EXAMPLE', 'DOES THIS SHOW UP? ' + index );
    logger.error('FILE_INIT_EXAMPLE', 'DOES THIS SHOW UP? ' + index);
    logger.warn('FILE_INIT_EXAMPLE', 'DOES THIS SHOW UP? ' + index);
    logger.info('FILE_INIT_EXAMPLE', 'DOES THIS SHOW UP? ' + index);
    logger.trace('FILE_INIT_EXAMPLE', 'DOES THIS SHOW UP? ' + index);
    logger.trace('DOES THIS SHOW UP WITHOUT BRACKETS? ' + index);
    logger.trace({message: 'This is my error message ' + index, code: 400});
}