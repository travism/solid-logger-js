(function(){
    "use strict";

    var logger = {},
        fs = require('fs'),
        Q = require('Q');

    logger.config = {};


    function handleStatsError(err){

        var deferred = Q.defer();

        console.log('ERROR:handleStatsError');

        if(err.message == '34'){

            console.log('Log file does not exist. Try to create. at: ' + logger.config.path);

            Q.fcall(createLogFile)
                .fail(function(err){

                    console.log('Could not create log file.');
                    console.log(err);

                    deferred.reject(new Error(err));
                })
                .then(getFileStats)
                .done(function(stats){
                    console.log("Log file created.");
                    deferred.resolve(stats);
                });
        }

        return deferred.promise;
    }

    function logPrepare(){
        var deferred = Q.defer();

        Q.fcall(getFileStats)
            .fail(handleStatsError)
            .then(migrateLog)
            .then(function(stats){
                deferred.resolve(stats);
            });

        return deferred.promise;
    }

    function migrateLog(stats){
        var deferred = Q.defer(),
            today = new Date(),
            modifiedDate = new Date(stats.mtime);

        console.log(modifiedDate);
        return deferred.promise;
    }

    function createLogFile(){
        var deferred = Q.defer();

        fs.writeFile(logger.config.path, '', function(err){
            if(err){
                deferred.reject(new Error(err));
            }
            else {
                deferred.resolve('success');
            }
        });

        return deferred.promise;
    }

    function getFileStat(){
        var deferred = Q.defer();

        fs.stat(logger.config.path, function(err, stats){
            if (err) {
                //34 means file is not found
                if(err.errno === 34){

                    fs.writeFile(logger.config.path, '', function(err){
                        fs.stat(logger.config.path, function(err, stats){
                            deferred.resolve(stats);
                        });
                    });
                }
                else{
                    deferred.reject(new Error(err));
                }
            } else {
                deferred.resolve(stats);
            }
        });

        return deferred.promise;
    }

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

    function validateAndFixLogfile(){

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

        Q.fcall(logPrepare)
            .fail(function(err){
                console.log('error');
            })
            .then(function(b){
                console.log(b);
            });
//        fs.writeFile('log.txt', 'Hello Node', function (err) {
//            if (err) throw err;
//            console.log('It\'s saved!');
//        });

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