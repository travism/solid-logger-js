var logger = require('../lib/solid-logger');

logger.init({
    namespace: "test",
    adapters: [{
        type: "file",
        path: "../log/test.log"
    }]
});

console.log(logger.getConfig());