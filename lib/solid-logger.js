
(function(){
    "use strict";

    var _ = require("underscore"),
        logger = {},
        adapters = {},
        configs = [];

    logger.config = {};


    /**
     * Method will write to the log based off of the configuration values sent in through the tracker. The tracker is
     * a way to handle many operations at the same time.
     * @param tracker Keeps track of what index is currently running for the adapter. For example if you have 2 adapters then you would see something like { idx: 0, length: 2 }
     * @param type error, debug, info, trace, warn
     * @param category User definted category for grouping log entries.
     * @param message Message to be logged.
     */
    function adapterWrite(tracker, type, category, message){
        var config = configs[tracker.idx];

        adapters[config.type].init(config);
        adapters[config.type].write(type, category, message,function(val){
            tracker.idx++;

            if(tracker.idx < tracker.length){
                adapterWrite(tracker, type, category, message);
            }
        });

    }

    /**
     * Local method to load up a write "job". We create a tracker so that the async callbacks stay in order and then we
     * kick off the adapterWrite method which recursively loads the adapters and write per their "write" method. It will
     * also load in the configuration for the adapter each time so you can have the same type of adapters with different
     * settings.
     * @param type error, debug, info, trace, warn
     * @param category User definted category for grouping log entries.
     * @param message Message to be logged.
     */
    function write(type, category, message){
        var tracker = { idx: 0, length: configs.length};
        adapterWrite(tracker, type, category, message);
    }

    /**
     * Public method required to load in all of the configuration info for your adapters.
     * @param config Object for your adapters.
     */
    logger.init = function(config){
        this.config = config;

        _.each(config.adapters, function(adapter){
            if(!adapters[adapter.type]){
                adapters[adapter.type] = require('./adapters/' + adapter.type)
            }

            configs[configs.length] = adapter;
        });
    };

    /**
     * Create a ERROR log entry
     * @param category Categorize your error with a user defined label
     * @param message Include your customized message.
     */
    logger.error = function(category, message){
        write('error', category, message);
    };

    /**
     * Create a INFO log entry
     * @param category Categorize your error with a user defined label
     * @param message Include your customized message.
     */
    logger.info = function(category, message){
        write('info', category, message);
    };

    /**
     * Create a DEBUG log entry
     * @param category Categorize your error with a user defined label
     * @param message Include your customized message.
     */
    logger.debug = function(category, message){
        write('debug', category, message);
    };

    /**
     * Create a WARNING log entry
     * @param category Categorize your error with a user defined label
     * @param message Include your customized message.
     */
    logger.warn = function(category, message){
        write('warn', category, message);
    };

    /**
     * Create a TRACE log entry
     * @param category Categorize your error with a user defined label
     * @param message Include your customized message.
     */
    logger.trace = function(category, message){
        write('trace', category, message);
    };

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = logger;
    }

})();