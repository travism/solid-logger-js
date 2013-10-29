var should = require('chai').should();

describe('Testing Solid Logger', function(){
    var path = require('path');

    describe("Test Logger using a file adapter and the config object passed in through the init function.", function() {
        it('should return a valid logger object', function() {
            var logger = require('../lib/solid-logger').init({
                adapters: [{
                    type: "file",
                    path: path.resolve("./log/test.log"),
                    application: 'grasshopper-api',
                    machine: 'dev-server'
                },{
                    type: "file",
                    path: path.resolve("./log/backup-test.log"),
                    application: 'grasshopper-api',
                    machine: 'dev-server'
                }]
            });

            logger.should.be.a("object");
        });

        it('should return a valid logger object when configuring with a file.', function() {
            var logger = require('../lib/solid-logger').initWithFile("./config/config.example.json");

            logger.should.be.a("object");
            logger.debug("FILE_INIT_EXAMPLE", "DOES THIS SHOW UP?");
        });
    });
});