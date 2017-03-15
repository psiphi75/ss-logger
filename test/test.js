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

const createLogger = require('../');
const test = require('tape');

const noArgs = undefined;
const singleArg = ['This is a test.'];
function fn() { return 'zzz'; }
const multiArgs = [true, false, null, undefined, 11, 'You have an object:', { obj: 'a' }, '', [], [{ obj: { obj: 'b' } }], fn];
const multiArgsExpectedResult = 'true false null undefined 11 You have an object: {"obj":"a"}  [] [{"obj":{"obj":"b"}}] function fn() { return \'zzz\'; }';

function splitHeaderMessage(str) {
    const delimiter = ':';
    const start = 3;
    const arr = str.split(delimiter);
    const msg = arr.slice(start).join(delimiter);
    arr.splice(start);
    return {
        msg: msg.trim(),
        header: arr.join(delimiter).split(' ')
    };
}

function createResultObj(msg) {
    const split = splitHeaderMessage(msg);

    return {
        date: split.header[0],
        level: split.header[1],
        label: split.header[2],
        msg: split.msg
    };
}

function runTest(name, level, label, target, args, expectedResult,
                 expectAResult, debugLabel, setLevel) {

    test(name, (t) => {

        // If the log level is low, then we dont' expect a result
        if (expectAResult) {
            t.plan(5);
        } else {
            t.plan(0);
        }

        if (debugLabel) {
            process.env.DEBUG = debugLabel;
        }
        const log = createLogger(label);

        if (!isNaN(setLevel)) {
            log.setLevel(setLevel);
        }

        function result(resultTarget, resultMsg) {
            // Test the target is the correct
            t.equal(resultTarget, target, 'output');

            // Test the result is what we expected
            const resultObj = createResultObj(resultMsg);
            t.true(new Date(resultObj.date).getTime() <= new Date().getTime(), 'date is a date');
            t.equal(level, resultObj.level, 'log level');
            t.equal(label, resultObj.label, 'log label');
            t.equal(expectedResult, resultObj.msg, 'result message');

        }
        const fakeConsole = {
            log: msg => result('log', msg),
            error: msg => result('error', msg)
        };
        log.setOutput(fakeConsole);

        log[level].apply(log, args);
        if (debugLabel) {
            delete process.env.DEBUG;
        }

        t.end();
    });


}
runTest('Standard error', 'error', undefined, 'error', singleArg, singleArg[0], true);
runTest('Standard warn', 'warn', undefined, 'error', singleArg, singleArg[0], true);
runTest('Standard info', 'info', undefined, 'log', singleArg, singleArg[0], true);
runTest('Standard verbose', 'verbose', undefined, 'log', singleArg, singleArg[0], false);
runTest('Standard debug', 'debug', undefined, 'log', singleArg, singleArg[0], false);
runTest('Standard silly', 'silly', undefined, 'log', singleArg, singleArg[0], false);

runTest('Multi-arg error', 'error', undefined, 'error', multiArgs, multiArgsExpectedResult, true);
runTest('Multi-arg warn', 'warn', undefined, 'error', multiArgs, multiArgsExpectedResult, true);
runTest('Multi-arg info', 'info', undefined, 'log', multiArgs, multiArgsExpectedResult, true);
runTest('Multi-arg verbose', 'verbose', undefined, 'log', multiArgs, multiArgsExpectedResult, false);
runTest('Multi-arg debug', 'debug', undefined, 'log', multiArgs, multiArgsExpectedResult, false);
runTest('Multi-arg silly', 'silly', undefined, 'log', multiArgs, multiArgsExpectedResult, false);

runTest('noArgs error', 'error', undefined, 'error', noArgs, '', true);
runTest('noArgs warn', 'warn', undefined, 'error', noArgs, '', true);
runTest('noArgs info', 'info', undefined, 'log', noArgs, '', true);
runTest('noArgs verbose', 'verbose', undefined, 'log', noArgs, '', false);
runTest('noArgs debug', 'debug', undefined, 'log', noArgs, '', false);
runTest('noArgs silly', 'silly', undefined, 'log', noArgs, '', false);

runTest('Debug all error', 'error', undefined, 'error', singleArg, singleArg[0], true, '*');
runTest('Debug all warn', 'warn', undefined, 'error', singleArg, singleArg[0], true, '*');
runTest('Debug all info', 'info', undefined, 'log', singleArg, singleArg[0], true, '*');
runTest('Debug all verbose', 'verbose', undefined, 'log', singleArg, singleArg[0], true, '*');
runTest('Debug all debug', 'debug', undefined, 'log', singleArg, singleArg[0], true, '*');
runTest('Debug all silly', 'silly', undefined, 'log', singleArg, singleArg[0], false, '*');

runTest('Debug with correct label error', 'error', 'my-label', 'error', singleArg, singleArg[0], true, 'my-label');
runTest('Debug with correct label warn', 'warn', 'my-label', 'error', singleArg, singleArg[0], true, 'my-label');
runTest('Debug with correct label info', 'info', 'my-label', 'log', singleArg, singleArg[0], true, 'my-label');
runTest('Debug with correct label verbose', 'verbose', 'my-label', 'log', singleArg, singleArg[0], true, 'my-label');
runTest('Debug with correct label debug', 'debug', 'my-label', 'log', singleArg, singleArg[0], true, 'my-label');
runTest('Debug with correct label silly', 'silly', 'my-label', 'log', singleArg, singleArg[0], false, 'my-label');

runTest('Debug with incorrect label error', 'error', 'my-label', 'error', singleArg, singleArg[0], true, 'WRONG-my-label');
runTest('Debug with incorrect label warn', 'warn', 'my-label', 'error', singleArg, singleArg[0], true, 'WRONG-my-label');
runTest('Debug with incorrect label info', 'info', 'my-label', 'log', singleArg, singleArg[0], true, 'WRONG-my-label');
runTest('Debug with incorrect label verbose', 'verbose', 'my-label', 'log', singleArg, singleArg[0], false, 'WRONG-my-label');
runTest('Debug with incorrect label debug', 'debug', 'my-label', 'log', singleArg, singleArg[0], false, 'WRONG-my-label');
runTest('Debug with incorrect label silly', 'silly', 'my-label', 'log', singleArg, singleArg[0], false, 'WRONG-my-label');


Object.keys(createLogger.levels).forEach((setLevel, setLevelIndex) => {
    runTest(`Specific level: ${setLevel} at error`, 'error', undefined, 'error', singleArg, singleArg[0], true, undefined, setLevelIndex);
    runTest(`Specific level: ${setLevel} at warn`, 'warn', undefined, 'error', singleArg, singleArg[0], setLevelIndex >= 1, undefined, setLevelIndex);
    runTest(`Specific level: ${setLevel} at info`, 'info', undefined, 'log', singleArg, singleArg[0], setLevelIndex >= 2, undefined, setLevelIndex);
    runTest(`Specific level: ${setLevel} at verbose`, 'verbose', undefined, 'log', singleArg, singleArg[0], setLevelIndex >= 3, undefined, setLevelIndex);
    runTest(`Specific level: ${setLevel} at debug`, 'debug', undefined, 'log', singleArg, singleArg[0], setLevelIndex >= 4, undefined, setLevelIndex);
    runTest(`Specific level: ${setLevel} at silly`, 'silly', undefined, 'log', singleArg, singleArg[0], setLevelIndex >= 5, undefined, setLevelIndex);
});


test('Set setFormatFunction()', (t) => {
    t.plan(1);
    const log = createLogger('MY_LABEL');
    const testStr = 'Another info line.';
    const resultStr = 'INFO MY_LABEL=> Another info line.';

    function result(resultMsg) {

        t.equal(resultMsg, resultStr);

    }

    const fakeConsole = {
        log: msg => result(msg),
        error: msg => result(msg)
    };
    log.setOutput(fakeConsole);

    log.setFormatFunction(function testSetFormat() {
        const args = [].slice.call(arguments);
        args.splice(0, 1);
        const level = args.splice(0, 1)[0];
        const label = args.splice(0, 1)[0];
        const msg = args.toString();

        return `${level.toUpperCase()} ${label}=> ${msg}`;
    });
    log.info(testStr);
    t.end();

});

test('The correct errors are thrown', (t) => {
    t.plan(3);
    const log = createLogger();
    t.throws(log.setOutput, undefined, 'setOutput() errors when we give it invalid data.');
    t.throws(log.setLevel, undefined, 'setLevel() errors when we give it invalid data.');
    t.throws(log.setFormatFunction, undefined, 'setFormatFunction() errors when we give it invalid data.');
    t.end();
});
