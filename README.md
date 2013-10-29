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


# What am I?

solid-logger-js is a project that will create logs in a consistant way between your projects. There are a ton of options
when implementing logging in your application. The solid-logger series implements the same tasks across programming
languages. The idea is that logging in node projects is identical to php, ruby, etc.

# Why do you want to use me?

Logging is crucially important and necessary for all applications. If a standard practice is not adopted then each
 team will implement their own way of doing it. Solid logger will not only log to a file, but you can implement
 adapters that will save data to other databases or TO THE CLOUD!!! The API can also act as a gateway to
 present the logs in various ways through a web interface (separate project).


# How can I be made more useful?

If you want to contribute to this project you could add in more adapters for different output types or implement a new
language that uses the same interface and configurations (so that we maintain a consistant feel).

# Methods

* write
* error
* warn
* trace
* debug



# Config

The logger needs to be configured before it is used. This is done by calling the ```init``` method after ```requiring````
the logger.

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


There are a couple of other ways you can configure the module.

* Inline

    var logger = require('solid-logger-js').init({
        adapters: [{
            type: "file",
            path: path.resolve(__dirname, "../") + "/log/grasshopper-api.log",
            application: 'grasshopper-api',
            machine: 'dev-server'
        }]
    });

* With a configuration file

    var logger = require('solid-logger-js').initWithFile("{path to your file}");


# Usage

After you configure your logger, then you can easily call it like:

    logger.debug('Useful Label', 'This is my debugging message.');

It will automatcially write to all of your defined adapters.


# Adapters

* file
* mongodb - coming soon
* couchdb - coming soon

## File

The file adapter will expect the ```type``` set to ```file``` and then a path to a log file.

NOTE: Files are split daily so the file path is used for the current day but then it is archived by date.


