'use strict';

var _ = require('lodash'),
    path = require('path'),
    fs = require('fs'),
    BB = require('bluebird'),
    logger = {
        init : init,
        initWithFile : initWithFile,
    },
    chalk = require('chalk');

BB.longStackTraces();

module.exports = logger;

/**
 * Public method required to load in all of the configuration info for adapters.
 * Init initialize and reinitializes, so the list of adapters is set to empty before it runs.
 * @param configuration Object for your adapters.
 * @returns {logger}
 */
function init(configuration){
    var self = {
        config : configuration,
        adapters : [],
        getWhenCurrentWritesDone : getWhenCurrentWritesDone
    };

    _.each(self.config.adapters, function(adapter){
        var adapterInstance;

        try {
            adapterInstance = require('./adapters/' + adapter.type).init(adapter);
        } catch (e) {
            console.log(chalk.red('Initialization Error: '), e);
            throw e;
        }

        adapterInstance.writeQueue = BB.resolve();

        self.adapters.push(adapterInstance);
    });

    [
        'error',
        'info',
        'debug',
        'warn',
        'trace',
        'critical'
    ].forEach(function (type) {
        /**
         * Create a TYPE log entry
         * @param category Categorize your error with a user defined label
         * @param args Include your customized messages. This should be a comma separated list just like `console.log`
         */
        self[type] = function () {
            // If we are still logging and there are messages to write
            if(arguments.length > 0){
                var category = (arguments.length > 1 && _.isString(arguments[0])) ? arguments[0] : '',
                    startIdx = (arguments.length > 1) ? 1 : 0;

                _write.call(self, type, category, Array.prototype.slice.call(arguments, startIdx));
            }
        };
    });

    return self;
}

/**
 * Method that will load configuration info for your adapters from a file.
 * Method that will load configuration info for your adapters from a file.
 * @param configPath path to your configuration file
 * @returns {logger}
 */
function initWithFile(configPath){
    var configString = fs.readFileSync(path.resolve(configPath));

    this.config = JSON.parse(configString);
    this.init(this.config);

    return this;
}

/**
 * Method to expose the write queue. This can be used to check when all queud writes are done:
 * logger.getWriteQueue.then(weAreDoneWithWriteThatWereQueuedUpToHere);
 * @returns {*}
 */
function getWhenCurrentWritesDone() {
    return BB.map(this.adapters, function(adapter) {
        return adapter.writeQueue;
    });
}



/**
 * Local method to load up a write 'job'. We create a tracker so that the async callbacks stay in order and then we
 * kick off the adapterWrite method which recursively loads the adapters and write per their 'write' method. It will
 * also load in the configuration for the adapter each time so you can have the same type of adapters with different
 * settings.
 * @param type error, debug, info, trace, warn
 * @param category User definted category for grouping log entries.
 * @param message Message to be logged.
 */
function _write(type, category, message){
    var config = this.config;

    this.adapters.forEach(function(adapter) {
        //Check configuration to see if we should continue.
        if(adapter.config.filter && (adapter.config.filter.indexOf(type) > -1)){
            return;
        }

        //We are not filtering this out. Continue
        adapter.write(type, category, message);
    });
}
