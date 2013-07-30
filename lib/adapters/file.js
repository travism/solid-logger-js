(function(){
    "use strict";

    var logger = {},
        fs = require('fs'),
        Q = require('Q'),
        internal = {};

    logger.config = {};

    /**
     * Method will try to load a log file. If it exists it will just be returned, if not then it will be created.
     * @returns {*}
     */
    function getOrCreateFile(){
        var deferred = Q.defer();

        Q.fcall(getFileStats)
            .fail(handleStatsError)
            .fail(function(err){
                //NOTE if we get to another fail here, that means that would couldn't handle the stats error.
                deferred.reject(new Error(err));
            })
            .then(function(stats){
                if(stats){
                    deferred.resolve(stats);
                }
            })
            .done();

        return deferred.promise;
    }

    /**
     * Method that promises to send back the details(stats) about a file. If the file doesn't exist then it will fail
     * with an error of 34
     * @returns {*}
     */
    function getFileStats(){
        var deferred = Q.defer();

        fs.stat(logger.config.path, function(err, stats){
            if (err) {
                deferred.reject(new Error(err.errno));
            } else {
                deferred.resolve(stats);
            }
        });

        return deferred.promise;
    }

    /**
     * Method that will get called if we don't receive the stats of the log file. That means that it can't be read
     * for whatever reason (most likely doesn't exist or has read issues). If it doesn't exist we try to create it.
     * @param err
     * @returns {Function|promise|promise|Q.promise}
     */
    function handleStatsError(err){
        console.log('^^^^ ERROR:handleStatsError ^^^^');
        var deferred = Q.defer();

        if(err.message == '34'){

            console.log('Log file does not exist. Try to create. at: ' + logger.config.path);

            Q.fcall(createEmptyFile)
                .then(getFileStats)
                .fail(function(err){

                    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
                    console.log('^^^^ ERROR:Could not create log file. ^^^^');
                    console.log(err);
                    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');

                    deferred.reject(new Error(err));
                })
                .then(function(stats){
                    deferred.resolve(stats);
                })
                .done();
        }
        else {
            deferred.reject(new Error(err));
        }

        return deferred.promise;
    }


    /**
     * Internal utility method that will tell me if the date from the existing log file matches todays Date
     * @param d1 1st date to compare
     * @param d2 2nd date to compare
     * @returns {boolean}
     */
    function logDatesMatch(d1, d2){
        return ((d1.getFullYear()==d2.getFullYear())&&(d1.getMonth()==d2.getMonth())&&(d1.getDate()==d2.getDate()));
    }

    /**
     * Method that will take the passed in logPath and recreate the path with a modified file name. So if a file
     * was modified on a previous day and a new log is coming in on the current day, then we want to rename the
     * old log file with the date in the name.
     * @param logPath Path of current log file
     * @param modifiedDate Last file modified date
     * @returns {string} New file path for previous log
     */
    function createRotatedLogName(logPath, modifiedDate){
        var logName = logPath,
            suffixIdx = logPath.indexOf('.'),
            suffix = '';

        if(suffixIdx > -1){
            suffix = logName.substr(suffixIdx, logName.length);
            logName = logName.replace(suffix, ("." + modifiedDate.getFullYear() + "-" + (modifiedDate.getMonth() + 1) + "-" + modifiedDate.getDate()) + suffix);
        }
        else {
            logName = logName + ("." + modifiedDate.getFullYear() + "-" + (modifiedDate.getMonth() + 1) + "-" + modifiedDate.getDate());
        }

        return logName;
    }

    /**
     * Method will look at the stats of a file and if it was modified on a date that was not today then it will
     * rename it to it's modfied date so we can start fresh daily.
     * @param stats Stats of a file
     * @returns {string} Status of rotation ('datematches' - do nothing, 'logrotated' - change detected rename file)
     */
    function rotateLogs(stats){
        var deferred = Q.defer(),
            today = new Date(),
            modifiedDate = new Date(stats.mtime),
            archivedFileName = createRotatedLogName(logger.config.path, modifiedDate);

        if(logDatesMatch(today, modifiedDate)){
            return 'datematches';
        }
        else {
            console.log("Log file modified previous to today, archiving to: " + archivedFileName);
            fs.rename(logger.config.path, archivedFileName, function(err){
                if (err) {
                    deferred.reject(new Error(err));
                } else {
                    deferred.resolve('logrotated');
                }
            });
        }

        return deferred.promise;
    }

    /**
     * Method will create a log file with the passed in name without any content.
     * @returns {*}
     */
    function createEmptyFile(){
        var deferred = Q.defer();

        fs.writeFile(logger.config.path, '', function(err){
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve('success');
            }
        });

        return deferred.promise;
    }



    /**
     * The init function should be called at the beginning of the object life cycle. This method will be responsible
     * for doing all of the setup for the adapter.
     *
     * @param config Object that will contain the path to write the log file and the type of adapter.
     */
    logger.init = function(config){

        //Error early if mandatory properties not present.
        if(config.type !== 'file'){
            throw new Error("Incorrect adapter type. Not set to type of 'file'.");
        }

        this.config = config;
    };

    logger.write = function(namespace, category, type, msg, cb){
        /* When writing to a log we do the following
            - Check the date modified of the current log file, if it is the same day do nothing. If it is different then rename it and create an empty file with the same name.
            - Write the log entry to the file
        */

        // Load or create file


        Q.fcall(getOrCreateFile)
            .fail(function(err){
                console.log('ERROR: Could not write to log.');
            })
            .then(function(stats){

                if(stats === null) { return null; }

                return rotateLogs(stats);

            })
            .then(function(logRotation){

                if(logRotation === null) { return null; }

                if(logRotation === 'logrotated'){
                    createEmptyFile();
                }

                return true;
            })
            .then(function(writeToLog){
                if(writeToLog){
                    console.log('Everything passed. Write to log');
                }
            })
            .done(function(result){
                //We should return back a bool if this is successfull or not.
                cb.call(this, (result !== null));
            });

    };

    // AMD / RequireJS
    if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return logger;
        });
    }
    // Node.js
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = logger;
    }
    // included directly via <script> tag
    else {
        root.logger = logger;
    }
})();