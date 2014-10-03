module.exports = (function(){
    'use strict';

    var logger = {},
        Q = require('q'),
        loggly = require('loggly'),
        resources = require('../resources'),
        client = null;

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
        else if(logger.config.type.toLowerCase() !== 'loggly'){
            throw new Error(resources.errors.incorrectAdapterType);
        }
        else if(!logger.config.application){
            throw new Error(resources.errors.missingApplication);
        }
        else if(!logger.config.machine){
            throw new Error(resources.errors.missingMachine);
        }
        else if(!logger.config.token){
            throw new Error(resources.errors.missingToken);
        }

        return true;
    }

    /**
     * Internale method to append our log entry to loggly.
     * @param type Type of entry (debug, info, error, warn, trace)
     * @param category User defined label for the entry
     * @param message Message to be written to file system.
     * @returns {Function|promise|promise|Q.promise}
     */
    function write(type, category, message){
        var deferred = Q.defer();

        client.log(message, [type, category], function(err, res){
            console.log(err, res);
        });

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

        client = loggly.createClient({
            token: config.token,
            subdomain: config.application,
            auth: config.auth,
            tags: [config.domain, config.machine],
            json: true
        });
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

    return logger;

})();
