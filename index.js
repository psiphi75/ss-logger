/*********************************************************************
 *                                                                   *
 *   Copyright 2016 Simon M. Werner                                  *
 *                                                                   *
 *   Licensed to the Apache Software Foundation (ASF) under one      *
 *   or more contributor license agreements.  See the NOTICE file    *
 *   distributed with this work for additional information           *
 *   regarding copyright ownership.  The ASF licenses this file      *
 *   to you under the Apache License, Version 2.0 (the               *
 *   "License"); you may not use this file except in compliance      *
 *   with the License.  You may obtain a copy of the License at      *
 *                                                                   *
 *      http://www.apache.org/licenses/LICENSE-2.0                   *
 *                                                                   *
 *   Unless required by applicable law or agreed to in writing,      *
 *   software distributed under the License is distributed on an     *
 *   "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY          *
 *   KIND, either express or implied.  See the License for the       *
 *   specific language governing permissions and limitations         *
 *   under the License.                                              *
 *                                                                   *
 *********************************************************************/

'use strict';
// @flow
/**
 * A super simple JavaScript logger.  It allows labels/tags, custom logging levels, custom output
 * formatting and it's small.  It has no dependancies.
 * @module ss-logger
 * @license Apache-2.0
 * @example
 * // Standard usage
 * const log = require('ss-logger')();
 *
 * log.info('My first info line.');
 * log.warn('You have an object: ', {obj: 'a'});
 * log.error('My first error line.');
 *
 * // Output:
 * // stdout: 2017-03-10T09:44:06.391Z info: My first info line.
 * // stderr: 2017-03-10T09:44:06.396Z error: You have an object: {"obj":"a"}
 * // stderr: 2017-03-10T09:44:06.394Z error: My first error line.
 *
 */

/**
 * The allowed levels.
 * @type {Object}
 * @property {number} error - prints to std::error
 * @property {number} warn - prints to std::error
 * @property {number} info - prints to std::out
 * @property {number} verbose - prints to std::out
 * @property {number} debug - prints to std::out
 * @property {number} silly - prints to std::out
 * @private
 */
const LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
    silly: 5
};


 /**
  * The `ss-logger` module returns `createLogger()` by default.
  *
  * @param  {string} [label]  - The label to print out on lines.  Recommend not to use spaces.
  * @public
  *
  * @example
  * // Each log line can have it's own label / tag.
  *
  * const myFuncLog = require('ss-logger')('MyFunction');
  * const yourMethodLog = require('ss-logger')('YourMethod');
  *
  * myFuncLog.info('My first info line.');
  * yourMethodLog.warn('You have an object: ', {obj: 'a'});
  * yourMethodLog.error('My first error line.');
  *
  * // Output:
  * // stdout: 2017-03-10T09:44:06.391Z info MyFunction: My first info line.
  * // stderr: 2017-03-10T09:44:06.396Z error YourMethod: You have an object: {"obj":"a"}
  * // stderr: 2017-03-10T09:44:06.394Z error YourMethod: My first error line.
  */
 function createLogger(label) {

     /**
      * This will be the logger object that we populate with functions and
      * return to the caller.
      * @typedef Logger
      * @property {Function} setLevel
      * @property {Function} setFormatFunction
      * @property {Object} levels
      * @property {Function} error
      * @property {Function} warn
      * @property {Function} info
      * @property {Function} verbose
      * @property {Function} debug
      * @property {Function} silly
      * @private
      */
     const logger = {
         levels: LEVELS
     };
     let logLevel = LEVELS.info;


     //
     // Set the log output
     //
     let outputFunctions;

     /**
      * By default the `error` and `warn` levels log output to `console.error`, while all other
      * levels log output to `console.log`.
      * @param {Object} output - An object with 'log' and 'error' functions.
      * @throws {Error}
      * @example
      * log.setOutput({
      *     error: myErrorStream
      *     log: myLogStream
      * });
      */
     function setOutput(output) {
         if (!output ||
             typeof output.log !== 'function') {
             throw Error('logger.setOutput: expect an object as the parameter with "log" and "error" properties.');
         }
         outputFunctions = {
             log: output.log,
             error: (typeof output.error === 'function') ? output.error : output.log
         };
     }
     logger.setOutput = setOutput;
     logger.setOutput(console);


     //
     // Create the logging functions
     //

     function joinMsgArgs(msgArgs) {
         return msgArgs.map((arg) => {
             if (typeof arg === 'string') {
                 return arg;
             } else if (typeof arg === 'object') {
                 try {
                     return JSON.stringify(arg);
                 } catch (ex) {
                     return arg.toString();
                 }
             } else {
                 return arg.toString();
             }
         }).join(' ');
     }


     /**
      * The default log formatting.  This can overriden by the user by using
      * `log.setFormatFunction()`.
      *
      * @param  {Date} date        - The date the message was created.
      * @param  {string} level     - The current log level.
      * @param  {string} [fnLabel] - The label that we are logging to.
      * @param  {Array} [msgArgs]  - The multiple message parameters.
      * @returns {string}          - The formatted message to print.
      * @private
      */
     let format = function format(date, level, fnLabel, msgArgs) {
         const l = (fnLabel === null || fnLabel === undefined) ? '' : ` ${fnLabel}`;
         return `${date.toISOString()} ${level}${l}: ${joinMsgArgs(msgArgs)}`;
     };


     /**
      * Create the log for writing.
      * @param  {string} levelName - The name of the level to log at.
      * @param  {...*} varArgs     - The parameters of the original log.
      * @private
      */
      function writeLog(levelName, varArgs) {       // eslint-disable-line no-unused-vars

          const args = [].slice.call(arguments);
          args.splice(0, 1);

          const str = format(new Date(), levelName, label, args);
          if (LEVELS[levelName] <= LEVELS.warn) {
              outputFunctions.error(str);
          } else {
              outputFunctions.log(str);
          }
      }


     /**
      * Override the default format function.  Must supply a function to handle the following
      * parameters (date, level, fnLabel, ...msgArgs).
      * @param {Function} newFormatFunction - The new function to do the formatting of the output.
      * @throws {Error}
      * @example
      * log.setFormatFunction(function (date, level, label, ...msgArgs) {
      *      return `${level.toUpperCase()} ${date.getTime()} ${msgArgs.toString()}`;
      * });
      * log.info('Another info line.');
      *
      * // Output:
      * // stdout: INFO 1489198884388 Another info line.
      */
     function setFormatFunction(newFormatFunction) {

         if (typeof newFormatFunction !== 'function') {
             throw Error('logger.setFormatFunction: expect a function as parameter.');
         }
         format = newFormatFunction;
     }
     logger.setFormatFunction = setFormatFunction;


     //
     // Set the log level
     //

     let DEBUG;
     if (typeof process === 'object' && typeof process.env === 'object') {
         DEBUG = process.env.DEBUG;
     }
     if (DEBUG === '*') {
         logLevel = LEVELS.debug;
     } else if (DEBUG === label && label) {
         logLevel = LEVELS.debug;
     }

     /**
      * Set the log level of the logger.  Anything equal to or below this level
      * will be output.  The default level is `info`. The available log levels are:
      *    - error
      *    - warn
      *    - info
      *    - verbose
      *    - debug
      *    - silly
      * @param {number} newLogLevel - The new level.
      * @throws {Error}
      *
      * @example
      * log.setLevel(log.levels.error);
      *
      * log.debug('This happened!');
      * log.info('My first info line.');
      * log.warn('You have an object: ', {obj: 'a'});
      * log.error('My second error line.');
      *
      * // Output:
      * // stderr: 2017-03-10T09:44:06.394Z error: My second error line.
      */
     function setLevel(newLogLevel) {
         if (isNaN(newLogLevel) || newLogLevel < 0 || newLogLevel > LEVELS.silly) {
             throw Error(`setLevel(): invalid level: ${newLogLevel}`);
         }

         logLevel = newLogLevel;
         Object.keys(LEVELS).forEach((levelName, levelIndex) => {
             if (levelIndex <= logLevel) {
                 logger[levelName] = function logit() {
                     const msgArgs = [levelName].concat([].slice.call(arguments));
                     writeLog.apply(writeLog, msgArgs);
                 };
             } else {
                 logger[levelName] = () => {};
             }

         });
     }
     setLevel(logLevel);
     logger.setLevel = setLevel;

     return logger;

}

createLogger.levels = LEVELS;
module.exports = createLogger;

/**
 * ## Set debug log level from console
 *
 * From the terminal:
 * ```sh
 * DEBUG=MyFunction node app.js
 * ```
 *
 * **Note**: you can also use the following to enable debugging for all output:
 *   `DEBUG=* node app.js`
 *
 * ```JavaScript
 * // app.js
 *
 * const myFuncLog = require('ss-logger')('MyFunction');
 * const yourMethodLog = require('ss-logger')('YourMethod');
 *
 * myFuncLog.debug('My debug message.');
 * yourMethodLog.debug('Your debug message');
 *
 * // Output:
 * // stdout: 2017-03-10T09:44:06.391Z info MyFunction: My debug message.
 * ```
 */
