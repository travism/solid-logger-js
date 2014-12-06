    ___________________________________
    __  ___/_  __ \__  /____  _/__  __ \
    _____ \_  / / /_  /  __  / __  / / /
    ____/ // /_/ /_  /____/ /  _  /_/ /
    /____/ \____/ /_____/___/  /_____/

    ______ ________________________________________                ________________
    ___  / __  __ \_  ____/_  ____/__  ____/__  __ \               ______  /_  ___/
    __  /  _  / / /  / __ _  / __ __  __/  __  /_/ /  ________     ___ _  /_____ \
    _  /___/ /_/ // /_/ / / /_/ / _  /___  _  _, _/   _/_____/     / /_/ / ____/ /
    /_____/\____/ \____/  \____/  /_____/  /_/ |_|                 \____/  /____/


[![Build Status](https://travis-ci.org/travism/solid-logger-js.png?branch=master)](https://travis-ci.org/travism/solid-logger-js)

## What am I?

solid-logger-js is a project that will create logs in a consistent way between your projects. There are a ton of options
when implementing logging in your application. The solid-logger series implements the same tasks across programming
languages. The idea is that logging in node projects is identical to php, ruby, etc.

## Features

* Customizable, just push your custom adapter on:

    ```javascript
    var Logger =
    ```
* Handles logging objects
* Handles circular references
* Handles logging Errors
* Built in Console adapter with colors
* Built in File adapter with day based log rotation
* Built in Loggly adapter
* Customizable - just push your own adapter on:

    ```javascript
    var logger = require('solid-logger-js').init();

    logger.adapters.push(myCustomAdapter);

    // The adapter should do the desired behavior when it is called with adapter.write(type, category, message)
    // The adapter should return a Bluebird promise that is resolved when the work is done
    ```

## Why do you want to use me?

Logging is crucially important and necessary for all applications. If a standard practice is not adopted then each
 team will implement their own way of doing it. Solid logger will not only log to a file, but you can implement
 adapters that will save data to other databases or to the cloud. The API can also act as a gateway to
 present the logs in various ways through a web interface (separate project).

## How can I be made more useful?

If you want to contribute to this project you could add in more adapters for different output types or implement a new
language that uses the same interface and configurations (so that we maintain a consistant feel).

## Methods

* write
* error
* warn
* trace
* debug

## Config

The logger needs to be configured before it is used. This is done by calling the `init` method after requiring
the logger.

```javascript
var logger = require('solid-logger-js');

logger.init({
    adapters: [{
        type: "file",
        path: path.resolve(__dirname, "../") + "/log/grasshopper-api.log",
        application: 'grasshopper-api',
        machine: 'dev-server'
    },{
             type: "file",
             path: /your/full/path/log/backup-test.log",
             application: 'grasshopper-api',
             machine: 'dev-server'
    }]
});
```

There are a couple of other ways you can configure the module.

### Inline

```javascript
var logger = require('solid-logger-js').init({
    adapters: [{
        type: "file",
        path: path.resolve(__dirname, "../") + "/log/grasshopper-api.log",
        application: 'grasshopper-api',
        machine: 'dev-server'
    }]
});
```

### With a configuration file

    ```javascript
    var logger = require('solid-logger-js').initWithFile("{path to your file}");
    ```

## Usage

After you configure your logger, then you can easily call it like:

```javascript
logger.debug('Useful Label', 'This is my debugging message.');
```

It will automatcially write to all of your defined adapters.


## Adapters

* file
* console
* loggly

------------------------------------------------------------------------------------------------------------------------

### File

The file adapter will expect the `type` set to `file` and then a path to a log file.

```javascript
{
    type: "file",
    path: path.resolve("./log/test.log"),
    application: 'grasshopper-api',
    machine: 'dev-server'
}
```

NOTE: Files are split daily so the file path is used for the current day but then it is archived by date.

------------------------------------------------------------------------------------------------------------------------

### Console

The console adapter will expect the `type` set to `console`.

```javascript
{
    type: "console",
    application: 'grasshopper-api',
    machine: 'dev-server'
}
```

### Loggly

Loggly is a popular cloud-based log management service. http://loggly.com

The loggly adapter will expect the `type` set to `loggly`.

```javascript
{
    type: "loggly",
    application: "grasshopper-api",
    machine: "dev-server",
    token: "loggly token",
    domain: "website url",
    auth: {
        username: "",
        password: ""
    }
}
```
