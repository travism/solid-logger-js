'use strict';

var logger = require('../../lib/solid-logger').init({
    adapters: [{
        type: 'console',
        application: 'grasshopper-api',
        machine: 'dev-server'
    }]
});

require('chai').should();

describe('Testing Solid Logger - BASE', function () {

    describe('createEntry', function () {

        describe('from a string', function() {

            it('should create a correctly formatted entry without category', function() {
                var message = getMessage(),
                    adapter = logger.adapters[0],
                    entry = adapter.createEntry('the type', message).call(adapter);

                removeTimestamp(entry).should.equal('[GRASSHOPPER-API][DEV-SERVER][THE TYPE] ' + getMessage());
            });

            it('should create a correctly formatted entry with a category', function() {
                var message = getMessage(),
                    adapter = logger.adapters[0],
                    entry = adapter.createEntry('the type', 'the category', message).call(adapter);

                removeTimestamp(entry).should.equal(
                    '[GRASSHOPPER-API][DEV-SERVER][THE TYPE][THE CATEGORY] ' + getMessage());
            });

            it('should create a correctly formatted entry with prettified JSON', function() {
                var adapter = logger.adapters[0],
                    entry = adapter.createEntry('the type', JSON.stringify({one:'two'},null,4)).call(adapter);

                removeTimestamp(entry).should.equal('[GRASSHOPPER-API][DEV-SERVER][THE TYPE] ' +
                '{\n' +
                '    "one": "two"\n' +
                '}');
            });
        });

        describe('from an object', function() {

            describe('should create a correctly formatted entry from', function() {

                it('a nested object', function() {
                    var adapter = logger.adapters[0],
                        entry = adapter.createEntry('debug', {
                            one : 'two',
                            three : {
                                four : 'five'
                            }
                        }).call(adapter);

                    removeTimestamp(entry).should.equal("[GRASSHOPPER-API][DEV-SERVER][DEBUG] { one: 'two', three: { four: 'five' } }"); // jshint ignore:line
                });

                it('undefined', function() {
                    var adapter = logger.adapters[0],
                        entry = adapter.createEntry('debug', undefined).call(adapter);

                    removeTimestamp(entry).should.equal('[GRASSHOPPER-API][DEV-SERVER][DEBUG] undefined');
                });

                it('a cyclical reference', function() {
                    var adapter = logger.adapters[0],
                        a = {},
                        b = {
                            a : a
                        },
                        entry;

                    a.b = b;
                    entry = adapter.createEntry('debug', a).call(adapter);

                    removeTimestamp(entry).should.equal("[GRASSHOPPER-API][DEV-SERVER][DEBUG] { b: { a: [Circular] } }"); // jshint ignore:line
                });
            });
        });

        describe('from an error', function() {

            it('should create a correctly formatted entry', function() {
                var adapter = logger.adapters[0],
                    entry = adapter.createEntry('debug', new Error('Oopsy doopsy!')).call(adapter);

                removeTimestamp(entry).should.equal('[GRASSHOPPER-API][DEV-SERVER][DEBUG] [Error: Oopsy doopsy!]');
            });
        });
    });
});

function getMessage() {
    return 'This is ?~!@#$%^&*() a message.';
}

function removeTimestamp(entry) {
    return entry.slice(entry.indexOf(']') + 1);
}