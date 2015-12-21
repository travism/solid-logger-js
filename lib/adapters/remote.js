'use strict';

var Logger = require('./base'),
    _ = require('lodash'),
    resources = require('../resources'),
    verbs = [
        'GET'
    ];

module.exports = {
    init: init
};

RemoteLogger.prototype = new Logger();

_.extend(RemoteLogger.prototype, {
    validateConfig: validateConfig
});

function init() {
    var logger = new RemoteLogger(config);
    logger.validateConfig();
    return logger;
}

function RemoteLogger(config) {
    this.config = config;
}

function validateConfig() {

    if (!this.config.type) {
        throw new Error(resources.errors.missingType);
    }
    if (this.config.type.toLowerCase() !== 'remote') {
        throw new Error(resources.errors.incorrectAdapterType);
    }
    if (-1 === _.indexOf(verbs, this.config.verb)) {
        throw new Error(resources.errors.missingVerb);
    }
}