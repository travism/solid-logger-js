'use strict';

var _ = require('lodash'),
    util = require('util'),

    STRING = 'string';

module.exports = Logger;

_.extend(Logger.prototype, {
    createEntry: createEntry
});

function Logger() {}

/**
 * Internal method to append our log entry to a file.
 * @param type Type of entry (debug, info, error, warn, trace)
 * @param category User defined label for the entry
 * @param message Message to be written to file system.
 * @param stringify Whether to return a string or an object - to return an object send in false
 * @returns {Function|promise|promise|Q.promise}
 */
function createEntry(type, category, messages, stringify){
    return function() {
        var timeStamp = getTimestamp(),
            // TODO: config should be upper cased on load, so we don't keep doing it again and again
            application = this.config.application.toUpperCase(),
            machine = this.config.machine.toUpperCase(),
            entries = [];

        type = type.toUpperCase();
        category = getCategory(category);

        _.each(messages, function(message){
            var entry;

            message = getMessage(message);

            if (false !== stringify) {
                category = category ? `${ category }` : '';
                entry = `[${ timeStamp }][${ application }][${ machine }][${ type }]${ category }: ${ message }`;
            } else {
                entry = {
                    // do all lower case for simplicity
                    timestamp : timeStamp,
                    application : application,
                    machine : machine,
                    type : type,
                    message : message
                };

                if (!!category) {
                    entry.category = category;
                }
            }

            entries.push(entry);
        });

        return entries;
    };
}

function getCategory(category) {
    return category ? category.toUpperCase() : '';
}

function getMessage(message) {
    if (STRING === typeof message) {
        return message;
    }

    return util.inspect(message, {depth: null});
}

function getTimestamp() {
    var now = new Date();

    return (now.getMonth() + 1) +
        '/' + now.getDate() +
        '/' + now.getFullYear() +
        ' ' + now.getHours() +
        ':' + now.getMinutes() +
        ':' + now.getSeconds() +
        ':' + now.getMilliseconds();
}
