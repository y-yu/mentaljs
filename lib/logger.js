/**
 * Output logs to Console
 */
class ConsoleLogger {
    constructor(c) {
        this._console = c;
    }

    log(m, obj) {
        this._console.log(new Date());
        this._console.log(m);
        this._console.log(obj);
    }

    error(m, error) {
        this._console.error(m);
        this._console.error(error);
    }

    warn(m, warn) {
        this._console.warn(m);
        this._console.warn(warn);
    }
}
/**
 * Nothing to do
 */
class FakeLogger {
    log(m, obj) { }

    error(m, error) { }

    warn(m, warn) { }
}

module.exports.ConsoleLogger = ConsoleLogger;
module.exports.FakeLogger = FakeLogger;
