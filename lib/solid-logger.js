'use strict';

var _ = require('lodash'),
    path = require('path'),
    fs = require('fs'),
    BB = require('bluebird'),
    logger = {
        init : init,
        initWithFile : initWithFile,
        getWhenCurrentWritesDone : getWhenCurrentWritesDone
    },
    adapters = [],
    config = null;

BB.longStackTraces();

module.exports = logger;

logger.config = {};

/**
 * Public method required to load in all of the configuration info for adapters.
 * Init initialize and reinitializes, so the list of adapters is set to empty before it runs.
 * @param configuration Object for your adapters.
 * @returns {logger}
 */
function init(configuration){
    config = configuration;

    // We are initializing, so start with a fresh list of adapters
    adapters = [];

    _.each(config.adapters, function(adapter){
        var adapterInstance = require('./adapters/' + adapter.type).init(adapter);
        adapterInstance.writeQueue = BB.resolve();

        adapters.push(adapterInstance);
    });

    return this;
}

/**
 * Method that will load configuration info for your adapters from a file.
 * @param configPath path to your configuration file
 * @returns {logger}
 */
function initWithFile(configPath){
    var configString = fs.readFileSync(path.resolve(configPath));

    config = JSON.parse(configString);
    this.init(config);

    return this;
}

/**
 * Method to expose the write queue. This can be used to check when all queud writes are done:
 * logger.getWriteQueue.then(weAreDoneWithWriteThatWereQueuedUpToHere);
 * @returns {*}
 */
function getWhenCurrentWritesDone() {
    return BB.map(adapters, function(adapter) {
        return adapter.writeQueue;
    });
}

[
    'error',
    'info',
    'debug',
    'warn',
    'trace'
].forEach(function(type) {
    /**
     * Create a TYPE log entry
     * @param category Categorize your error with a user defined label
     * @param message Include your customized message.
     */
    logger[type] = function(category, message){
        write(type, category, message);
    };
});

/**
 * Local method to load up a write 'job'. We create a tracker so that the async callbacks stay in order and then we
 * kick off the adapterWrite method which recursively loads the adapters and write per their 'write' method. It will
 * also load in the configuration for the adapter each time so you can have the same type of adapters with different
 * settings.
 * @param type error, debug, info, trace, warn
 * @param category User definted category for grouping log entries.
 * @param message Message to be logged.
 */
function write(type, category, message){

    adapters.forEach(function(adapter) {

        // Add the write call to the queue and run it in order and only when previous calls are done
        adapter.writeQueue = adapter.writeQueue.then(function() {
            return BB.resolve(adapter.write(type, category, message));
        });
    });
}