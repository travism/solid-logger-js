'use strict';

var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),
    _ = require('underscore'),
    resources = require('../resources'),
    FILE_NOT_FOUND = 'ENOENT';

Promise.longStackTraces();

module.exports = {
    init: init
};

_.extend(Logger.prototype, {
    createEmptyFile: createEmptyFile,
    ensureLogsRotated: ensureLogsRotated,
    getFileStats: getFileStats,
    getOrCreateFile: getOrCreateFile,
    handleStatsError: handleStatsError,
    validateConfig: validateConfig,
    write: write,
    writeLog: writeLog
});

function Logger(config) {
    this.config = config;
}

/**
 * The init function should be called at the beginning of the object life cycle. This method will be responsible
 * for doing all of the setup for the adapter.
 *
 * @param config Object that will contain the path to write the log file and the type of adapter.
 */
function init(config){
    var logger = new Logger(config);
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

    if(this.config.type.toLowerCase() !== 'file'){
        throw new Error(resources.errors.incorrectAdapterType);
    }

    if(!this.config.path){
        throw new Error(resources.errors.missingPath);
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
        .then(this.getOrCreateFile)
        .then(this.ensureLogsRotated)
        .then(function(){
            return this.writeLog(type, category,message);
        })
        .catch(function(err){
            console.log('\n\nERROR: Could not write to log.\n\n');
            console.log(err.stack);
        });
}

/**
 * Method will try to load a log file. If it exists it will just be returned, if not then it will be created.
 * @returns {*}
 */
function getOrCreateFile(){
    return Promise.bind(this)
        .then(this.getFileStats)
        // If the log file doesn't exist, try to make it
        .catch(this.handleStatsError);
}

/**
 * Method that promises to send back the details(stats) about a file. If the file doesn't exist then it will fail
 * with an error of ENOENT
 * @returns {*}
 */
function getFileStats(){
    return fs.statAsync(this.config.path);
}

/**
 * Method that will get called if we don't receive the stats of the log file. That means that it can't be read
 * for whatever reason (most likely doesn't exist or has read issues). If it doesn't exist we try to create it.
 * @param err
 * @returns {Function|promise|promise|Q.promise}
 */
function handleStatsError(err){
    console.log('^^^^ ERROR:handleStatsError ^^^^');

    if(err.cause.code === FILE_NOT_FOUND) {

        console.log('Log file does not exist. Try to create. at: ' + this.config.path);

        return Promise.bind(this)
            .then(this.createEmptyFile)
            .then(this.getFileStats)
            .catch(function(err){

                console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
                console.log('^^^^ ERROR:Could not create log file. ^^^^');
                console.log(err);
                console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');

                // We do not know what to do - bail
                throw err;
            });
    } else {

        // We do not know what to do - bail
        throw err;
    }
}

/**
 * Method will look at the stats of a file and if it was modified on a date that was not today then it will
 * rename it to it's modfied date so we can start fresh daily.
 * @param stats Stats of a file
 * @returns {string} Status of rotation ('datematches' - do nothing, 'logrotated' - change detected rename file)
 */
function ensureLogsRotated(stats){
    var today = new Date(),
        modifiedDate = new Date(stats.mtime),
        archivedFileName;

    if(!_logDatesMatch(today, modifiedDate)){
        archivedFileName = _createRotatedLogName(this.config.path, modifiedDate);
        console.log('Log file modified previous to today, archiving to: ' + archivedFileName);

        return fs.renameAsync(this.config.path, archivedFileName)
            .bind(this)
            .then(this.createEmptyFile);
    }
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
        timeStamp = (now.getMonth() + 1) +
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
        entry = entry + ' ' + JSON.stringify(category) + '\n';
    }
    else {
        entry = entry + '[' + category + '] ' + JSON.stringify(message) + '\n';
    }

    return fs.appendFileAsync(this.config.path, entry, {});
}

/**
 * Method will create a log file with the passed in name without any content.
 * @returns {*}
 */
function createEmptyFile(){
    return fs.writeFileAsync(this.config.path, '');
}

/**
 * Internal utility method that will tell me if the date from the existing log file matches todays Date
 * @param d1 1st date to compare
 * @param d2 2nd date to compare
 * @returns {boolean}
 */
function _logDatesMatch(d1, d2){
    return ((d1.getFullYear()===d2.getFullYear())&&(d1.getMonth()===d2.getMonth())&&(d1.getDate()===d2.getDate()));
}

/**
 * Method that will take the passed in logPath and recreate the path with a modified file name. So if a file
 * was modified on a previous day and a new log is coming in on the current day, then we want to rename the
 * old log file with the date in the name.
 * @param logPath Path of current log file
 * @param modifiedDate Last file modified date
 * @returns {string} New file path for previous log
 */
function _createRotatedLogName(logPath, modifiedDate){
    var logName = logPath,
        suffixIdx = logPath.indexOf('.'),
        suffix = '';

    if(suffixIdx > -1){
        suffix = logName.substr(suffixIdx, logName.length);
        logName = logName.replace(
            suffix, ('.' +
                modifiedDate.getFullYear() +
                '-' + (modifiedDate.getMonth() + 1) +
                '-' + modifiedDate.getDate()
                ) + suffix
            );
    }
    else {
        logName = logName +
            ('.' + modifiedDate.getFullYear() + '-' + (modifiedDate.getMonth() + 1) + '-' + modifiedDate.getDate());
    }

    return logName;
}





