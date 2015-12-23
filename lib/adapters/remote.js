'use strict';

var BB = require('bluebird'),
    Logger = require('./base'),
    _ = require('lodash'),
    resources = require('../resources'),
    superagent = require('superagent'),
    verbs = [
        'GET'
    ];

module.exports = {
    init: init
};

RemoteLogger.prototype = new Logger();

_.extend(RemoteLogger.prototype, {
    validateConfig : validateConfig,
    write : write
});

function init(config) {
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
    if (!this.config.url) {
        throw new Error(resources.errors.missingUrl);
    }
}

function write(type, category, message) {

    console.log('send');
    console.log('send');
    console.log('send');
    console.log('send');
    console.log('send');
    console.log('send');
    console.log('send');
    console.log('send');
    console.log('send');
    console.log('send');
    console.log('send');
    console.log('send');
    console.log('send');
    console.log('send');
    console.log('send');
    console.log('send');
    console.log('send');
    console.log('send');
    return BB.bind(this)
        // TODO: seems like this.createEntry should be calling write
        .then(this.createEntry(type, category, message, false))
        .then(function(entry) {
            return superagent
                .get(this.config.url)
                .query(entry);
        })
        .catch(function(e) {
            console.log('Remote error:', e.message);
        });
}