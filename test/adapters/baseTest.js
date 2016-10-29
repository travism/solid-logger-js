'use strict';

var Logger = require('../../lib/solid-logger'),
    logger = Logger.init({
    adapters: [{
        type: 'console',
        application: 'grasshopper-api',
        machine: 'dev-server'
    }]
});

require('chai').should();

describe('Testing Solid Logger - BASE', function () {

    describe('method calls', function() {
        it('logger.error', function(done) {
            Logger.init({
                adapters: [{
                    type: 'callback',
                    application: 'grasshopper-api',
                    machine: 'dev-server',
                    callback: function (log) {
                        log.message.should.equal('some message');
                        done();
                    }
                }]
            }).error('some message');
        });
        it('logger.error', function (done) {
            Logger.init({
                adapters: [{
                    type: 'callback',
                    application: 'grasshopper-api',
                    machine: 'dev-server',
                    callback: function (log) {
                        log.message.should.equal('some message');
                        done();
                    }
                }]
            }).error('some message');
        });
        it('logger.info', function (done) {
            Logger.init({
                adapters: [{
                    type: 'callback',
                    application: 'grasshopper-api',
                    machine: 'dev-server',
                    callback: function (log) {
                        log.message.should.equal('some message');
                        done();
                    }
                }]
            }).info('some message');
        });
        it('logger.debug', function (done) {
            Logger.init({
                adapters: [{
                    type: 'callback',
                    application: 'grasshopper-api',
                    machine: 'dev-server',
                    callback: function (log) {
                        log.message.should.equal('some message');
                        done();
                    }
                }]
            }).debug('some message');
        });
        it('logger.warn', function (done) {
            Logger.init({
                adapters: [{
                    type: 'callback',
                    application: 'grasshopper-api',
                    machine: 'dev-server',
                    callback: function (log) {
                        log.message.should.equal('some message');
                        done();
                    }
                }]
            }).warn('some message');
        });
        it('logger.trace', function (done) {
            Logger.init({
                adapters: [{
                    type: 'callback',
                    application: 'grasshopper-api',
                    machine: 'dev-server',
                    callback: function (log) {
                        log.message.should.equal('some message');
                        done();
                    }
                }]
            }).trace('some message');
        });
        it('logger.critical', function (done) {
            Logger.init({
                adapters: [{
                    type: 'callback',
                    application: 'grasshopper-api',
                    machine: 'dev-server',
                    callback: function (log) {
                        log.message.should.equal('some message');
                        done();
                    }
                }]
            }).critical('some message');
        });
    });

    describe('createEntry', function () {

        describe('from a string', function() {

            it('should create a correctly formatted entry without category', function() {
                var message = getMessage(),
                    adapter = logger.adapters[0],
                    entry = adapter.createEntry('the type',null,[message]).call(adapter);

                removeTimestamp(entry[0]).should.equal('[GRASSHOPPER-API][DEV-SERVER][THE TYPE]: ' + getMessage());
            });

            it('should create a correctly formatted entry with a category', function() {
                var message = getMessage(),
                    adapter = logger.adapters[0],
                    entry = adapter.createEntry('the type', 'the category', [message]).call(adapter);

                removeTimestamp(entry[0]).should.equal(
                    '[GRASSHOPPER-API][DEV-SERVER][THE TYPE]THE CATEGORY: ' + getMessage());
            });

            it('should create a correctly formatted entry with prettified JSON', function() {
                var adapter = logger.adapters[0],
                    entry = adapter.createEntry('the type',null,[JSON.stringify({one:'two'},null,4)]).call(adapter);

                removeTimestamp(entry[0]).should.equal('[GRASSHOPPER-API][DEV-SERVER][THE TYPE]: ' +
                '{\n' +
                '    "one": "two"\n' +
                '}');
            });
        });

        describe('from an object', function() {

            describe('should create a correctly formatted entry from', function() {

                it('a nested object', function() {
                    var adapter = logger.adapters[0],
                        entry = adapter.createEntry('debug',null,[{
                            one : 'two',
                            three : {
                                four : 'five'
                            }
                        }]).call(adapter);

                    removeTimestamp(entry[0]).should.equal("[GRASSHOPPER-API][DEV-SERVER][DEBUG]: { one: 'two', three: { four: 'five' } }"); // jshint ignore:line
                });

                it('undefined', function() {
                    var adapter = logger.adapters[0],
                        entries = adapter.createEntry('debug',null,[]).call(adapter);

                    entries.length.should.equal(0);
                });

                it('a cyclical reference', function() {
                    var adapter = logger.adapters[0],
                        a = {},
                        b = {
                            a : a
                        },
                        entry;

                    a.b = b;
                    entry = adapter.createEntry('debug',null,[ a]).call(adapter);

                    removeTimestamp(entry[0]).should.equal("[GRASSHOPPER-API][DEV-SERVER][DEBUG]: { b: { a: [Circular] } }"); // jshint ignore:line
                });
            });
        });

        describe('from an error', function() {

            it('should create a correctly formatted entry', function() {
                var adapter = logger.adapters[0],
                    entry = adapter.createEntry('debug',null, [new Error('Oopsy doopsy!')]).call(adapter);

                removeTimestamp(entry[0]).should.equal('[GRASSHOPPER-API][DEV-SERVER][DEBUG]: [Error: Oopsy doopsy!]');
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
