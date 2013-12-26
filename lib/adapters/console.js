(function(){
    "use strict";

    var logger = {},
        fs = require('fs'),
        Q = require('q'),
        colors = require('colors');

    logger.config = {};



    /**
     * Before we try to do any file operations we need to validate if the configuration is complete so that our logs
     * are useful.
     * @returns {boolean}
     */
    function validateConfig(){

        if(!logger.config.type){
            throw new Error("'type' property not set, to use the file adapter the adapter 'type' should be set to 'file'.");
        }
        else if(logger.config.type.toLowerCase() != 'console'){
            throw new Error("Incorrect adapter type. Not set to type of 'console'.");
        }
        else if(!logger.config.application){
            throw new Error("'application' property not set, All log entries shold be mapped to an 'application.' Since multiple apps could potentially log to the same output stream.");
        }
        else if(!logger.config.machine){
            throw new Error("'machine' property not set, All log entries shold be mapped to a 'machine' that they took place on. Since apps can be distributed and synced to the cloud we need to know which box this log took place on.");
        }

        return true;
    }


    function decorate(message, type){
        var decoratedMessage = message;
        switch (type){
            case "debug":
                decoratedMessage = message.magenta.italic;
                break;
            case "trace":
                decoratedMessage = message.grey.italic;
                break;
            case "warn":
                decoratedMessage = message.yellow;
                break;
            case "info":
                decoratedMessage = message.cyan;
                break;
            case "error":
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
            timeStamp = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear() + ' ' + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + ":" + now.getMilliseconds(),
            entry = '[' + timeStamp + '][' + logger.config.application.toUpperCase() + '][' + logger.config.machine.toUpperCase() + '][' + type.toUpperCase() + '][' + category + '] ' + message;

        console.log(decorate(entry, type));

        deferred.resolve("Success");

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
    };

    logger.write = function(type, category, message, cb){
        var deferred = Q.defer();

        Q.fcall(validateConfig)
            .then(function(valid){

                if(!valid) {
                    console.log(valid);
                    throw new Error("Config not valid");
                }

                return write(type, category,message);

            })
            .fail(function(err){
                console.log('ERROR: Could not write log.');
                console.log(err);
            })
            .done(function(result){
                cb.call(this, (result != null));
                deferred.resolve('success');
            });

        return deferred.promise;
    };

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = logger;
    }

})();
