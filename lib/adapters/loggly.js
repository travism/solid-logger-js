'use strict';

var _ = require('lodash'),
    BB = require('bluebird'),
    Logger = require('./base'),
    loggly = BB.promisifyAll(require('loggly')),
    resources = require('../resources');

module.exports = {
    init: init
};

function LogglyLogger(config) {
    this.client = null;
    this.config = config;
}

LogglyLogger.prototype = new Logger();

_.extend(LogglyLogger.prototype, {
    init: init,
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
    var logger = new LogglyLogger(config);
    logger.validateConfig();

    logger.config = config;
    logger.client = loggly.createClient({
        token: config.token,
        subdomain: config.application,
        auth: config.auth,

        // TOOD: pushing more tags onto this array, or not using them, should be configurable
        tags: [
            config.domain,
            config.machine
        ]

        // Loggly docs say it uses json stringify if json:true
        // JSON stringify does not handle Errors or circulare references well
        // Logger.createEntry handles them well
    });
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
    if(this.config.type.toLowerCase() !== 'loggly'){
        throw new Error(resources.errors.incorrectAdapterType);
    }
    if(!this.config.application){
        throw new Error(resources.errors.missingApplication);
    }
    if(!this.config.machine){
        throw new Error(resources.errors.missingMachine);
    }
    if(!this.config.token){
        throw new Error(resources.errors.missingToken);
    }
}

/**
 * Internal method to append our log entry to loggly.
 * @param type Type of entry (debug, info, error, warn, trace)
 * @param category User defined label for the entry
 * @returns {function}
 */
function writeLog(type, category){
    return function(message) {
        return this.client.logAsync(message, [type, category]);
    };

}

function write(type, category, message){
    return BB.bind(this)
        .then(this.createEntry(type, category, message))
        .then(this.writeLog(type, category))
        .catch(function(err){
            console.log('ERROR: Could not write Loggly log.');
            console.log(err.stack);
        });
}

