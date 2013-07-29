
(function(){
    "use strict";

    var logger = {};
    var root = this;

    logger.config = {};
    logger.init = function(config){
        this.config = config;
    };

    logger.getConfig = function(){
        return this.config;
    };

    logger.write = function(msg){

    };

    logger.error = function(msg){

    };

    logger.debug = function(msg){

    };

    logger.warn = function(msg){

    };

    logger.trace = function(msg){

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