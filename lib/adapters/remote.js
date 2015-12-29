'use strict';

var BB = require('bluebird'),
    Logger = require('./base'),
    _ = require('lodash'),
    resources = require('../resources'),
    superagent = BB.promisifyAll(require('superagent')),
    verbs = [
        'GET', 'POST'
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
    this.config.verb = this.config.verb.toLowerCase();

    if (!this.config.url) {
        throw new Error(resources.errors.missingUrl);
    }
    this.config.headers = this.config.headers || {};
}

function write(type, category, message) {

    return BB.bind(this)
        // TODO: seems like this.createEntry should be calling write
        .then(this.createEntry(type, category, message, false))
        .then(function(entry) {
            var request = superagent[this.config.verb](this.config.url);

            switch (this.config.verb) {
                case 'get':
                    request.query(entry);
                    break;
                case 'post':
                    request.send(entry);
                    break;
            }

            _.forEach(this.config.headers, function(headerValue, headerKey) {
                request.set(headerKey, headerValue);
            });

            return request.end();
        })
        .catch(function(e) {
            console.log('Remote error:', e.message);
        });
}