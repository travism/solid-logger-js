'use strict';

var Logger = require('../../lib/solid-logger'),
    util = require('./util'),
    _ = require('lodash');

require('chai').should();

describe('Testing Solid Logger - Callback', function () {

    it('should return a valid logger object', function () {
        var logger = Logger.init({
            adapters: [{
                type: 'callback',
                application: 'testo',
                machine: 'resto',
                callback: function (msg) { }
            }]
        });

        logger.should.be.a('object');
    });

    it('should be able to instantiate to distinct loggers', function (done) {
        var logger1 = Logger.init({
                adapters: [{
                    type: 'callback',
                    application: 'logger1',
                    machine: 'staging',
                    callback: callback1
                }]
            }),
            logger2 = Logger.init({
                adapters: [{
                    type: 'callback',
                    application: 'logger2',
                    machine: 'staging',
                    callback: callback2
                }]
            }),
            logger3 = Logger.init({
                adapters: [{
                    type: 'callback',
                    application: 'logger3',
                    machine: 'staging',
                    callback: callback3
                }]
            }),
            doneOne = _.after(5, done);


        logger1.debug('test1');
        logger2.debug('test2');
        logger1.debug('test1');
        logger2.debug('test2');
        logger3.debug('MYCAT', 'test3', 'test4');

        function callback1(msg) {
            msg.application.should.equal('LOGGER1');
            doneOne();
        }

        function callback2(msg) {
            msg.application.should.equal('LOGGER2');
            doneOne();
        }

        function callback3(msgs){
            msgs[0].message.should.equal('test3');
            msgs[1].message.should.equal('test4');
            doneOne();
        }
    });

});
