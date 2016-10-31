
/**
 * Output logs to Console
 *
 * @constructor
 */
const ConsoleLogger = function () { };

ConsoleLogger.prototype.log = (m, obj) => {
    console.log(m);
    console.log(obj);
};

ConsoleLogger.prototype.error = (m, error) => {
    console.log(m);
    console.error(error);
};

ConsoleLogger.prototype.warn = (m, warn) => {
    console.log(m);
    console.warn(warn);
};

/**
 * Nothing to do
 *
 * @constructor
 */
const FakeLogger = function () { };

FakeLogger.prototype.log = (m, obj) => { };

FakeLogger.prototype.error = (m, error) => { };

FakeLogger.prototype.warn = (m, warn) => { };

module.exports.ConsoleLogger = ConsoleLogger;
module.exports.FakeLogger = FakeLogger;
