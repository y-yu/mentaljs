(function () {
    'use strict';

    /**
     * Output logs to Console
     *
     * @constructor
     */
    var ConsoleLogger = function () { };

    ConsoleLogger.prototype.log = function (m, obj) {
        console.log(m);
        console.log(obj);
    };

    ConsoleLogger.prototype.error = function (m, error) {
        console.log(m);
        console.error(error);
    };

    ConsoleLogger.prototype.warn = function (m, warn) {
        console.log(m);
        console.warn(warn);
    };

    /**
     * Nothing to do
     *
     * @constructor
     */
    var FakeLogger = function () { };

    FakeLogger.prototype.log = function (m, obj) { };

    FakeLogger.prototype.error = function (m, error) { };

    FakeLogger.prototype.warn = function (m, warn) { };

    module.exports.ConsoleLogger = ConsoleLogger;
    module.exports.FakeLogger = FakeLogger;
})();