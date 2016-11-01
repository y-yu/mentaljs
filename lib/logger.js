/**
 * Output logs to Console
 */
class ConsoleLogger {
    log(m, obj) {
        console.log(m);
        console.log(obj);
    }

    error(m, error) {
        console.log(m);
        console.error(error);
    }

    warn(m, warn) {
        console.log(m);
        console.warn(warn);
    }
}
/**
 * Nothing to do
 */
class FakeLogger {
    log(m, obj) { };

    error(m, error) { }

    warn(m, warn) { }
}

module.exports.ConsoleLogger = ConsoleLogger;
module.exports.FakeLogger = FakeLogger;
