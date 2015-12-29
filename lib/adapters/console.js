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
    if(this.config.type.toLowerCase() !== 'console'){
        throw new Error(resources.errors.incorrectAdapterType);
    }
    if(!this.config.application){
        throw new Error(resources.errors.missingApplication);
    }
    if(!this.config.machine){
        throw new Error(resources.errors.missingMachine);
    }
}

function write(type, category, message){
    return BB.bind(this)
        .then(this.createEntry(type, category, message))
        .then(this.writeLog(type))
        .catch(function(err){
            console.log('\n\nERROR: Could not write console log.');
            console.log(err.stack);
        });
}

/**
 * Internal method to append our log entry to a file.
 * @param type
 * @returns {function}
 */
function writeLog(type){
    return function(entry) {
        console.log(decorate(entry, type));
    };
}

function decorate(message, type){

    var decoratedMessage = message;

    switch (type){
        case 'debug':
            decoratedMessage = chalk.magenta(message);
            break;
        case 'trace':
            decoratedMessage = chalk.gray(message);
            break;
        case 'warn':
            decoratedMessage = chalk.yellow(message);
            break;
        case 'info':
            decoratedMessage = chalk.blue(message);
            break;
        case 'error':
        case 'critical':
            decoratedMessage = chalk.red.bold(message);
            break;
        default:
            break;
    }
    return decoratedMessage;
}







