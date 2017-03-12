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
 * Create a new instance of of the logger.
 * @param  {string} [label]  - The label to print out on lines.  Recommend not
 *                             to use spaces.
 * @returns {Logger}         - The logger that can be used.
 */
 function createLogger(label) {

     /** @type {Logger|*} */
     const logger = {
         levels: LEVELS
     };
     let logLevel = LEVELS.info;


     //
     // Set the log output
     //
     let outputFunctions;

     /**
      * Set the output logger.  The default is console.log and console.error.
      * @param {Object} output - An object with 'log' and 'error' functions.
      * @throws
      */
     logger.setOutput = function setOutput(output) {

         if (!output ||
             typeof output.log !== 'function') {
             throw Error('logger.setOutput: expect an object as the parameter with "log" and "error" properties.');
         }
         outputFunctions = {
             log: output.log,
             error: (typeof output.error === 'function') ? output.error : output.log
         };
     };
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
      */
     let format = function format(date, level, fnLabel, msgArgs) {

         const l = (fnLabel === null || fnLabel === undefined) ? '' : ` ${fnLabel}`;
         return `${date.toISOString()} ${level}${l}: ${joinMsgArgs(msgArgs)}`;
     };


     /**
      * Create the log for writing.
      * @param  {string} levelName - The name of the level to log at.
      * @param  {...*} args        - The parameters of the original log.
      */
      function writeLog(levelName) {

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
      * @throws
      */
     logger.setFormatFunction = function setFormatFunction(newFormatFunction) {

         if (typeof newFormatFunction !== 'function') {
             throw Error('logger.setFormatFunction: expect a function as parameter.');
         }
         format = newFormatFunction;
     };


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
      * will be output.  The default level is 'info'.
      * @param {number} newLogLevel - The new level.
      * @throws
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
