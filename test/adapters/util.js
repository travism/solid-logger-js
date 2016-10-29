'use strict';

module.exports = {
    log: log
};

function log(logger) {
    logger.debug('FILE_INIT_EXAMPLE', 'DOES THIS SHOW UP?');
    logger.debug('MYLABEL', 'test', {obj: { obj1: 'test', obj2: [1,1,2,3] }}, ['a', 'b', 'c', 'd']);
    logger.error('FILE_INIT_EXAMPLE', new Error('DOES THIS SHOW UP?'));
    logger.warn('FILE_INIT_EXAMPLE', 'DOES THIS SHOW UP?');
    logger.info('FILE_INIT_EXAMPLE', 'DOES THIS SHOW UP?');
    logger.trace('FILE_INIT_EXAMPLE', 'DOES THIS SHOW UP?');
    logger.trace('DOES THIS SHOW UP WITHOUT BRACKETS?');
    logger.trace({message: 'This is my error message', code: 400});
    logger.info(JSON.stringify({message: 'This is my error message', code: 400},null,1));
}
