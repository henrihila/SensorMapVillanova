/**
 * Created by henrihila on 10/5/17.
 */
'use strict';

const winston = require('winston');

/**
 * System logs - Winston Logger
 *
 */

let error = new winston.Logger({
    levels: {
        error: 0
    },
    transports: [
        new winston.transports.File({
            name: 'error-file',
            filename: 'error.log',
            level: 'error',
            timestamp: true,
            colorize: true,
            prettyPrint: true
        }),
        new winston.transports.Console({
            name: 'error-console',
            level: 'error',
            timestamp: true,
            colorize: true,
            prettyPrint: true
        })
    ]
});

let warn = new winston.Logger({
    levels: {
        warn: 1
    },
    transports: [
        new winston.transports.File({
            name: 'warn-file',
            filename: 'warn.log',
            level: 'warn',
            timestamp: true,
            colorize: true,
            prettyPrint: true
        }),
        new winston.transports.Console({
            name: 'warn-console',
            level: 'warn',
            timestamp: true,
            colorize: true,
            prettyPrint: true
        })
    ]
});

// let info = new winston.Logger({
//     levels: {
//         info: 2
//     },
//     transports: [
//         new (winston.transports.File)({
//             name: 'info-file',
//             filename: 'info.log',
//             level: 'info',
//             timestamp: true,
//             colorize: true,
//             prettyPrint: true
//         }),
//         new (winston.transports.Console)({
//             name: 'info-console',
//             level: 'info',
//             timestamp: true,
//             colorize: true,
//             prettyPrint: true
//         })
//     ]
// });
//
// let verbose = new winston.Logger({
//     levels: {
//         verbose: 3
//     },
//     transports: [
//         new (winston.transports.File)({
//             name: 'verbose-file',
//             filename: 'verbose.log',
//             level: 'verbose',
//             timestamp: true,
//             colorize: true,
//             prettyPrint: true
//         }),
//         new (winston.transports.Console)({
//             name: 'verbose-console',
//             level: 'verbose',
//             timestamp: true,
//             colorize: true,
//             prettyPrint: true
//         })
//     ]
// });
//
// let debug = new winston.Logger({
//     levels: {
//         debug: 4
//     },
//     transports: [
//         new (winston.transports.File)({
//             name: 'debug-file',
//             filename: 'debug.log',
//             level: 'debug',
//             timestamp: true,
//             colorize: true,
//             prettyPrint: true
//         }),
//         new (winston.transports.Console)({
//             name: 'debug-console',
//             level: 'debug',
//             timestamp: true,
//             colorize: true,
//             prettyPrint: true
//         })
//     ]
// });

let winstonLogger = {
    error: error,
    warn: warn,
    // info: info,
    // verbose: verbose,
    // debug: debug,
};

/**
 * System logs
 * @param lvl: The log level
 * @param meta
 */
// function log(lvl, ...meta) {
//
//     if (lvl === 'info' || lvl === 'error' || lvl === 'warn' || lvl === 'debug' || lvl === 'verbose') {
//         winstonLogger[lvl].log(lvl, ...meta);
//     } else {
//         winstonLogger['info'].log('info', lvl, ...meta);
//     }
// }

// exports.log = log;