'use strict';

var _ = require('lodash');

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
 * @returns {Function|promise|promise|Q.promise}
 */
function createEntry(type, category, message){
    return function() {
        var timeStamp = getTimestamp(),
            entry = '[' + timeStamp + ']' +

                    // TODO: config should be upper cased on load, so we don't keep doing it again and again
                '[' + this.config.application.toUpperCase() + ']' +
                '[' + this.config.machine.toUpperCase() + ']' +
                '[' + type.toUpperCase() + ']';

        if(!message){
            entry = entry + ' ' + JSON.stringify(category);
        }
        else {
            entry = entry + '[' + category + '] ' + JSON.stringify(message);
        }

        return entry;
    };
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