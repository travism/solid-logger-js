'use strict';

require('colors');

var Promise = require('bluebird'),
    _ = require('underscore'),
    resources = require('../resources');

module.exports = {
    init: init
};

_.extend(ConsoleLogger.prototype, {
    validateConfig: validateConfig,
    write: write,
    writeLog: writeLog
});

function ConsoleLogger(config) {
    this.config = config;
}

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
    return Promise.bind(this)
        .then(function() {
            return this.writeLog(type, category,message)
        })
        .catch(function(err){
            console.log('ERROR: Could not write console log.');
            console.log(err.stack);
        });
}

/**
 * Internal method to append our log entry to a file.
 * @param type Type of entry (debug, info, error, warn, trace)
 * @param category User defined label for the entry
 * @param message Message to be written to file system.
 * @returns {Function|promise|promise|Q.promise}
 */
function writeLog(type, category, message){
    var now = new Date(),
        timeStamp = (
            now.getMonth() + 1) +
            '/' + now.getDate() +
            '/' + now.getFullYear() +
            ' ' + now.getHours() +
            ':' + now.getMinutes() +
            ':' + now.getSeconds() +
            ':' + now.getMilliseconds(),
        entry = '[' + timeStamp + ']' +
            '[' + this.config.application.toUpperCase() + ']' +
            '[' + this.config.machine.toUpperCase() + ']' +
            '[' + type.toUpperCase() + ']';

    if(!message){
        entry = entry + ' ' + JSON.stringify(category);
    }
    else {
        entry = entry + '[' + category + '] ' + JSON.stringify(message);
    }

    console.log(decorate(entry, type));
}


function decorate(message, type){

    var decoratedMessage = message;

    switch (type){
        case 'debug':
            decoratedMessage = message.magenta.italic;
            break;
        case 'trace':
            decoratedMessage = message.grey.italic;
            break;
        case 'warn':
            decoratedMessage = message.yellow;
            break;
        case 'info':
            decoratedMessage = message.blue;
            break;
        case 'error':
            decoratedMessage = message.red.bold;
            break;
        default:
            break;
    }
    return decoratedMessage;
}







