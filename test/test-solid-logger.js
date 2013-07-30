var logger = require('../lib/solid-logger'),
    fileAdapter = require('../lib/adapters/file.js'),
    testDirectory = __dirname,
    libDirectory  = testDirectory.substr(0, testDirectory.indexOf('/test'));

logger.init({
    namespace: "test",
    adapters: [{
        type: "file",
        path: libDirectory + "../log/test.log"
    }]
});

fileAdapter.init({
    type: "file",
    path: libDirectory + "/log/test.log"
});

fileAdapter.write('test-namespace', 'category', 'type', 'mgs', function(result){
    console.log('finished result');
    console.log(result);

});


//console.log(logger.getConfig());