'use strict';

require('colors');

var logger = {},
    Q = require('q'),
    resources = require('../resources');

module.exports = logger;
logger.config = {};



/**
 * Before we try to do any file operations we need to validate if the configuration is complete so that our logs
 * are useful.
 * @returns {boolean}
 */
function validateConfig(){

    if(!logger.config.type){
        throw new Error(resources.errors.missingType);
    }
    else if(logger.config.type.toLowerCase() !== 'console'){
        throw new Error(resources.errors.incorrectAdapterType);
    }
    else if(!logger.config.application){
        throw new Error(resources.errors.missingApplication);
    }
    else if(!logger.config.machine){
        throw new Error(resources.errors.missingMachine);
    }

    return true;
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

/**
 * Internale method to append our log entry to a file.
 * @param type Type of entry (debug, info, error, warn, trace)
 * @param category User defined label for the entry
 * @param message Message to be written to file system.
 * @returns {Function|promise|promise|Q.promise}
 */
function write(type, category, message){
    var deferred = Q.defer(),
        now = new Date(),
        timeStamp = (
            now.getMonth() + 1) +
            '/' + now.getDate() +
            '/' + now.getFullYear() +
            ' ' + now.getHours() +
            ':' + now.getMinutes() +
            ':' + now.getSeconds() +
            ':' + now.getMilliseconds(),
        entry = '[' + timeStamp + ']' +
            '[' + logger.config.application.toUpperCase() + ']' +
            '[' + logger.config.machine.toUpperCase() + ']' +
            '[' + type.toUpperCase() + ']';

    if(!message){
        entry = entry + ' ' + JSON.stringify(category);
    }
    else {
        entry = entry + '[' + category + '] ' + JSON.stringify(message);
    }

    console.log(decorate(entry, type));

    deferred.resolve('Success');

    return deferred.promise;
}

/**
 * The init function should be called at the beginning of the object life cycle. This method will be responsible
 * for doing all of the setup for the adapter.
 *
 * @param config Object that will contain the path to write the log file and the type of adapter.
 */
logger.init = function(config){
    this.config = config;
    return this;
};

logger.write = function(type, category, message){
    var deferred = Q.defer();

    Q.fcall(validateConfig)
        .then(function(valid){

            if(!valid) {
                console.log(valid);
                throw new Error('Config not valid');
            }

            return write(type, category,message);

        })
        .fail(function(err){
            console.log('ERROR: Could not write log.');
            console.log(err);
        })
        .done(function(){
            deferred.resolve('Success');
        });

    return deferred.promise;
};
