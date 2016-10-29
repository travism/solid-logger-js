'use strict';

var _ = require('lodash'),
    BB = require('bluebird'),
    chalk = require('chalk'),
    Logger = require('./base'),
    resources = require('../resources');

module.exports = {
    init: init
};

function ConsoleLogger(config) {
    this.config = config;
}

ConsoleLogger.prototype = new Logger();

_.extend(ConsoleLogger.prototype, {
    validateConfig: validateConfig,
    write: write,
    writeLog: writeLog
});

/**
 * The init function should be called at the beginning of the object life cycle. This method will be responsible
 * for doing all of the setup for the adapter.
 *
 * @param config Object that will contain the path to write the log file and the type of adapter.
 */
function init(config){
    var logger = new ConsoleLogger(config);
    logger.validateConfig();
    return logger;
}

/**
 * Before we try to do any file operations we need to validate if the configuration is complete so that our logs
 * are useful.
 * @returns {boolean}
 */
function validateConfig(){

    if(!this.config.type){
        throw new Error(resources.errors.missingType);
    }
    if(this.config.type.toLowerCase() !== 'callback'){
        throw new Error(resources.errors.incorrectAdapterType);
    }
    if(!this.config.application){
        throw new Error(resources.errors.missingApplication);
    }
    if(!this.config.machine){
        throw new Error(resources.errors.missingMachine);
    }
    if(!this.config.callback && !_.isFunction(this.config.callback)) {
        throw new Error(resources.errors.missingCallback);
    }
}

function write(type, category, messages){
    return BB.bind(this)
        .then(this.createEntry(type, category, messages, false))
        .then(this.writeLog)
        .catch(function(err){
            console.log('\n\nERROR: Could not write callback log.');
            console.log(err.stack);
        });
}

/**
 * Internal method to append our log entry to a file.
 * @param type
 * @returns {function}
 */
function writeLog(msgs){
    var data = (msgs.length === 1) ? msgs[0] : msgs;
    
    this.config.callback(data);
}
