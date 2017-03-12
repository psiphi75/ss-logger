# Super Simple JavaScript logger

A super simple JavaScript logger.  It allows labels/tags, custom logging levels, custom output formatting and it's small.

## Usage

```JavaScript
const log = require('ss-logger')();

log.info('My first info line.');
log.warn('You have an object: ', {obj: 'a'});
log.error('My first error line.');

// Output:
// stdout: 2017-03-10T09:44:06.391Z info: My first info line.
// stderr: 2017-03-10T09:44:06.396Z error: You have an object: {"obj":"a"}
// stderr: 2017-03-10T09:44:06.394Z error: My first error line.
```


## Set the log level

The default log level is `info`.

```JavaScript
log.setLevel(log.levels.error);

log.debug('This happened!');
log.info('My first info line.');
log.warn('You have an object: ', {obj: 'a'});
log.error('My first error line.');

// Output:
// stderr: 2017-03-10T09:44:06.394Z error: My first error line.
```

## Set the label

Each log line can have it's own label / tag.

```JavaScript
const myFuncLog = require('ss-logger')('MyFunction');
const yourMethodLog = require('ss-logger')('YourMethod');

myFuncLog.info('My first info line.');
yourMethodLog.warn('You have an object: ', {obj: 'a'});
yourMethodLog.error('My first error line.');

// Output:
// stdout: 2017-03-10T09:44:06.391Z info MyFunction: My first info line.
// stderr: 2017-03-10T09:44:06.396Z error YourMethod: You have an object: {"obj":"a"}
// stderr: 2017-03-10T09:44:06.394Z error YourMethod: My first error line.
```

## Set debug log level from console

```sh
DEBUG=MyFunction node app.js
```

**Note:** you can also use the following to enable debugging for all output: `DEBUG=* node app.js`

```JavaScript
// app.js

const myFuncLog = require('ss-logger')('MyFunction');
const yourMethodLog = require('ss-logger')('YourMethod');

myFuncLog.debug('My debug message.');
yourMethodLog.debug('Your debug message');

// Output:
// stdout: 2017-03-10T09:44:06.391Z info MyFunction: My first info line.
```

## Set the output format

```JavaScript
log.setFormatFunction(function (date, level, label) {
    const msgArgs = [].slice.call(arguments);
    msgArgs.splice(0, 3);
    return `${level.toUpperCase()} ${date.getTime()} ${msgArgs.toString()}`;
});
log.info('Another info line.');

// Output:
// stdout: INFO 1489198884388 Another info line.
```
