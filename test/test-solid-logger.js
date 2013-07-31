var logger = require('../lib/solid-logger'),
    testDirectory = __dirname,
    libDirectory  = testDirectory.substr(0, testDirectory.indexOf('/test'));

logger.init({
    adapters: [{
        type: "file",
        path: libDirectory + "/log/test.log",
        application: 'grasshopper-api',
        machine: 'dev-server'
    },{
            type: "file",
            path: libDirectory + "/log/backup-test.log",
            application: 'grasshopper-api',
            machine: 'dev-server'
    }]
});

logger.debug('MYSCOPE', 'This is my debugging message.');