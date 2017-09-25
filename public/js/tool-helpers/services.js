/**
 * Created by enea on 10/19/16.
 */

/**
 * Logger
 * @param message
 * @param object
 */
var log = function (message, object) {
    if (DEBUG) {
        if (typeof object === 'undefined')
            console.log('\n\nd: ' + new Date() + '  | ' + message);
        else
            console.log('\n\nd: ' + new Date() + '  | ' + message + ' ==> ', object);
    }
};