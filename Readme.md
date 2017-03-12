# Super Simple JavaScript logger

A super simple JavaScript logger.  It allows labels/tags, custom logging levels, custom output
formatting and it's small.  It has no dependancies.

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

The default log level is `info`.  The available log levels:
 - error
 - warn
 - info
 - verbose
 - debug
 - silly

```JavaScript
log.setLevel(log.levels.error);

log.debug('This happened!');
log.info('My first info line.');
log.warn('You have an object: ', {obj: 'a'});
log.error('My second error line.');

// Output:
// stderr: 2017-03-10T09:44:06.394Z error: My second error line.
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
// stdout: 2017-03-10T09:44:06.391Z info MyFunction: My debug message.
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

## Set the output stream

By default the `error` and `warn` levels log output to `console.error`, while all other levels log
output to `console.log`.

You can change the output using the following command.

```JavaScript
log.setOutput({
    error: myErrorStream
    log: myLogStream
});
```


## License

Copyright 2017 Simon M. Werner

Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements.  See the NOTICE file distributed with this work for additional information regarding copyright ownership.  The ASF licenses this file to you under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at

  [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the specific language governing permissions and limitations under the License.
