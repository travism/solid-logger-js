var logger = require('../lib/solid-logger');

module.exports = {
    run : run
};

function run() {
    var start = Date.now();

    logger.init({
        adapters: [{
            type: 'console',
            application: 'grasshopper-api',
            machine: 'dev-server'
        }]
    });

    setInterval(reportMemory, 0);

    function reportMemory() {
        var heap = process.memoryUsage().heapUsed / (1024 * 1024);
        var memPerSecond = heap / (Date.now() - start) * 1000;
        logger.debug(heap.toFixed(2) + 'mb (' + memPerSecond.toFixed(2) + 'mb/s) \r');
    }
}
